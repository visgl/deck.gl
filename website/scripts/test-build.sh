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
