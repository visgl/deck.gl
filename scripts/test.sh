#!/bin/sh
# Automated tests

set -e

MODE=$1

run_lint() {
  npm run lint
  markdownlint docs
}

run_full_test() {
  run_lint
  node test/start.js test
  node test/start.js test-browser
  node test/start.js render
}


case $MODE in
  "full")
    run_full_test;
    break;;

  "fast")
    npm run lint pre-commit
    node test/start.js test
    break;;

  "bench")
    node test/start.js bench
    node test/start.js bench-browser
    break;;

  "ci")
    # run by Travis CI
    node test/start.js test-ci
    npm run build
    npm run collect-metrics
    break;;

  "cover")
    NODE_ENV=test tape -r babel-register test/node.js
    nyc report
    break;;

  "dist")
    npm run build
    node test/start.js test-dist
    break;;

  "examples")
    node test/node-examples.js
    break;;

  "interaction")
    node test/interaction/node-interaction.js
    break;;

  "lint")
    run_lint
    break;;

  "size-es6")
    npm run build
    NODE_ENV=production webpack --config test/webpack.config.js --env.import-nothing --env.es6
    break;;

  *)
    # default test
    echo "test [ 'full' | fast' | 'bench' | 'ci' | 'cover' | 'examples' | 'lint' | size-es6' ]"
    echo "Running 'full' test by default"
    run_full_test
    ;;
  esac
