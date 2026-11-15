#!/bin/bash
set -e

EXAMPLES_ROOT="../$(node -p "require('./scripts/examples-directory.cjs')")"

# Set dummy environment variables for build
export GoogleMapsAPIKey="dummy-google-maps-api-key"
export GoogleMapsMapId="dummy-google-maps-map-id"
export MapboxAccessToken="dummy-mapbox-access-token"

# rebuild modules from source
(
  cd ..
  yarn build
)

# Exercise the same playground schema generation as the deployment build.
(
  cd "$EXAMPLES_ROOT/playground"
  yarn
  yarn generate-schema
  node --test generate-schema.test.cjs
)
cp "$EXAMPLES_ROOT/playground/schema.generated.json" ./static/schema.generated.json

# Build the embedded v10 examples and their unpublished luma.gl peers.
yarn build-v10-examples

# clean up cache
docusaurus clear
docusaurus build
node ./scripts/normalize-llm-output.mjs
node ./scripts/check-llm-output.mjs

# build gallery (scripting) examples
(
  cd "$EXAMPLES_ROOT/gallery"
  yarn
  yarn build
)
