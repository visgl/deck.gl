#!/bin/sh
# Script to collect build size information

export PATH=$PATH:node_modules/.bin

version=$(jq '.version' ./package.json)

echo
echo "\033[1mAutomatically collecting metrics for $(jq '.name' ./package.json)"
echo

echo "| Version   | Dist | Bundle | Compressed |"
echo "| ---       | ---  | ---    | ---        |"


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

echo "| $version   | ESM  | $size KB | $zipsize KB     |"


NODE_ENV=production webpack --config test/webpack.config.js --hide-modules --env.import-nothing --env.bundle --env.es5 > /dev/null

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

echo "| $version   | ES5  | $size KB | $zipsize KB     |"
