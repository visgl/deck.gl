// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  Viewport,
  WebMercatorViewport,
  _GlobeViewport as GlobeViewport,
  _SunLight as SunLight,
  LayerManager
} from '@deck.gl/core';
import {WGS84_CRS} from '@deck.gl/core/utils/crs';
import {OSM_TILE_CRS} from '@deck.gl/core/viewports/web-mercator-util';
import {PathLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {Matrix4} from '@math.gl/core';
import {createTestCRS} from './test-crs';

test('subdivision resolution defaults to zero and validates input', () => {
  for (const viewport of [new Viewport(), new GlobeViewport(), new WebMercatorViewport()]) {
    expect(viewport.resolution).toBe(0);
    expect(viewport.getSubdivisionStep(WGS84_CRS)).toBe(0);
  }
  for (const resolution of [-1, NaN, Infinity]) {
    expect(() => new GlobeViewport({resolution})).toThrow('resolution');
  }
});

test('subdivision converts earth circumference to geographic and linear source units', () => {
  const viewport = new GlobeViewport({resolution: 36});
  expect(viewport.getSubdivisionStep(WGS84_CRS)).toBeCloseTo(10, 12);
  expect(new GlobeViewport({resolution: 72}).getSubdivisionStep(WGS84_CRS)).toBeCloseTo(5, 12);
  expect(viewport.getSubdivisionStep(OSM_TILE_CRS)).toBeCloseTo(512 / 36, 12);
  const meters = createTestCRS({signature: 'meters'});
  const feet = createTestCRS({signature: 'feet', metersPerUnit: [0.3048, 0.3048, 0.3048]});
  const circumference = 2 * Math.PI * meters.ellipsoid!.semiMajorAxis;
  expect(viewport.getSubdivisionStep(meters)).toBeCloseTo(circumference / 36, 8);
  expect(viewport.getSubdivisionStep(feet)).toBeCloseTo(circumference / 36 / 0.3048, 8);
  const unequalAxes = createTestCRS({metersPerUnit: [1, 2, 1]});
  expect(viewport.getSubdivisionStep(unequalAxes)).toBeCloseTo(circumference / 36 / 2, 8);
  const otherEllipsoid = {...meters, ellipsoid: {semiMajorAxis: 7000000, semiMinorAxis: 6900000}};
  expect(viewport.getSubdivisionStep(otherEllipsoid)).toBeCloseTo((2 * Math.PI * 7000000) / 36, 8);
  expect(viewport.getSubdivisionStep({...meters, ellipsoid: undefined})).toBeCloseTo(
    circumference / 36,
    8
  );
});

test('subdivision is disabled for straight target-space paths and built-in Mercator geography', () => {
  const target = createTestCRS();
  expect(new Viewport({crs: target, resolution: 36}).getSubdivisionStep(target)).toBe(0);
  expect(new Viewport({resolution: 36}).getSubdivisionStep(WGS84_CRS)).toBe(0);
  const mercator = new WebMercatorViewport({resolution: 36});
  expect(mercator.getSubdivisionStep(WGS84_CRS)).toBe(0);
  expect(mercator.getSubdivisionStep(OSM_TILE_CRS)).toBe(0);
  expect(mercator.getSubdivisionStep(createTestCRS())).toBeGreaterThan(0);
});

test('tile-local paths account for the model matrix and rebuild when subdivision changes', () => {
  const viewport = new GlobeViewport({resolution: 36});
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  const layer = new PathLayer({
    coordinateSystem: 'OSMTile512',
    modelMatrix: new Matrix4().scale([256, 256, 1]),
    data: [
      [
        [0, 0],
        [1, 1]
      ]
    ],
    getPath: path => path
  });
  try {
    manager.setLayers([layer]);
    expect(layer.getSubdivisionStep()).toBeCloseTo(2 / 36, 12);
    const initialCount = layer.state.numInstances;
    expect(initialCount).toBeGreaterThan(2);
    const finer = new GlobeViewport({resolution: 72});
    manager.activateViewport(finer);
    layer.activateViewport(finer);
    manager.updateLayers();
    expect(layer.state.numInstances).toBeGreaterThan(initialCount);
    const disabled = new GlobeViewport();
    manager.activateViewport(disabled);
    layer.activateViewport(disabled);
    manager.updateLayers();
    expect(layer.state.numInstances).toBe(2);
  } finally {
    manager.finalize();
  }
});

test('sunlight identifies globe projection independently of subdivision', () => {
  const light = new SunLight({timestamp: 0});
  const directions = [0, 36].map(resolution => {
    const layer = new PathLayer();
    layer.context = {viewport: new GlobeViewport({resolution})} as typeof layer.context;
    return light.getProjectedLight({layer}).direction.slice();
  });
  expect(directions[0]).toEqual(directions[1]);
});
