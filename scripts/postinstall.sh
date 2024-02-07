#!/bin/bash

# hammerjs has a baked-in AMD template that breaks esbuild's module resolution. Disable AMD
sed -i.bak 's/typeof define/undefined/' node_modules/hammerjs/hammer.js
