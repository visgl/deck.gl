// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  MapView,
  LayerManager,
  _GlobeView as GlobeView,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import MaskEffect from '@deck.gl/extensions/mask/mask-effect';
import {lngLatToMercatorCommon} from '@deck.gl/extensions/utils/projection-utils';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils/vitest';

const testViewport = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: -122, latitude: 37, zoom: 13}
});

// GlobeView hands off to WebMercatorViewport above zoom 12; zoom 10 exercises GlobeViewport
const globeViewport = new GlobeView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: -122, latitude: 37, zoom: 10}
});

const TEST_MASK_LAYER = new SolidPolygonLayer({
  id: 'test-mask-layer',
  data: {polygon: FIXTURES.polygons[0]},
  operation: 'mask'
});

const TEST_LAYER = new SolidPolygonLayer({
  data: FIXTURES.polygons.slice(0, 3),
  getPolygon: f => f
});

test('MaskEffect#constructor', () => {
  const maskEffect = new MaskEffect();
  expect(maskEffect, 'Mask effect created').toBeTruthy();
  expect(maskEffect.useInPicking, 'Mask effect enabled for picking render').toBeTruthy();
  expect(maskEffect.masks).not.toBe('Mask effect disabled by default');
  maskEffect.cleanup();
});

test('MaskEffect#setup, cleanup', () => {
  const maskEffect = new MaskEffect();

  const layerManager = new LayerManager(device, {viewport: testViewport});
  layerManager.setLayers([TEST_MASK_LAYER, TEST_LAYER]);
  layerManager.updateLayers();

  maskEffect.setup({device});
  maskEffect.preRender({
    pass: 'screen',
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport]
  });

  expect(maskEffect.masks, 'Masking is enabled').toBeTruthy();
  expect(maskEffect.dummyMaskMap, 'Dummy mask map is created').toBeTruthy();
  expect(maskEffect.maskPass, 'Mask pass is created').toBeTruthy();
  expect(maskEffect.maskMap, 'Mask map is created').toBeTruthy();

  maskEffect.cleanup();

  expect(maskEffect.masks, 'Masking is disabled').toBeFalsy();
  expect(maskEffect.dummyMaskMap, 'Dummy mask map is deleted').toBeFalsy();
  expect(maskEffect.maskPass, 'Mask pass is deleted').toBeFalsy();
  expect(maskEffect.maskMap, 'Mask map is deleted').toBeFalsy();

  layerManager.finalize();
});

/* eslint-disable max-statements */
test('MaskEffect#update', () => {
  const maskEffect = new MaskEffect();
  maskEffect.setup({device});

  const TEST_MASK_LAYER2 = TEST_MASK_LAYER.clone({id: 'test-mask-layer-2'});
  const TEST_MASK_LAYER2_ALT = TEST_MASK_LAYER.clone({
    id: 'test-mask-layer-2',
    data: [{polygon: FIXTURES.polygons[1]}]
  });
  const TEST_MASK_LAYER3 = TEST_MASK_LAYER.clone({id: 'test-mask-layer-3'});

  const layerManager = new LayerManager(device, {viewport: testViewport});

  const preRenderWithLayers = (layers, description) => {
    console.log(description);
    layerManager.setLayers(layers);
    layerManager.updateLayers();
    maskEffect.preRender({
      pass: 'screen',
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      viewports: [testViewport]
    });
  };

  preRenderWithLayers([TEST_MASK_LAYER, TEST_LAYER], 'Initial render');

  let parameters = maskEffect.getShaderModuleProps(TEST_LAYER).mask;
  expect(parameters.maskMap, 'Mask map is in parameters').toBe(maskEffect.maskMap);
  let mask = parameters.maskChannels['test-mask-layer'];
  expect(mask?.index, 'Mask is rendered in channel 0').toBe(0);
  expect(mask?.bounds, 'Mask has bounds').toBeTruthy();
  let bounds = mask.bounds;

  preRenderWithLayers([TEST_MASK_LAYER, TEST_LAYER, TEST_MASK_LAYER2], 'Add second mask');

  parameters = maskEffect.getShaderModuleProps(TEST_LAYER).mask;
  mask = parameters.maskChannels['test-mask-layer'];
  expect(mask?.index, 'Mask is rendered in channel 0').toBe(0);
  expect(mask?.bounds, 'Using cached mask bounds').toBe(bounds);
  mask = parameters.maskChannels['test-mask-layer-2'];
  expect(mask?.bounds, 'Second mask has bounds').toBeTruthy();
  expect(mask?.index, 'Second mask is rendered in channel 1').toBe(1);
  bounds = mask.bounds;

  preRenderWithLayers([TEST_LAYER, TEST_MASK_LAYER2], 'Remove first mask');

  parameters = maskEffect.getShaderModuleProps(TEST_LAYER).mask;
  mask = parameters.maskChannels['test-mask-layer'];
  expect(mask, 'Mask is removed').toBeFalsy();
  mask = parameters.maskChannels['test-mask-layer-2'];
  expect(mask?.index, 'Second mask is rendered in channel 1').toBe(1);
  expect(mask?.bounds, 'Using cached mask bounds').toBe(bounds);

  preRenderWithLayers(
    [TEST_LAYER, TEST_MASK_LAYER2_ALT, TEST_MASK_LAYER3],
    'Update second mask, add third'
  );

  parameters = maskEffect.getShaderModuleProps(TEST_LAYER).mask;
  mask = parameters.maskChannels['test-mask-layer-2'];
  expect(mask?.index, 'Second mask is rendered in channel 1').toBe(1);
  expect(mask?.bounds, 'Second mask is updated').not.toBe(bounds);
  mask = parameters.maskChannels['test-mask-layer-3'];
  expect(mask?.index, 'New mask is rendered in channel 0').toBe(0);

  maskEffect.cleanup();
  layerManager.finalize();
});

