#!/bin/sh
# Script to collect build size information

export PATH=$PATH:node_modules/.bin

# Get name from package.json
module=$(jq '.name' ./package.json)
# Get version from packag.json and remove quotes
version=$(jq '.version' ./package.json | awk '{ gsub(/"/,"",$1); printf "%-14s", $1 }')

echo
echo "\033[1mAutomatically collecting metrics for $module"
echo

echo "| Version        | Dist | Bundle         | Compressed     |"
echo "| ---            | ---  | ---            | ---            |"


NODE_ENV=production webpack --config test/webpack.config.js --hide-modules --env.import-nothing --env.bundle > /dev/null

# cp ./dist-es6/bundle*.js /tmp/bundle.js
# Size it
size=$(wc -c /tmp/bundle.js | awk '{ print int($1 / 1024) "KB (" $1 ")" }')
# Zip it
gzip -9f /tmp/bundle.js
# Size it again
zipsize=$(wc -c /tmp/bundle.js.gz | awk '{ print int($1 / 1024) "KB (" $1 ")" }')
# Remove our copy
rm /tmp/bundle.js.gz
# Print version, size, compressed size with markdown

echo "| $version | ESM  | $size | $zipsize |"


NODE_ENV=production webpack --config test/webpack.config.js --hide-modules --env.import-nothing --env.bundle --env.es5 > /dev/null

# cp ./dist/bundle*.js /tmp/bundle.js
# Size it
size=$(wc -c /tmp/bundle.js | awk '{ print int($1 / 1024) "KB (" $1 ")" }')
# Zip it
gzip -9f /tmp/bundle.js
# Size it again
zipsize=$(wc -c /tmp/bundle.js.gz | awk '{ print int($1 / 1024) "KB (" $1 ")" }')
# Remove our copy
rm /tmp/bundle.js.gz
# Print version, size, compressed size with markdown

echo "| $version | ES5  | $size | $zipsize |"
