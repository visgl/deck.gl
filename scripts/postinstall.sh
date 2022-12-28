#!/bin/bash

npx babel node_modules/@mapbox/tiny-sdf/index.js > node_modules/@mapbox/tiny-sdf/index.cjs

cp node_modules/d3-array/dist/d3-array.js node_modules/d3-array/dist/d3-array.cjs
cp node_modules/d3-color/dist/d3-color.js node_modules/d3-color/dist/d3-color.cjs
cp node_modules/d3-format/dist/d3-format.js node_modules/d3-format/dist/d3-format.cjs
cp node_modules/d3-interpolate/dist/d3-interpolate.js node_modules/d3-interpolate/dist/d3-interpolate.cjs
cp node_modules/d3-scale/dist/d3-scale.js node_modules/d3-scale/dist/d3-scale.cjs
cp node_modules/d3-time/dist/d3-time.js node_modules/d3-time/dist/d3-time.cjs
cp node_modules/d3-time-format/dist/d3-time-format.js node_modules/d3-time-format/dist/d3-time-format.cjs

# Patch a bug in glsl-transpiler when running in strict mode.
# TODO: wait for https://github.com/stackgl/glsl-transpiler/pull/52
curl https://raw.githubusercontent.com/Pessimistress/glsl-transpiler/3cc1f3ac3dda48a8b7baf15f46561eaead80fd7c/lib/descriptor.js > node_modules/glsl-transpiler/lib/descriptor.js
