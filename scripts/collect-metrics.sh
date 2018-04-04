#!/bin/sh
# Script to collect build size information

export PATH=$PATH:node_modules/.bin

# Get name from package.json
module=$(jq '.name' ./package.json)
# Get version from packag.json and remove quotes
version=$(jq '.version' ./package.json | awk '{ gsub(/"/,"",$1); printf "%-14s", $1 }')

# Helper functions

print_size_header() {
  echo "| Version        | Dist | Bundle Size        | Compressed     |"
  echo "| ---            | ---  | ---                | ---            |"
}

print_size() {
  DIST=$1
  # Size it
  size=$(wc -c /tmp/bundle.js | awk '{ print int($1 / 1024) "KB (" $1 ")" }')
  # Zip it
  gzip -9f /tmp/bundle.js
  # Size it again
  zipsize=$(wc -c /tmp/bundle.js.gz | awk '{ print int($1 / 1024) "KB (" $1 ")" }')  # Size it
  # Remove our copy
  rm /tmp/bundle.js.gz
  # Print version, size, compressed size with markdown

  echo "| $version | $DIST  | $size KB  | $zipsize KB     |"
}

build_bundle() {
  ENV=$1
  NODE_ENV=production webpack --config test/webpack.config.js --hide-modules --env.import-nothing --env.bundle --env.$ENV > /dev/null
}

# Main Script

echo
echo "\033[1mAutomatically collecting metrics for $module"
echo

print_size_header

build_bundle es6
print_size ES6

build_bundle esm
print_size ESM

build_bundle es5
print_size ES5

# Disable bold terminal font
echo "\033[0m"
