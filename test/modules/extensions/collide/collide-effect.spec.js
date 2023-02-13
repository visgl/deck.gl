import test from 'tape-promise/tape';
import {MapView, LayerManager} from 'deck.gl';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import {CollideExtension} from '@deck.gl/extensions';
import MaskEffect from '@deck.gl/extensions/mask/mask-effect';
import CollideEffect from '@deck.gl/extensions/collide/collide-effect';
import * as FIXTURES from 'deck.gl-test/data';
import {gl} from '@deck.gl/test-utils';
import {makeSpy} from '@probe.gl/test-utils';

const testViewport = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: -122, latitude: 37, zoom: 13}
});
const testViewport2 = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: -100, latitude: 37, zoom: 13}
});

const TEST_LAYER = new SolidPolygonLayer({
  data: FIXTURES.polygons.slice(0, 3),
  getPolygon: f => f,
  extensions: [new CollideExtension()],
  collideGroup: 'COLLIDE_GROUP'
});

const PRERENDEROPTIONS = {
  pass: 'screen',
  preRenderStats: {},
  viewports: [testViewport]
};

test('CollideEffect#constructor', t => {
  const collideEffect = new CollideEffect();
  t.ok(collideEffect, 'Collide effect created');
  t.ok(collideEffect.useInPicking, 'Collide effect enabled for picking render');
  t.deepEqual(collideEffect.collideFBOs, {}, 'Collide effect created with no passes');
  t.deepEqual(collideEffect.channels, [], 'Collide effect created with no channels');
  collideEffect.cleanup();
  t.end();
});

test('CollideEffect#cleanup', t => {
  const collideEffect = new CollideEffect();

  const layerManager = new LayerManager(gl, {viewport: testViewport});
  layerManager.setLayers([TEST_LAYER]);
  layerManager.updateLayers();

  collideEffect.preRender(gl, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    ...PRERENDEROPTIONS
  });

  t.ok(collideEffect.collidePass, 'CollidePass is created');
  t.ok(collideEffect.collideFBOs['COLLIDE_GROUP'], 'Collide FBO is created');
  t.ok(collideEffect.dummyCollideMap, 'Dummy collide map is created');
  t.ok(collideEffect.channels['COLLIDE_GROUP'], 'Channel is created');
  t.equal(collideEffect.lastViewport, testViewport, 'Last viewport is saved');

  collideEffect.cleanup();

  t.deepEqual(collideEffect.collideFBOs, {}, 'Collide FBOs is removed');
  t.notOk(collideEffect.dummyCollideMap, 'Dummy collide map is deleted');
  t.deepEqual(collideEffect.channels, {}, 'Channels are removed');
  t.notOk(collideEffect.lastViewport, 'Last viewport is deleted');

  t.end();
});

test('CollideEffect#update', t => {
  const collideEffect = new CollideEffect();

  const TEST_LAYER_2 = TEST_LAYER.clone({id: 'test-layer-2'});
  const TEST_LAYER_DIFFERENT_GROUP = TEST_LAYER.clone({
    id: 'test-layer-different-group',
    collideGroup: 'COLLIDE_GROUP_2'
  });

  const layerManager = new LayerManager(gl, {viewport: testViewport});

  const preRenderWithLayers = (layers, description) => {
    t.comment(description);
    layerManager.setLayers(layers);
    layerManager.updateLayers();

    collideEffect.preRender(gl, {
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      ...PRERENDEROPTIONS
    });
  };

  preRenderWithLayers([TEST_LAYER], 'Initial render');
  let parameters = collideEffect.getModuleParameters();
  t.equal(Object.keys(parameters.collideFBOs).length, 1, 'single collide map in parameters');
  t.ok(parameters.collideFBOs['COLLIDE_GROUP'], 'collide map is in parameters');
  t.ok(parameters.dummyCollideMap, 'dummy collide map is in parameters');

  preRenderWithLayers([TEST_LAYER, TEST_LAYER_2], 'Add second collide layer');
  parameters = collideEffect.getModuleParameters();
  t.equal(Object.keys(parameters.collideFBOs).length, 1, 'single collide map in parameters');
  t.ok(parameters.collideFBOs['COLLIDE_GROUP'], 'collide map is in parameters');
  t.ok(parameters.dummyCollideMap, 'dummy collide map is in parameters');

  preRenderWithLayers([TEST_LAYER_2], 'Remove first layer');
  parameters = collideEffect.getModuleParameters();
  t.equal(Object.keys(parameters.collideFBOs).length, 1, 'single collide map in parameters');
  t.ok(parameters.collideFBOs['COLLIDE_GROUP'], 'collide map is in parameters');
  t.ok(parameters.dummyCollideMap, 'dummy collide map is in parameters');

  preRenderWithLayers(
    [TEST_LAYER_2, TEST_LAYER_DIFFERENT_GROUP],
    'Add layer with different collide group'
  );
  parameters = collideEffect.getModuleParameters();
  t.equal(Object.keys(parameters.collideFBOs).length, 2, 'two collide maps in parameters');
  t.ok(parameters.collideFBOs['COLLIDE_GROUP'], 'collide map is in parameters');
  t.ok(parameters.collideFBOs['COLLIDE_GROUP_2'], 'collide map is in parameters');
  t.ok(parameters.dummyCollideMap, 'dummy collide map is in parameters');

  collideEffect.cleanup();
  t.end();
});

// Render test using makeSpy to check CollidePass.render is called including with didRender from Mask
test('CollideEffect#render', t => {
  const collideEffect = new CollideEffect();
  const layerManager = new LayerManager(gl, {viewport: testViewport});
  const TEST_LAYER_2 = TEST_LAYER.clone({id: 'test-layer-2'});

  const preRenderWithLayers = (layers, description, opts) => {
    t.comment(description);
    layerManager.setLayers(layers);
    layerManager.updateLayers();

    collideEffect.preRender(gl, {
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      ...PRERENDEROPTIONS,
      ...opts
    });
  };

  preRenderWithLayers([TEST_LAYER], 'Initial render');
  const collidePass = collideEffect.collidePass;
  t.ok(collidePass, 'collide pass created');
  const spy = makeSpy(collidePass, 'render');

  preRenderWithLayers([TEST_LAYER], 'Initial render');
  t.equal(spy.callCount, 0, 'Should not render if nothing changes');

  preRenderWithLayers([TEST_LAYER, TEST_LAYER_2], 'add one layer');
  t.equal(spy.callCount, 1, 'Should render when layer added');

  preRenderWithLayers([TEST_LAYER], 'remove one layer');
  t.equal(spy.callCount, 2, 'Should render when layer removed');

  preRenderWithLayers([TEST_LAYER], 'change viewport', {viewports: [testViewport2]});
  t.equal(spy.callCount, 3, 'Should render when viewport changes');

  preRenderWithLayers([TEST_LAYER], 'mask effect rendered', {
    viewports: [testViewport2],
    effects: [new MaskEffect()],
    preRenderStats: {'mask-effect': {didRender: true}}
  });
  t.equal(spy.callCount, 4, 'Should render when mask effect renders');

  preRenderWithLayers([TEST_LAYER], 'mask effect not rendered', {
    viewports: [testViewport2],
    effects: [new MaskEffect()],
    preRenderStats: {'mask-effect': {didRender: false}}
  });
  t.equal(spy.callCount, 4, 'Should not render when mask effect does not render');

  collideEffect.cleanup();
  t.end();
});
