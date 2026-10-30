// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {GPUPathLayer} from '@deck.gl/webgpu-layers/path-layer';
import {GPUPolygonLayer} from '@deck.gl/webgpu-layers/polygon-layer';
import {GPUSolidPolygonLayer} from '@deck.gl/webgpu-layers/solid-polygon-layer';
import {GPUTextLayer} from '@deck.gl/webgpu-layers/text-layer';

test('WebGPU layer subpaths expose the existing counterparts', () => {
  expect(GPUPathLayer.layerName).toBe('GPUPathLayer');
  expect(GPUPolygonLayer.layerName).toBe('GPUPolygonLayer');
  expect(GPUSolidPolygonLayer.layerName).toBe('GPUSolidPolygonLayer');
  expect(GPUTextLayer.layerName).toBe('GPUTextLayer');
});
