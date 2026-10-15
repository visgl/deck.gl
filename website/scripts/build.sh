#!/bin/bash
set -e

node scripts/validate-token.js
npm run write-heading-ids
npm pkg set version=$(node -p "require('../modules/core/package.json').version")

# staging or prod
MODE=$1
# Apply the staging prefix to both the embedded assets and Docusaurus pages.
if [ "$MODE" = "staging" ]; then
  export WEBSITE_BASE_URL=/deck.gl/
fi
WEBSITE_DIR=`pwd`
OUTPUT_DIR=build

# rebuild modules from source
(
  cd ..
  yarn build
)

# generate playground schema and publish it as a static website asset
(
  cd ../examples/playground
  yarn
  yarn generate-schema
)
cp ../examples/playground/schema.generated.json ./static/schema.generated.json

# Build the embedded v10 examples and their unpublished luma.gl peers.
yarn build-v10-examples

# clean up cache
docusaurus clear

case $MODE in
  "prod")
    docusaurus build
    ;;
  "staging")
    WEBSITE_BASE_URL=/deck.gl/ docusaurus build
    ;;
esac

# repair llms.txt / raw Markdown links for base-path deploys (WEBSITE_BASE_URL) and validate them
node ./scripts/normalize-llm-output.mjs
node ./scripts/check-llm-output.mjs

# transpile workers
BABEL_ENV=es5 npx babel ./static/workers --out-dir ./$OUTPUT_DIR/workers
BABEL_ENV=esm npx babel ../examples/pydeck/src/pyodide-worker.ts --out-file ./$OUTPUT_DIR/workers/pyodide-worker.mjs

# build gallery (scripting) examples
(
  cd ../examples/gallery
  yarn
  yarn build
)
mkdir $OUTPUT_DIR/gallery
cp -r ../examples/gallery/dist/* $OUTPUT_DIR/gallery/
