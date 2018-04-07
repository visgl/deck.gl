#!/bin/sh
# Script to build this module

set -e

export PATH=$PATH:node_modules/.bin
PACKAGE_DIR=`pwd`

BUNDLE_SRC_DIR=../lite
BUNDLE_FILENAME=deckgl.min.js

# clean up
rm -rf dist
rm -rf $BUNDLE_FILENAME
mkdir dist

# build npm version
BABEL_ENV=es5 babel src --out-dir dist/es5 --source-maps
BABEL_ENV=es6 babel src --out-dir dist/es6 --source-maps
BABEL_ENV=esm babel src --out-dir dist/esm --source-maps

# build CDN version
cd $BUNDLE_SRC_DIR
webpack --config webpack.config.js --output-path $PACKAGE_DIR --output-filename $BUNDLE_FILENAME
cd -
