#!/bin/sh
# Script to build this module

set -e

export PATH=$PATH:node_modules/.bin


# clean up
rm -rf dist
mkdir dist

# build CDN version
webpack --config webpack.config.js

# build npm version
cp ../../node_modules/react-map-gl/src/mapbox/mapbox.js src

BABEL_ENV=es5 babel src --out-dir dist/es5
BABEL_ENV=es6 babel src --out-dir dist/es6
BABEL_ENV=esm babel src --out-dir dist/esm

rm src/mapbox.js

# copy package.json
cp package.json dist/package.json
