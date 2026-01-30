// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {MapView, LayerManager} from 'deck.gl';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import MaskEffect from '@deck.gl/extensions/mask/mask-effect';
import CollisionFilterEffect from '@deck.gl/extensions/collision-filter/collision-filter-effect';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils';

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

test('CollisionFilterEffect#constructor', () => {
  const collisionFilterEffect = new CollisionFilterEffect();
  expect(collisionFilterEffect, 'Collision filter effect created').toBeTruthy();
  expect(
    collisionFilterEffect.useInPicking,
    'Collision filter effect enabled for picking render'
  ).toBeTruthy();
  expect(
    collisionFilterEffect.collisionFBOs,
    'Collision filter effect created with no passes'
  ).toEqual({});
  expect(
    collisionFilterEffect.channels,
    'Collision filter effect created with no channels'
  ).toEqual([]);
  collisionFilterEffect.cleanup();
});

test('CollisionFilterEffect#cleanup', () => {
  const collisionFilterEffect = new CollisionFilterEffect();

  const layerManager = new LayerManager(device, {viewport: testViewport});
  layerManager.setLayers([TEST_LAYER]);
  layerManager.updateLayers();

  collisionFilterEffect.setup({device});
  collisionFilterEffect.preRender({
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    ...PRERENDEROPTIONS
  });

  expect(collisionFilterEffect.collisionFilterPass, 'CollisionFilterPass is created').toBeTruthy();
  expect(
    collisionFilterEffect.collisionFBOs['COLLISION_GROUP'],
    'Collision FBO is created'
  ).toBeTruthy();
  expect(collisionFilterEffect.dummyCollisionMap, 'Dummy collision map is created').toBeTruthy();
  expect(collisionFilterEffect.channels['COLLISION_GROUP'], 'Channel is created').toBeTruthy();
  expect(collisionFilterEffect.lastViewport, 'Last viewport is saved').toBe(testViewport);

  collisionFilterEffect.cleanup();

  expect(collisionFilterEffect.collisionFBOs, 'Collision FBOs is removed').toEqual({});
  expect(collisionFilterEffect.dummyCollisionMap, 'Dummy collision map is deleted').toBeFalsy();
  expect(collisionFilterEffect.channels, 'Channels are removed').toEqual({});
  expect(collisionFilterEffect.lastViewport, 'Last viewport is deleted').toBeFalsy();

  layerManager.finalize();
});

test('CollisionFilterEffect#update', () => {
  const collisionFilterEffect = new CollisionFilterEffect();
  collisionFilterEffect.setup({device});

  const TEST_LAYER_2 = TEST_LAYER.clone({id: 'test-layer-2'});
  const TEST_LAYER_DIFFERENT_GROUP = TEST_LAYER.clone({
    id: 'test-layer-different-group',
    collisionGroup: 'COLLISION_GROUP_2'
  });

  const layerManager = new LayerManager(device, {viewport: testViewport});

  const preRenderWithLayers = (layers, description) => {
    console.log(description);
    layerManager.setLayers(layers);
    layerManager.updateLayers();

    collisionFilterEffect.preRender({
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      ...PRERENDEROPTIONS
    });
  };

  preRenderWithLayers([TEST_LAYER], 'Initial render');
  let parameters = collisionFilterEffect.getShaderModuleProps(TEST_LAYER).collision;
  expect(parameters.collisionFBO, 'collision map is in parameters').toBeTruthy();
  expect(parameters.dummyCollisionMap, 'dummy collision map is in parameters').toBeTruthy();

  preRenderWithLayers([TEST_LAYER, TEST_LAYER_2], 'Add second collision layer');
  parameters = collisionFilterEffect.getShaderModuleProps(TEST_LAYER).collision;
  expect(parameters.collisionFBO, 'collision map is in parameters').toBeTruthy();
  expect(parameters.dummyCollisionMap, 'dummy collision map is in parameters').toBeTruthy();
  parameters = collisionFilterEffect.getShaderModuleProps(TEST_LAYER_2).collision;
  expect(parameters.collisionFBO, 'collision map is in parameters').toBeTruthy();
  expect(parameters.dummyCollisionMap, 'dummy collision map is in parameters').toBeTruthy();

  preRenderWithLayers([TEST_LAYER_2], 'Remove first layer');
  parameters = collisionFilterEffect.getShaderModuleProps(TEST_LAYER_2).collision;
  expect(parameters.collisionFBO, 'collision map is in parameters').toBeTruthy();
  expect(parameters.dummyCollisionMap, 'dummy collision map is in parameters').toBeTruthy();

  preRenderWithLayers(
    [TEST_LAYER_2, TEST_LAYER_DIFFERENT_GROUP],
    'Add layer with different collision group'
  );
  parameters = collisionFilterEffect.getShaderModuleProps(TEST_LAYER_2).collision;
  expect(parameters.collisionFBO, 'collision map is in parameters').toBeTruthy();
  expect(parameters.dummyCollisionMap, 'dummy collision map is in parameters').toBeTruthy();
  parameters = collisionFilterEffect.getShaderModuleProps(TEST_LAYER_DIFFERENT_GROUP).collision;
  expect(parameters.collisionFBO, 'collision map is in parameters').toBeTruthy();
  expect(parameters.dummyCollisionMap, 'dummy collision map is in parameters').toBeTruthy();

  collisionFilterEffect.cleanup();
  layerManager.finalize();
});

