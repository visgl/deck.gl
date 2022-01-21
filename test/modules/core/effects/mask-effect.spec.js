import test from 'tape-promise/tape';
import {ProgramManager} from '@luma.gl/core';
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
  getPolygon: f => f,
  maskId: 'test-mask-layer'
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

  const layerManager = new LayerManager(gl, {viewport: testViewport});
  layerManager.setLayers([TEST_MASK_LAYER, TEST_LAYER]);
  layerManager.updateLayers();

  maskEffect.preRender(gl, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport]
  });

  t.ok(maskEffect.mask, 'Masking is enabled');
  t.ok(maskEffect.dummyMaskMap, 'Dummy mask map is created');
  t.ok(maskEffect.maskPass, 'Mask pass is created');
  t.ok(maskEffect.maskMap, 'Mask map is created');
  t.ok(maskEffect.maskProjectionMatrix, 'Mask projection matrix is created');

  const parameters = maskEffect.getModuleParameters(TEST_LAYER);
  t.is(parameters.dummyMaskMap, maskEffect.dummyMaskMap, 'Dummy mask map is in parameters');
  t.is(parameters.maskMap, maskEffect.maskMap, 'Mask map is in parameters');
  t.is(
    parameters.maskProjectionMatrix,
    maskEffect.maskProjectionMatrix,
    'Mask projection matrix is in parameters'
  );
  t.is(parameters.maskByInstance, false, 'maskByInstance inferred as false for SolidPolygonLayer');

  maskEffect.cleanup();
  t.end();
});

test('MaskEffect#maskId not matched', t => {
  const maskEffect = new MaskEffect();

  const layerManager = new LayerManager(gl, {viewport: testViewport});
  layerManager.setLayers([TEST_LAYER]);
  layerManager.updateLayers();

  t.throws(
    () => {
      maskEffect.preRender(gl, {
        layers: layerManager.getLayers(),
        onViewportActive: layerManager.activateViewport,
        viewports: [testViewport]
      });
    },
    /{maskId: 'test-mask-layer'} must match the id of another Layer/i,
    'maskId mismatch throws error'
  );

  maskEffect.cleanup();
  t.end();
});

test('MaskEffect#too many masks', t => {
  const maskEffect = new MaskEffect();

  const layer2 = TEST_LAYER.clone({maskId: 'another-mask-layer'});

  const layerManager = new LayerManager(gl, {viewport: testViewport});
  layerManager.setLayers([TEST_LAYER, layer2]);
  layerManager.updateLayers();

  t.throws(
    () => {
      maskEffect.preRender(gl, {
        layers: layerManager.getLayers(),
        onViewportActive: layerManager.activateViewport,
        viewports: [testViewport]
      });
    },
    /Only one mask layer supported, but multiple maskIds specified/i,
    'throws when more than one maskId is found in Layers'
  );

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

  t.ok(maskEffect.programManager, 'ProgramManager is obtained');
  t.ok(maskEffect.dummyMaskMap, 'Dummy mask map is created');
  t.ok(maskEffect.maskPass, 'Mask pass is created');
  t.ok(maskEffect.maskMap, 'Mask map is created');

  maskEffect.cleanup();
  t.notOk(maskEffect.programManager, 'ProgramManager is released');
  t.notOk(maskEffect.dummyMaskMap, 'MaskEffect cleans up dummy mask map');
  t.notOk(maskEffect.maskPass, 'MaskEffect cleans up mask pass');
  t.notOk(maskEffect.maskMap, 'MaskEffect cleans up mask map');
  t.end();
});

test('MaskEffect#mask module', t => {
  const maskEffect = new MaskEffect();

  const programManager = ProgramManager.getDefaultProgramManager(gl);
  const layerManager = new LayerManager(gl, {viewport: testViewport});
  layerManager.setLayers([TEST_MASK_LAYER, TEST_LAYER]);
  layerManager.updateLayers();

  maskEffect.preRender(gl, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport]
  });

  let defaultModules = programManager._defaultModules;
  let hasMask = defaultModules.some(m => m.name === 'mask');
  t.equal(hasMask, true, 'MaskEffect adds mask module to default correctly');

  maskEffect.cleanup();
  defaultModules = programManager._defaultModules;
  hasMask = defaultModules.some(m => m.name === 'mask');
  t.equal(hasMask, false, 'MaskEffect removes mask module to default correctly');
  t.end();
});
