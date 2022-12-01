import test from 'tape-promise/tape';
import {MapView, LayerManager} from 'deck.gl';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import MaskEffect from '@deck.gl/extensions/mask/mask-effect';
import CollisionFilterEffect from '@deck.gl/extensions/collision-filter/collision-filter-effect';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils';
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

class TestLayer extends SolidPolygonLayer {
  get isLoaded() {
    return this._isLoadedOverride === undefined ? super.isLoaded : this._isLoadedOverride;
  }
}

const TEST_LAYER = new TestLayer({
  data: FIXTURES.polygons.slice(0, 3),
  getPolygon: f => f,
  extensions: [new CollisionFilterExtension()],
  collisionGroup: 'COLLISION_GROUP'
});

const PRERENDEROPTIONS = {
  pass: 'screen',
  preRenderStats: {},
  viewports: [testViewport]
};

test('CollisionFilterEffect#constructor', t => {
  const collisionFilterEffect = new CollisionFilterEffect();
  t.ok(collisionFilterEffect, 'Collision filter effect created');
  t.ok(collisionFilterEffect.useInPicking, 'Collision filter effect enabled for picking render');
  t.deepEqual(
    collisionFilterEffect.collisionFBOs,
    {},
    'Collision filter effect created with no passes'
  );
  t.deepEqual(
    collisionFilterEffect.channels,
    [],
    'Collision filter effect created with no channels'
  );
  collisionFilterEffect.cleanup();
  t.end();
});

test('CollisionFilterEffect#cleanup', t => {
  const collisionFilterEffect = new CollisionFilterEffect();

  const layerManager = new LayerManager(device, {viewport: testViewport});
  layerManager.setLayers([TEST_LAYER]);
  layerManager.updateLayers();

  collisionFilterEffect.preRender(device, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    ...PRERENDEROPTIONS
  });

  t.ok(collisionFilterEffect.collisionFilterPass, 'CollisionFilterPass is created');
  t.ok(collisionFilterEffect.collisionFBOs['COLLISION_GROUP'], 'Collision FBO is created');
  t.ok(collisionFilterEffect.dummyCollisionMap, 'Dummy collision map is created');
  t.ok(collisionFilterEffect.channels['COLLISION_GROUP'], 'Channel is created');
  t.equal(collisionFilterEffect.lastViewport, testViewport, 'Last viewport is saved');

  collisionFilterEffect.cleanup();

  t.deepEqual(collisionFilterEffect.collisionFBOs, {}, 'Collision FBOs is removed');
  t.notOk(collisionFilterEffect.dummyCollisionMap, 'Dummy collision map is deleted');
  t.deepEqual(collisionFilterEffect.channels, {}, 'Channels are removed');
  t.notOk(collisionFilterEffect.lastViewport, 'Last viewport is deleted');

  t.end();
});

