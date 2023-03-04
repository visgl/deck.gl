#!/bin/bash
set -e

node scripts/validate-token.js
npm run write-heading-ids

# staging or prod
MODE=$1
WEBSITE_DIR=`pwd`
OUTPUT_DIR=build

# clean up cache
docusaurus clear

case $MODE in
  "prod")
    docusaurus build
    ;;
  "staging")
    STAGING=true docusaurus build
    ;;
esac

# transpile workers
(
  cd ..
  BABEL_ENV=es5 npx babel ./website/static/workers --out-dir ./website/$OUTPUT_DIR/workers
)

# build gallery (scripting) examples
(
  cd ../examples/gallery
  yarn
  yarn build
)
mkdir $OUTPUT_DIR/gallery
cp -r ../examples/gallery/dist/* $OUTPUT_DIR/gallery/
