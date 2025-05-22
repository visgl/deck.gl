#!/bin/bash
set -e

# rebuild modules from source
(
  cd ..
  yarn build
)

# clean up cache
docusaurus clear
docusaurus build

# build gallery (scripting) examples
(
  cd ../examples/gallery
  yarn
  yarn build
)
