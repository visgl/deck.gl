import test from 'tape-promise/tape';
import {MapView, LayerManager} from '@deck.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import MaskEffect from '@deck.gl/extensions/mask/mask-effect';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils';

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

test('MaskEffect#constructor', t => {
  const maskEffect = new MaskEffect();
  t.ok(maskEffect, 'Mask effect created');
  t.ok(maskEffect.useInPicking, 'Mask effect enabled for picking render');
  t.not(maskEffect.masks, 'Mask effect disabled by default');
  maskEffect.cleanup();
  t.end();
});

test('MaskEffect#cleanup', t => {
  const maskEffect = new MaskEffect();

  const layerManager = new LayerManager(device, {viewport: testViewport});
  layerManager.setLayers([TEST_MASK_LAYER, TEST_LAYER]);
  layerManager.updateLayers();

  maskEffect.preRender(gl, {
    pass: 'screen',
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport]
  });

  t.ok(maskEffect.masks, 'Masking is enabled');
  t.ok(maskEffect.dummyMaskMap, 'Dummy mask map is created');
  t.ok(maskEffect.maskPass, 'Mask pass is created');
  t.ok(maskEffect.maskMap, 'Mask map is created');

  maskEffect.cleanup();

  t.notOk(maskEffect.masks, 'Masking is disabled');
  t.notOk(maskEffect.dummyMaskMap, 'Dummy mask map is deleted');
  t.notOk(maskEffect.maskPass, 'Mask pass is deleted');
  t.notOk(maskEffect.maskMap, 'Mask map is deleted');

  t.end();
});

/* eslint-disable max-statements */
test('MaskEffect#update', t => {
  const maskEffect = new MaskEffect();

  const TEST_MASK_LAYER2 = TEST_MASK_LAYER.clone({id: 'test-mask-layer-2'});
  const TEST_MASK_LAYER2_ALT = TEST_MASK_LAYER.clone({
    id: 'test-mask-layer-2',
    data: [{polygon: FIXTURES.polygons[1]}]
  });
  const TEST_MASK_LAYER3 = TEST_MASK_LAYER.clone({id: 'test-mask-layer-3'});

  const layerManager = new LayerManager(device, {viewport: testViewport});

  const preRenderWithLayers = (layers, description) => {
    t.comment(description);
    layerManager.setLayers(layers);
    layerManager.updateLayers();

    maskEffect.preRender(gl, {
      pass: 'screen',
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      viewports: [testViewport]
    });
  };

  preRenderWithLayers([TEST_MASK_LAYER, TEST_LAYER], 'Initial render');

  let parameters = maskEffect.getModuleParameters(TEST_LAYER);
  t.is(parameters.maskMap, maskEffect.maskMap, 'Mask map is in parameters');
  let mask = parameters.maskChannels['test-mask-layer'];
  t.is(mask?.index, 0, 'Mask is rendered in channel 0');
  t.ok(mask?.bounds, 'Mask has bounds');
  let bounds = mask.bounds;

  preRenderWithLayers([TEST_MASK_LAYER, TEST_LAYER, TEST_MASK_LAYER2], 'Add second mask');

  parameters = maskEffect.getModuleParameters(TEST_LAYER);
  mask = parameters.maskChannels['test-mask-layer'];
  t.is(mask?.index, 0, 'Mask is rendered in channel 0');
  t.is(mask?.bounds, bounds, 'Using cached mask bounds');
  mask = parameters.maskChannels['test-mask-layer-2'];
  t.ok(mask?.bounds, 'Second mask has bounds');
  t.is(mask?.index, 1, 'Second mask is rendered in channel 1');
  bounds = mask.bounds;

  preRenderWithLayers([TEST_LAYER, TEST_MASK_LAYER2], 'Remove first mask');

  parameters = maskEffect.getModuleParameters(TEST_LAYER);
  mask = parameters.maskChannels['test-mask-layer'];
  t.notOk(mask, 'Mask is removed');
  mask = parameters.maskChannels['test-mask-layer-2'];
  t.is(mask?.index, 1, 'Second mask is rendered in channel 1');
  t.is(mask?.bounds, bounds, 'Using cached mask bounds');

  preRenderWithLayers(
    [TEST_LAYER, TEST_MASK_LAYER2_ALT, TEST_MASK_LAYER3],
    'Update second mask, add third'
  );

  parameters = maskEffect.getModuleParameters(TEST_LAYER);
  mask = parameters.maskChannels['test-mask-layer-2'];
  t.is(mask?.index, 1, 'Second mask is rendered in channel 1');
  t.not(mask?.bounds, bounds, 'Second mask is updated');
  mask = parameters.maskChannels['test-mask-layer-3'];
  t.is(mask?.index, 0, 'New mask is rendered in channel 0');

  maskEffect.cleanup();
  t.end();
});

test('MaskEffect#coordinates', t => {
  const maskEffect = new MaskEffect();

  const TEST_MASK_LAYER_CARTESIAN = TEST_MASK_LAYER.clone({
    coordinateOrigin: [1, 2, 3],
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  });

  const layerManager = new LayerManager(device, {viewport: testViewport});

  const preRenderWithLayers = (layers, description) => {
    t.comment(description);
    layerManager.setLayers(layers);
    layerManager.updateLayers();

    maskEffect.preRender(gl, {
      pass: 'screen',
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      viewports: [testViewport]
    });
  };

  preRenderWithLayers([TEST_MASK_LAYER, TEST_LAYER], 'Initial render');

  let parameters = maskEffect.getModuleParameters(TEST_LAYER);
  let mask = parameters.maskChannels['test-mask-layer'];
  t.same(mask?.coordinateOrigin, [0, 0, 0], 'Mask has correct coordinate origin');
  t.is(mask?.coordinateSystem, COORDINATE_SYSTEM.DEFAULT, 'Mask has correct coordinate system');

  preRenderWithLayers([TEST_MASK_LAYER_CARTESIAN, TEST_LAYER], 'Update to cartesion coordinates');

  parameters = maskEffect.getModuleParameters(TEST_LAYER);
  mask = parameters.maskChannels['test-mask-layer'];
  t.same(mask?.coordinateOrigin, [1, 2, 3], 'Mask has correct coordinate origin');
  t.is(mask?.coordinateSystem, COORDINATE_SYSTEM.CARTESIAN, 'Mask has correct coordinate system');

  maskEffect.cleanup();
  t.end();
});
