Setup
  $ . ${TESTDIR}/../../../../helpers/setup.sh
  $ . ${TESTDIR}/../../_helpers/setup_monorepo.sh $(pwd) single_package "yarn@1.22.17"
  $ rm -rf package-lock.json || true # exists because of setup.sh script above
  $ yarn install > /dev/null 2>&1
Run dos2unix on Windows for newly generated lockfile.
  $ if [[ "$OSTYPE" == "msys" ]]; then dos2unix --quiet yarn.lock; fi
  $ git commit --quiet -am "Update lockfile" # clean git state

Check
  $ ${TURBO} run build
  \xe2\x80\xa2 Running build (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  build: cache miss, executing 551563378a0c0a7e
  build: yarn run v1.22.17
  build: warning package.json: No license field
  build: $ echo building > foo.txt
  build: Done in \s*[\.0-9]+m?s\. (re)
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
  $ ${TURBO} run build
  \xe2\x80\xa2 Running build (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  build: cache hit, replaying logs 551563378a0c0a7e
  build: yarn run v1.22.17
  build: warning package.json: No license field
  build: $ echo building > foo.txt
  build: Done in \s*[\.0-9]+m?s\. (re)
  
   Tasks:    1 successful, 1 total
  Cached:    1 cached, 1 total
    Time:\s*[\.0-9]+m?s >>> FULL TURBO (re)
  