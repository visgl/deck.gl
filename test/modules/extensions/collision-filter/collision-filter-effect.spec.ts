// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {MapView, LayerManager} from 'deck.gl';

import {ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import MaskEffect from '@deck.gl/extensions/mask/mask-effect';
import CollisionFilterEffect from '@deck.gl/extensions/collision-filter/collision-filter-effect';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils/vitest';

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
  ).toEqual({});
  collisionFilterEffect.cleanup();
});

test('CollisionFilterEffect#visibility capacity', () => {
  const collisionFilterEffect = new CollisionFilterEffect();
  const limitsSpy = vi.spyOn(device, 'limits', 'get').mockReturnValue({
    ...device.limits,
    maxTextureDimension2D: 8
  });
  // Separate data, so that the layers are separate collision sources
  const textLayer = TEST_LAYER.clone({
    id: 'text',
    data: FIXTURES.polygons.slice(0, 3),
    getCollisionRect: () => [0, 0, 1, 1]
  });
  const otherLayer = TEST_LAYER.clone({id: 'other', data: FIXTURES.polygons.slice(0, 3)});
  vi.spyOn(textLayer, 'getNumInstances').mockReturnValue(1);
  const countSpy = vi.spyOn(otherLayer, 'getNumInstances').mockReturnValue(2);
  const group = TEST_LAYER.props.collisionGroup;

  try {
    // Three objects plus the reserved zero ID fill all four atlas cells.
    collisionFilterEffect._groupByCollisionGroup(device, [otherLayer, textLayer]);
    const visibilityFBO = collisionFilterEffect.visibilityFBOs[group];
    const collisionFBO = collisionFilterEffect.collisionFBOs[group];
    expect([visibilityFBO.width, visibilityFBO.height]).toEqual([8, 8]);
    expect(collisionFilterEffect.getShaderModuleProps(textLayer).collision.enabled).toBe(true);

    const resizeSpy = vi.spyOn(visibilityFBO, 'resize');
    const destroyVisibilitySpy = vi.spyOn(visibilityFBO, 'destroy');
    const destroyCollisionSpy = vi.spyOn(collisionFBO, 'destroy');
    countSpy.mockReturnValue(3);
    expect(
      Object.keys(collisionFilterEffect._groupByCollisionGroup(device, [otherLayer, textLayer]))
    ).toEqual([]);
    expect(resizeSpy).not.toHaveBeenCalled();
    expect(destroyVisibilitySpy).toHaveBeenCalledOnce();
    expect(destroyCollisionSpy).toHaveBeenCalledOnce();
    expect(collisionFilterEffect.channels[group]).toBeUndefined();
    for (const layer of [otherLayer, textLayer]) {
      expect(collisionFilterEffect.getShaderModuleProps(layer).collision.enabled).toBe(false);
    }

    // A rejected group must also be safe when it has no existing resources.
    const createTextureSpy = vi.spyOn(device, 'createTexture');
    collisionFilterEffect._groupByCollisionGroup(device, [otherLayer, textLayer]);
    expect(createTextureSpy).not.toHaveBeenCalled();

    countSpy.mockReturnValue(2);
    collisionFilterEffect._groupByCollisionGroup(device, [otherLayer, textLayer]);
    expect(collisionFilterEffect.getShaderModuleProps(textLayer).collision.enabled).toBe(true);
    expect(collisionFilterEffect.visibilityFBOs[group]).not.toBe(visibilityFBO);
    expect(collisionFilterEffect.channels[group].objectCount).toBe(3);
  } finally {
    collisionFilterEffect.cleanup();
    limitsSpy.mockRestore();
    vi.restoreAllMocks();
  }
});

test('CollisionFilterEffect#picking ID capacity', () => {
  const collisionFilterEffect = new CollisionFilterEffect();
  // Separate data, so that the layers are separate collision sources
  const firstLayer = TEST_LAYER.clone({id: 'first', data: FIXTURES.polygons.slice(0, 3)});
  const secondLayer = TEST_LAYER.clone({id: 'second', data: FIXTURES.polygons.slice(0, 3)});
  vi.spyOn(firstLayer, 'getNumInstances').mockReturnValue(0xfffffe);
  const countSpy = vi.spyOn(secondLayer, 'getNumInstances').mockReturnValue(1);
  const group = TEST_LAYER.props.collisionGroup;

  try {
    collisionFilterEffect._groupByCollisionGroup(device, [firstLayer, secondLayer]);
    expect(collisionFilterEffect.channels[group].objectCount).toBe(0xffffff);
    expect(collisionFilterEffect.getShaderModuleProps(secondLayer).collision.enabled).toBe(true);

    countSpy.mockReturnValue(2);
    expect(
      Object.keys(collisionFilterEffect._groupByCollisionGroup(device, [firstLayer, secondLayer]))
    ).toEqual([]);
    expect(collisionFilterEffect.channels[group]).toBeUndefined();
    expect(collisionFilterEffect.getShaderModuleProps(secondLayer).collision.enabled).toBe(false);
  } finally {
    collisionFilterEffect.cleanup();
    vi.restoreAllMocks();
  }
});

test('CollisionFilterEffect#object count', () => {
  const collisionFilterEffect = new CollisionFilterEffect();
  const layerManager = new LayerManager(device, {viewport: testViewport});
  layerManager.setLayers([TEST_LAYER]);
  layerManager.updateLayers();
  const [layer] = layerManager.getLayers();

  try {
    // Picking colors are per polygon, not per vertex
    expect(layer.getNumInstances()).toBeGreaterThan(3);
    collisionFilterEffect._groupByCollisionGroup(device, [layer]);
    expect(collisionFilterEffect.channels[TEST_LAYER.props.collisionGroup].objectCount).toBe(3);
  } finally {
    collisionFilterEffect.cleanup();
    layerManager.finalize();
  }
});

