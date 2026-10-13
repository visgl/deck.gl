#!/bin/bash
set -e

# Set dummy environment variables for build
export GoogleMapsAPIKey="dummy-google-maps-api-key"
export GoogleMapsMapId="dummy-google-maps-map-id"
export MapboxAccessToken="dummy-mapbox-access-token"

# rebuild modules from source
(
  cd ..
  yarn build
)

# Build the embedded v10 examples and their unpublished luma.gl peers.
yarn build-v10-examples

# clean up cache
docusaurus clear
docusaurus build
node ./scripts/normalize-llm-output.mjs
node ./scripts/check-llm-output.mjs

# build gallery (scripting) examples
(
  cd ../examples/gallery
  yarn
  yarn build
)
