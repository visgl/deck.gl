#!/bin/bash
# npm install -g pbf
# npm install -g cjs-to-es6

pbf carto-dynamic-tile.proto | sed 's/^var[^=]*= //g' > carto-dynamic-tile.js
cjs-to-es6 carto-dynamic-tile.js
