// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
for (const [path, name] of [
  ['path-layer', 'GPUPathLayer'],
  ['polygon-layer', 'GPUPolygonLayer'],
  ['solid-polygon-layer', 'GPUSolidPolygonLayer'],
  ['text-layer', 'GPUTextLayer']
]) {
  const specifier = `@deck.gl/proposed-layers/${path}`;
  const esm = await import(specifier);
  const commonjs = require(specifier);
  assert.equal(esm[name]?.layerName, name);
  assert.equal(commonjs[name]?.layerName, name);
}
