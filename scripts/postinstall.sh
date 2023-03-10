#!/bin/bash

# Add commonjs entry points to pure ESM modules. Needed by running node tests.
npx babel node_modules/@mapbox/tiny-sdf/index.js > node_modules/@mapbox/tiny-sdf/index.cjs

cp node_modules/d3-array/dist/d3-array.js node_modules/d3-array/dist/d3-array.cjs
cp node_modules/d3-color/dist/d3-color.js node_modules/d3-color/dist/d3-color.cjs
cp node_modules/d3-format/dist/d3-format.js node_modules/d3-format/dist/d3-format.cjs
cp node_modules/d3-interpolate/dist/d3-interpolate.js node_modules/d3-interpolate/dist/d3-interpolate.cjs
cp node_modules/d3-scale/dist/d3-scale.js node_modules/d3-scale/dist/d3-scale.cjs
cp node_modules/d3-time/dist/d3-time.js node_modules/d3-time/dist/d3-time.cjs
cp node_modules/d3-time-format/dist/d3-time-format.js node_modules/d3-time-format/dist/d3-time-format.cjs

# hammerjs has a baked-in AMD template that breaks esbuild's module resolution. Disable AMD
sed -i.bak 's/typeof define/undefined/' node_modules/hammerjs/hammer.js
