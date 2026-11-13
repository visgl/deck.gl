// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {StoragePathLayer} from '@deck.gl/proposals/layers/path-layer';
import {StoragePolygonLayer} from '@deck.gl/proposals/layers/polygon-layer';
import {StorageSolidPolygonLayer} from '@deck.gl/proposals/layers/solid-polygon-layer';
import {StorageTextLayer} from '@deck.gl/proposals/layers/text-layer';

test('WebGPU layer subpaths expose the existing counterparts', () => {
  expect(StoragePathLayer.layerName).toBe('StoragePathLayer');
  expect(StoragePolygonLayer.layerName).toBe('StoragePolygonLayer');
  expect(StorageSolidPolygonLayer.layerName).toBe('StorageSolidPolygonLayer');
  expect(StorageTextLayer.layerName).toBe('StorageTextLayer');
});