test('MaskEffect#globe', () => {
  expect(globeViewport, 'Test viewport is a GlobeViewport').toBeInstanceOf(GlobeViewport);

  const maskEffect = new MaskEffect();
  maskEffect.setup({device});

  const polygon = FIXTURES.polygons[0];
  const GLOBE_MASK_LAYER = new SolidPolygonLayer({
    id: 'globe-mask-layer',
    data: [polygon],
    getPolygon: f => f,
    operation: 'mask'
  });

  const layerManager = new LayerManager(device, {viewport: globeViewport});
  layerManager.setLayers([GLOBE_MASK_LAYER, TEST_LAYER]);
  layerManager.updateLayers();
  maskEffect.preRender({
    pass: 'screen',
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [globeViewport]
  });

  const mask = maskEffect.getShaderModuleProps().mask.maskChannels?.['globe-mask-layer'];
  expect(mask, 'Mask is rendered under GlobeViewport').toBeTruthy();
  const bounds = mask.bounds;
  expect(bounds.every(Number.isFinite), 'Mask bounds are finite').toBe(true);
  expect(bounds[0] < bounds[2] && bounds[1] < bounds[3], 'Mask bounds are ordered').toBe(true);

  // The mask texture is rendered in a flat Mercator viewport fitted to the polygon (border of
  // 1px in 2048), so its lng/lat bounds must contain the polygon and hug it in one dimension
  const positions: number[][] = [];
  const collect = c => (typeof c[0] === 'number' ? positions.push(c) : c.forEach(collect));
  collect(polygon);
  const lngs = positions.map(p => p[0]);
  const lats = positions.map(p => p[1]);
  const polygonBounds = [
    Math.min(...lngs),
    Math.min(...lats),
    Math.max(...lngs),
    Math.max(...lats)
  ];
  expect(bounds[0] <= polygonBounds[0], 'Mask bounds contain polygon (min lng)').toBe(true);
  expect(bounds[1] <= polygonBounds[1], 'Mask bounds contain polygon (min lat)').toBe(true);
  expect(bounds[2] >= polygonBounds[2], 'Mask bounds contain polygon (max lng)').toBe(true);
  expect(bounds[3] >= polygonBounds[3], 'Mask bounds contain polygon (max lat)').toBe(true);

  const [bx0, by0] = lngLatToMercatorCommon([bounds[0], bounds[1]]);
  const [bx1, by1] = lngLatToMercatorCommon([bounds[2], bounds[3]]);
  const [px0, py0] = lngLatToMercatorCommon([polygonBounds[0], polygonBounds[1]]);
  const [px1, py1] = lngLatToMercatorCommon([polygonBounds[2], polygonBounds[3]]);
  const fit = Math.min((bx1 - bx0) / (px1 - px0), (by1 - by0) / (py1 - py0));
  expect(fit, 'Mask viewport is fitted to the polygon in Mercator space').toBeCloseTo(1, 2);

  maskEffect.cleanup();
  layerManager.finalize();
});

test('MaskEffect#coordinates', () => {
  const maskEffect = new MaskEffect();
  maskEffect.setup({device});

  const TEST_MASK_LAYER_CARTESIAN = TEST_MASK_LAYER.clone({
    coordinateOrigin: [1, 2, 3],
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  });

  const layerManager = new LayerManager(device, {viewport: testViewport});

  const preRenderWithLayers = (layers, description) => {
    console.log(description);
    layerManager.setLayers(layers);
    layerManager.updateLayers();

    maskEffect.preRender({
      pass: 'screen',
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      viewports: [testViewport]
    });
  };

  preRenderWithLayers([TEST_MASK_LAYER, TEST_LAYER], 'Initial render');

  let parameters = maskEffect.getShaderModuleProps(TEST_LAYER).mask;
  let mask = parameters.maskChannels['test-mask-layer'];
  expect(mask?.coordinateOrigin, 'Mask has correct coordinate origin').toEqual([0, 0, 0]);
  expect(mask?.coordinateSystem, 'Mask has correct coordinate system').toBe(
    COORDINATE_SYSTEM.DEFAULT
  );

  preRenderWithLayers([TEST_MASK_LAYER_CARTESIAN, TEST_LAYER], 'Update to cartesion coordinates');

  parameters = maskEffect.getShaderModuleProps(TEST_LAYER).mask;
  mask = parameters.maskChannels['test-mask-layer'];
  expect(mask?.coordinateOrigin, 'Mask has correct coordinate origin').toEqual([1, 2, 3]);
  expect(mask?.coordinateSystem, 'Mask has correct coordinate system').toBe(
    COORDINATE_SYSTEM.CARTESIAN
  );

  maskEffect.cleanup();
  layerManager.finalize();
});
