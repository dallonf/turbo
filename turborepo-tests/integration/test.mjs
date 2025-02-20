import { execSync } from "child_process";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.replace(/[^/\\]*$/, "");

const VENV_NAME = ".cram_env";

// disable package manager update notifiers
process.env.NO_UPDATE_NOTIFIER = 1;

const isWindows = process.platform === "win32";

// Make virtualenv
execSync(`python3 -m venv ${VENV_NAME}`);

// Upgrade pip
execSync(`${getVenvBin("python3")} -m pip install --quiet --upgrade pip`);

// Install prysk
execSync(`${getVenvBin("pip")} install "prysk==0.15.2"`);

// Which tests do we want to run?
let testArg = process.argv[2] ? process.argv[2] : "";
testArg = isWindows ? testArg.replaceAll("/", path.sep) : testArg;
const tests = path.join("tests", testArg);

const flags = [
  "--shell=bash",
  process.env.PRYSK_INTERACTIVE === "true" ? "--interactive" : "",
  isWindows ? "--dos2unix" : "",
].join(" ");

const cmd = [getVenvBin("prysk"), flags, tests].join(" ");
console.log(`Running ${cmd}`);

try {
  execSync(cmd, { stdio: "inherit", env: process.env });
} catch (e) {
  // Swallow the node error stack trace. stdio: inherit should
  // already have the test failures printed. We don't need the Node.js
  // execution to also print its stack trace from execSync.
  process.exit(1);
}

function getVenvBin(tool) {
  const allowedVenvTools = ["python3", "pip", "prysk"];
  if (!allowedVenvTools.includes(tool)) {
    throw new Error(`Tool not allowed: ${tool}`);
  }

  const suffix = isWindows ? ".exe" : "";

  const venvPath = path.join(__dirname, VENV_NAME);
  const venvBin = isWindows
    ? path.join(venvPath, "Scripts")
    : path.join(venvPath, "bin");

  return path.join(venvBin, tool + suffix);
}
