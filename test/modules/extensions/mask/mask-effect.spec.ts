// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {MapView, LayerManager} from '@deck.gl/core';

import {SolidPolygonLayer} from '@deck.gl/layers';
import MaskEffect from '@deck.gl/extensions/mask/mask-effect';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils/vitest';

const testViewport = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: -122, latitude: 37, zoom: 13}
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

test('MaskEffect publishes the mask viewport bounds regardless of source coordinates', () => {
  const maskEffect = new MaskEffect();
  maskEffect.setup({device});
  const render = vi.spyOn(maskEffect.maskPass, 'render');
  const layerManager = new LayerManager(device, {viewport: testViewport});
  const masks = [
    TEST_MASK_LAYER.clone({
      data: [
        {
          polygon: [
            [-122, 37],
            [-121.999, 37],
            [-121.999, 37.001],
            [-122, 37.001]
          ]
        }
      ]
    }),
    TEST_MASK_LAYER.clone({
      coordinateSystem: 'meter-offsets',
      coordinateOrigin: [-122, 37, 0],
      data: [
        {
          polygon: [
            [0, 0],
            [100, 0],
            [100, 100],
            [0, 100]
          ]
        }
      ]
    })
  ];
  try {
    for (const layer of masks) {
      layerManager.setLayers([layer]);
      maskEffect.preRender({
        pass: 'screen',
        layers: layerManager.getLayers(),
        onViewportActive: layerManager.activateViewport,
        viewports: [testViewport]
      });
      const mask = maskEffect.getShaderModuleProps().mask.maskChannels!['test-mask-layer'];
      const maskViewport = render.mock.lastCall![0].viewports[0];
      expect(maskViewport).toBeTruthy();
      expect(mask.bounds).toEqual(maskViewport.getBounds());
    }
  } finally {
    maskEffect.cleanup();
    layerManager.finalize();
  }
});
