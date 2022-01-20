import test from 'tape-promise/tape';
import MaskEffect from '@deck.gl/core/effects/mask/mask-effect';
import {MapView, LayerManager} from 'deck.gl';
import {SolidPolygonLayer} from '@deck.gl/layers';
import * as FIXTURES from 'deck.gl-test/data';

import {gl} from '@deck.gl/test-utils';

const testViewport = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: -122, latitude: 37, zoom: 13}
});

test('MaskEffect#constructor', t => {
  const maskEffect = new MaskEffect();
  t.ok(maskEffect, 'Mask effect created');
  t.ok(maskEffect.enableForPicking, 'Mask effect enabled for picking render');
  t.equal(maskEffect.mask, false, 'Mask effect disabled by default');
  maskEffect.cleanup();
  t.end();
});

test('MaskEffect#getModuleParameters', t => {
  const maskEffect = new MaskEffect();

  const maskLayer = new SolidPolygonLayer({
    id: 'test-mask-layer',
    data: {polygon: FIXTURES.polygons[0]},
    operation: 'mask',
    getFillColor: [255, 255, 255, 255]
  });
  const layer = new SolidPolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0],
    maskId: 'test-mask-layer'
  });

  const layerManager = new LayerManager(gl, {viewport: testViewport});
  layerManager.setLayers([maskLayer, layer]);
  layerManager.updateLayers();

  maskEffect.preRender(gl, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport],
    pixelRatio: 1
  });

  t.ok(maskEffect.mask, 'Masking is enabled');
  t.ok(maskEffect.dummyMaskMap, 'Dummy mask map is created');
  t.ok(maskEffect.maskPass, 'Mask pass is created');
  t.ok(maskEffect.maskMap, 'Mask map is created');
  t.ok(maskEffect.maskProjectionMatrix, 'Mask projection matrix is created');

  const parameters = maskEffect.getModuleParameters(layer);
  t.is(parameters.dummyMaskMap, maskEffect.dummyMaskMap, 'Dummy mask map is in parameters');
  t.is(parameters.maskMap, maskEffect.maskMap, 'Mask map is in parameters');
  t.is(
    parameters.maskProjectionMatrix,
    maskEffect.maskProjectionMatrix,
    'Mask projection matrix is in parameters'
  );
  t.is(parameters.maskByInstance, false, 'maskByInstance inferred as false for SolidPolygonLayer');
  t.is(parameters.maskByInstance, false, 'maskByInstance inferred as false for SolidPolygonLayer');
  t.is(parameters.maskEnabled, true, 'maskEnabled added to parameters');

  maskEffect.cleanup();
  t.end();
});
