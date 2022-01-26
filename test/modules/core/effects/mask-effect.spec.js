import test from 'tape-promise/tape';
import {MapView, LayerManager} from 'deck.gl';
import {SolidPolygonLayer} from '@deck.gl/layers';
import MaskEffect from '@deck.gl/core/effects/mask/mask-effect';
import * as FIXTURES from 'deck.gl-test/data';
import {gl} from '@deck.gl/test-utils';

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
  t.ok(maskEffect.empty, 'Mask effect disabled by default');
  maskEffect.cleanup();
  t.end();
});

test('MaskEffect#cleanup', t => {
  const maskEffect = new MaskEffect();

  const layerManager = new LayerManager(gl, {viewport: testViewport});
  layerManager.setLayers([TEST_MASK_LAYER, TEST_LAYER]);
  layerManager.updateLayers();

  maskEffect.preRender(gl, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport]
  });

  t.not(maskEffect.empty, 'Masking is enabled');
  t.ok(maskEffect.dummyMaskMap, 'Dummy mask map is created');
  t.ok(maskEffect.maskPass, 'Mask pass is created');
  t.ok(maskEffect.maskMap, 'Mask map is created');

  maskEffect.cleanup();

  t.ok(maskEffect.empty, 'Masking is disabled');
  t.notOk(maskEffect.dummyMaskMap, 'Dummy mask map is deleted');
  t.notOk(maskEffect.maskPass, 'Mask pass is deleted');
  t.notOk(maskEffect.maskMap, 'Mask map is deleted');

  t.end();
});

test('MaskEffect#update', t => {
  const maskEffect = new MaskEffect();

  const layerManager = new LayerManager(gl, {viewport: testViewport});
  layerManager.setLayers([TEST_MASK_LAYER, TEST_LAYER]);
  layerManager.updateLayers();

  maskEffect.preRender(gl, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport]
  });

  let parameters = maskEffect.getModuleParameters(TEST_LAYER);
  t.is(parameters.maskMap, maskEffect.maskMap, 'Mask map is in parameters');
  const bounds = parameters.maskBounds;
  t.ok(bounds.every(Number.isFinite), 'Mask bounds are populated');

  maskEffect.preRender(gl, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport]
  });

  parameters = maskEffect.getModuleParameters(TEST_LAYER);
  t.is(parameters.maskBounds, bounds, 'Using cached mask bounds');

  maskEffect.cleanup();
  t.end();
});
