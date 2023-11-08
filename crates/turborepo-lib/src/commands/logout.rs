use tracing::error;
use turborepo_auth::{logout as auth_logout, read_or_create_auth_file};

use crate::{cli::Error, commands::CommandBase};

// TODO(voz): Move this to auth crate, more than likely.
pub async fn logout(base: &mut CommandBase) -> Result<(), Error> {
    let client = base.api_client()?;
    let auth_path = base.global_auth_path()?;
    let config_path = base.global_config_path()?;

    let mut auth_file = read_or_create_auth_file(&auth_path, &config_path, &client).await?;

    // If there's only a single token, don't prompt.
    if auth_file.tokens.len() == 1 {
        println!(
            "Removing token: {}",
            auth_file.tokens[0].friendly_token_display()
        );

        auth_file.tokens.remove(0);
        if let Err(err) = auth_file.write_to_disk(&auth_path) {
            error!("could not logout. Something went wrong: {}", err);
            return Err(Error::Auth(err));
        }
        return Ok(());
    }

    // Change how tokens are displayed for logout to make it nicer to read.
    // I am very human.
    let items = &auth_file
        .tokens
        .iter()
        .map(|t| {
            format!(
                "{} ({})",
                t.friendly_api_display(),
                t.friendly_token_display()
            )
        })
        .collect::<Vec<_>>();

    let index = base
        .ui
        .display_selectable_items("Select api to log out of:", items)
        .unwrap();

    println!(
        "Removing token: {}",
        auth_file.tokens[index].friendly_token_display()
    );

    auth_file.tokens.remove(index);
    if let Err(err) = auth_file.write_to_disk(&auth_path) {
        error!("could not logout. Something went wrong: {}", err);
        return Err(Error::Auth(err));
    }

    auth_logout(&base.ui);

    Ok(())
}