test.each([
  {title: 'tightly packed', rowIndexes: {value: new Uint32Array([5, 9]), size: 1}, expected: 10},
  {
    // Only the values the layer reads count: 0 and 1, not the skipped 0xffffff
    title: 'strided',
    rowIndexes: {value: new Uint32Array([0, 0xffffff, 1, 0xffffff]), size: 1, stride: 8},
    expected: 2
  },
  {
    title: 'offset',
    rowIndexes: {value: new Uint32Array([0xffffff, 3, 4]), size: 1, offset: 4},
    expected: 5
  },
  {
    title: 'longer than the data',
    rowIndexes: {value: new Uint32Array([5, 9, 0xffffff]), size: 1},
    expected: 10
  }
])('CollisionFilterEffect#binary row indexes, $title', ({rowIndexes, expected}) => {
  const collisionFilterEffect = new CollisionFilterEffect();
  const layerManager = new LayerManager(device, {viewport: testViewport});
  // Binary GeoJSON encodes picking colors from global feature ids, which can exceed the count
  layerManager.setLayers([
    new ScatterplotLayer({
      id: 'binary-points',
      data: {
        length: 2,
        attributes: {
          getPosition: {value: new Float32Array([0, 0, 0, 1, 1, 1]), size: 3},
          rowIndexes
        }
      },
      extensions: [new CollisionFilterExtension()],
      collisionGroup: 'COLLISION_GROUP'
    })
  ]);
  layerManager.updateLayers();

  try {
    collisionFilterEffect._groupByCollisionGroup(device, layerManager.getLayers());
    expect(collisionFilterEffect.channels['COLLISION_GROUP'].objectCount).toBe(expected);
  } finally {
    collisionFilterEffect.cleanup();
    layerManager.finalize();
  }
});

test('CollisionFilterEffect#redraws when object counts change', () => {
  const collisionFilterEffect = new CollisionFilterEffect();
  collisionFilterEffect.setup({device});
  const layerManager = new LayerManager(device, {viewport: testViewport});
  layerManager.setLayers([TEST_LAYER]);
  layerManager.updateLayers();
  const [layer] = layerManager.getLayers();
  const preRender = () =>
    collisionFilterEffect.preRender({
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport,
      ...PRERENDEROPTIONS
    });
  const renderSpy = vi.spyOn(collisionFilterEffect.collisionFilterPass, 'renderCollisionMap');

  try {
    preRender();
    preRender();
    expect(renderSpy, 'unchanged inputs are not redrawn').toHaveBeenCalledOnce();
    // Picking colors, and the visibility map size, depend on the object count
    vi.spyOn(layer, 'getStartIndices').mockReturnValue([0, 1, 2, 3, 4, 5]);
    preRender();
    expect(renderSpy).toHaveBeenCalledTimes(2);
  } finally {
    collisionFilterEffect.cleanup();
    layerManager.finalize();
  }
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
  expect(spy, 'Should not render if nothing changes').toHaveBeenCalledTimes(0);

  preRenderWithLayers([TEST_LAYER, TEST_LAYER_2], 'add one layer');
  expect(spy, 'Should render when layer added').toHaveBeenCalledTimes(1);

  preRenderWithLayers([TEST_LAYER], 'remove one layer');
  expect(spy, 'Should render when layer removed').toHaveBeenCalledTimes(2);

  preRenderWithLayers([TEST_LAYER], 'change viewport', {viewports: [testViewport2]});
  expect(spy, 'Should render when viewport changes').toHaveBeenCalledTimes(3);

  TEST_LAYER._isLoadedOverride = false;
  preRenderWithLayers([TEST_LAYER], 'isLoaded changed', {viewports: [testViewport2]});
  expect(spy, 'Should render when isLoaded changes').toHaveBeenCalledTimes(4);

  preRenderWithLayers([TEST_LAYER], 'mask effect rendered', {
    viewports: [testViewport2],
    effects: [new MaskEffect()],
    preRenderStats: {'mask-effect': {didRender: true}}
  });
  expect(spy, 'Should render when mask effect renders').toHaveBeenCalledTimes(5);

  preRenderWithLayers([TEST_LAYER], 'mask effect not rendered', {
    viewports: [testViewport2],
    effects: [new MaskEffect()],
    preRenderStats: {'mask-effect': {didRender: false}}
  });
  expect(spy, 'Should not render when mask effect does not render').toHaveBeenCalledTimes(5);

  const [width, height] = device.canvasContext!.getDrawingBufferSize();
  const sizeSpy = vi
    .spyOn(device.canvasContext!, 'getDrawingBufferSize')
    .mockReturnValue([width * 2, height * 2]);
  preRenderWithLayers([TEST_LAYER], 'canvas resized', {viewports: [testViewport2]});
  expect(spy, 'Should render when canvas size changes').toHaveBeenCalledTimes(6);
  const collisionFBO = collisionFilterEffect.collisionFBOs['COLLISION_GROUP'];
  expect(
    [collisionFBO.width, collisionFBO.height],
    'Collision FBO is sized from the drawing buffer'
  ).toEqual([width, height]);

  preRenderWithLayers([TEST_LAYER], 'canvas size unchanged', {viewports: [testViewport2]});
  expect(spy, 'Should not render when canvas size is unchanged').toHaveBeenCalledTimes(6);
  sizeSpy.mockRestore();

  collisionFilterEffect.cleanup();
  layerManager.finalize();
});
