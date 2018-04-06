#!/bin/sh
# Automated tests

set -e

MODE=$1

npm run lint

case $MODE in
  "fast")
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

  "size-es6")
    npm run build
    NODE_ENV=production webpack --config test/webpack.config.js --env.import-nothing --env.es6
    break;;

  *)
    # default test
    node test/start.js test
    node test/start.js test-browser
    node test/start.js render
    ;;
esac