test('CollisionFilterEffect#update', t => {
  const collisionFilterEffect = new CollisionFilterEffect();

  const TEST_LAYER_2 = TEST_LAYER.clone({id: 'test-layer-2'});
  const TEST_LAYER_DIFFERENT_GROUP = TEST_LAYER.clone({
    id: 'test-layer-different-group',
    collisionGroup: 'COLLISION_GROUP_2'
  });

  const layerManager = new LayerManager(device, {viewport: testViewport});

  const preRenderWithLayers = (layers, description) => {
    t.comment(description);
    layerManager.setLayers(layers);
    layerManager.updateLayers();

    collisionFilterEffect.preRender(device, {
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      ...PRERENDEROPTIONS
    });
  };

  preRenderWithLayers([TEST_LAYER], 'Initial render');
  let parameters = collisionFilterEffect.getModuleParameters(TEST_LAYER);
  t.ok(parameters.collisionFBO, 'collision map is in parameters');
  t.ok(parameters.dummyCollisionMap, 'dummy collision map is in parameters');

  preRenderWithLayers([TEST_LAYER, TEST_LAYER_2], 'Add second collision layer');
  parameters = collisionFilterEffect.getModuleParameters(TEST_LAYER);
  t.ok(parameters.collisionFBO, 'collision map is in parameters');
  t.ok(parameters.dummyCollisionMap, 'dummy collision map is in parameters');
  parameters = collisionFilterEffect.getModuleParameters(TEST_LAYER_2);
  t.ok(parameters.collisionFBO, 'collision map is in parameters');
  t.ok(parameters.dummyCollisionMap, 'dummy collision map is in parameters');

  preRenderWithLayers([TEST_LAYER_2], 'Remove first layer');
  parameters = collisionFilterEffect.getModuleParameters(TEST_LAYER_2);
  t.ok(parameters.collisionFBO, 'collision map is in parameters');
  t.ok(parameters.dummyCollisionMap, 'dummy collision map is in parameters');

  preRenderWithLayers(
    [TEST_LAYER_2, TEST_LAYER_DIFFERENT_GROUP],
    'Add layer with different collision group'
  );
  parameters = collisionFilterEffect.getModuleParameters(TEST_LAYER_2);
  t.ok(parameters.collisionFBO, 'collision map is in parameters');
  t.ok(parameters.dummyCollisionMap, 'dummy collision map is in parameters');
  parameters = collisionFilterEffect.getModuleParameters(TEST_LAYER_DIFFERENT_GROUP);
  t.ok(parameters.collisionFBO, 'collision map is in parameters');
  t.ok(parameters.dummyCollisionMap, 'dummy collision map is in parameters');

  collisionFilterEffect.cleanup();
  t.end();
});

// Render test using makeSpy to check CollisionFilterPass.render is called including with didRender from Mask
test('CollisionFilterEffect#render', t => {
  const collisionFilterEffect = new CollisionFilterEffect();
  const layerManager = new LayerManager(device, {viewport: testViewport});
  const TEST_LAYER_2 = TEST_LAYER.clone({id: 'test-layer-2'});

  const preRenderWithLayers = (layers, description, opts) => {
    t.comment(description);
    layerManager.setLayers(layers);
    layerManager.updateLayers();

    collisionFilterEffect.preRender(device, {
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      ...PRERENDEROPTIONS,
      ...opts
    });
  };

  preRenderWithLayers([TEST_LAYER], 'Initial render');
  const collisionFilterPass = collisionFilterEffect.collisionFilterPass;
  t.ok(collisionFilterPass, 'CollisionFilterPass is created');
  const spy = makeSpy(collisionFilterPass, 'render');

  preRenderWithLayers([TEST_LAYER], 'Initial render');
  t.equal(spy.callCount, 0, 'Should not render if nothing changes');

  preRenderWithLayers([TEST_LAYER, TEST_LAYER_2], 'add one layer');
  t.equal(spy.callCount, 1, 'Should render when layer added');

  preRenderWithLayers([TEST_LAYER], 'remove one layer');
  t.equal(spy.callCount, 2, 'Should render when layer removed');

  preRenderWithLayers([TEST_LAYER], 'change viewport', {viewports: [testViewport2]});
  t.equal(spy.callCount, 3, 'Should render when viewport changes');

  TEST_LAYER._isLoadedOverride = false;
  preRenderWithLayers([TEST_LAYER], 'isLoaded changed', {viewports: [testViewport2]});
  t.equal(spy.callCount, 4, 'Should render when isLoaded changes');

  preRenderWithLayers([TEST_LAYER], 'mask effect rendered', {
    viewports: [testViewport2],
    effects: [new MaskEffect()],
    preRenderStats: {'mask-effect': {didRender: true}}
  });
  t.equal(spy.callCount, 5, 'Should render when mask effect renders');

  preRenderWithLayers([TEST_LAYER], 'mask effect not rendered', {
    viewports: [testViewport2],
    effects: [new MaskEffect()],
    preRenderStats: {'mask-effect': {didRender: false}}
  });
  t.equal(spy.callCount, 5, 'Should not render when mask effect does not render');

  collisionFilterEffect.cleanup();
  t.end();
});