// Render test using makeSpy to check CollisionFilterPass.render is called including with didRender from Mask
test('CollisionFilterEffect#render', () => {
  const collisionFilterEffect = new CollisionFilterEffect();
  collisionFilterEffect.setup({device});

  const layerManager = new LayerManager(device, {viewport: testViewport});
  const TEST_LAYER_2 = TEST_LAYER.clone({id: 'test-layer-2'});

  const preRenderWithLayers = (layers, description, opts) => {
    console.log(description);
    layerManager.setLayers(layers);
    layerManager.updateLayers();

    collisionFilterEffect.preRender({
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      ...PRERENDEROPTIONS,
      ...opts
    });
  };

  preRenderWithLayers([TEST_LAYER], 'Initial render');
  const collisionFilterPass = collisionFilterEffect.collisionFilterPass;
  expect(collisionFilterPass, 'CollisionFilterPass is created').toBeTruthy();
  const spy = vi.spyOn(collisionFilterPass, 'render');

  preRenderWithLayers([TEST_LAYER], 'Initial render');
  expect(spy.callCount, 'Should not render if nothing changes').toBe(0);

  preRenderWithLayers([TEST_LAYER, TEST_LAYER_2], 'add one layer');
  expect(spy.callCount, 'Should render when layer added').toBe(1);

  preRenderWithLayers([TEST_LAYER], 'remove one layer');
  expect(spy.callCount, 'Should render when layer removed').toBe(2);

  preRenderWithLayers([TEST_LAYER], 'change viewport', {viewports: [testViewport2]});
  expect(spy.callCount, 'Should render when viewport changes').toBe(3);

  TEST_LAYER._isLoadedOverride = false;
  preRenderWithLayers([TEST_LAYER], 'isLoaded changed', {viewports: [testViewport2]});
  expect(spy.callCount, 'Should render when isLoaded changes').toBe(4);

  preRenderWithLayers([TEST_LAYER], 'mask effect rendered', {
    viewports: [testViewport2],
    effects: [new MaskEffect()],
    preRenderStats: {'mask-effect': {didRender: true}}
  });
  expect(spy.callCount, 'Should render when mask effect renders').toBe(5);

  preRenderWithLayers([TEST_LAYER], 'mask effect not rendered', {
    viewports: [testViewport2],
    effects: [new MaskEffect()],
    preRenderStats: {'mask-effect': {didRender: false}}
  });
  expect(spy.callCount, 'Should not render when mask effect does not render').toBe(5);

  collisionFilterEffect.cleanup();
  layerManager.finalize();
});
