#!/bin/sh
# Script to collect build size information

export PATH=$PATH:node_modules/.bin

# Get version from packag.json and remove quotes
version=$(jq '.version' ./package.json | awk '{ gsub(/"/,"",$1); print }')
# Get name from package.json
module=$(jq '.name' ./package.json)
echo
echo "\033[1mAutomatically collecting metrics for $module"
echo

echo "| Version       | Dist | Bundle | Compressed |"
echo "| ---           | ---  | ---    | ---        |"


NODE_ENV=production webpack --config test/webpack.config.js --hide-modules --env.import-nothing --env.bundle --env.es6 > /dev/null

# cp ./dist/bundle*.js /tmp/bundle.js
# Size it
size=$(du -k /tmp/bundle.js | awk '{ print $1 }')
# Zip it
gzip -9f /tmp/bundle.js
# Size it again
zipsize=$(du -k /tmp/bundle.js.gz | awk '{ print $1 }')
# Remove our copy
rm /tmp/bundle.js.gz
# Print version, size, compressed size with markdown

echo "| $version | ES6  | $size KB | $zipsize KB     |"


NODE_ENV=production webpack --config test/webpack.config.js --hide-modules --env.import-nothing --env.bundle > /dev/null

# cp ./dist/bundle*.js /tmp/bundle.js
# Size it
size=$(du -k /tmp/bundle.js | awk '{ print $1 }')
# Zip it
gzip -9f /tmp/bundle.js
# Size it again
zipsize=$(du -k /tmp/bundle.js.gz | awk '{ print $1 }')
# Remove our copy
rm /tmp/bundle.js.gz
# Print version, size, compressed size with markdown

echo "| $version | ESM  | $size KB | $zipsize KB     |"
