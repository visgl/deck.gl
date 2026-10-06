// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {CompositeLayer, Deck, Layer, WebMercatorViewport} from '@deck.gl/core';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';
import {TerrainEffect} from '@deck.gl/extensions/terrain/terrain-effect';
import {TERRAIN_MODE} from '@deck.gl/extensions/terrain/shader-module';
import {GeoJsonLayer, ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {TerrainLoader} from '@loaders.gl/terrain';

import type {Framebuffer} from '@luma.gl/core';
import type {ExternalTerrain} from '@deck.gl/extensions/terrain/external-terrain';

import {device, getLayerUniforms} from '@deck.gl/test-utils/vitest';
import {geojson} from 'deck.gl-test/data';
import {LifecycleTester} from '../utils';

test('TerrainEffect', async () => {
  const terrainEffect = new TerrainEffect();

  const terrainLayer = new TerrainLayer({
    elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    loaders: [TerrainLoader],
    loadOptions: {worker: false},
    operation: 'draw+terrain'
  });
  const geoLayer = new GeoJsonLayer({
    data: geojson,
    pickable: true,
    extensions: [new TerrainExtension()]
  });

  const lifecycle = new LifecycleTester();

  // Initiation
  await lifecycle.update({
    viewport: new WebMercatorViewport({
      width: 800,
      height: 600,
      longitude: -122.4,
      latitude: 37.8,
      zoom: 10
    }),
    effects: [terrainEffect],
    layers: [terrainLayer]
  });
  expect(terrainEffect.terrainPass, 'TerrainPass is created').toBeTruthy();
  expect(terrainEffect.terrainPickingPass, 'terrainPickingPass is created').toBeTruthy();
  const renderTerrainCover = vi.spyOn(terrainEffect.terrainPass, 'renderTerrainCover');
  const renderPickingTerrainCover = vi.spyOn(
    terrainEffect.terrainPickingPass,
    'renderTerrainCover'
  );

  // preRender
  await lifecycle.update({
    layers: [terrainLayer, geoLayer]
  });
  expect(renderTerrainCover, 'Rendered 4 terrain covers').toHaveBeenCalledTimes(4);
  renderTerrainCover.mockClear();

  // preRender#picking
  lifecycle.render({
    pass: 'picking:hover',
    isPicking: true,
    deviceRect: {x: 200, y: 150, width: 1, height: 1},
    cullRect: {x: 200, y: 150, width: 1, height: 1}
  });
  expect(renderPickingTerrainCover, 'Rendered 1 terrain cover for picking').toHaveBeenCalledTimes(
    1
  );
  renderPickingTerrainCover.mockClear();

  // preRender#diffing
  await lifecycle.update({
    viewport: new WebMercatorViewport({
      width: 800,
      height: 600,
      longitude: -122.401,
      latitude: 37.799,
      zoom: 10
    })
  });
  expect(renderTerrainCover, 'Terrain covers do not require redraw').toHaveBeenCalledTimes(0);
  renderTerrainCover.mockClear();

  // moduleUniforms
  const meshLayer = terrainLayer.getSubLayers()[0].getSubLayers()[0];
  let model = meshLayer.state.model;
  let uniforms = getLayerUniforms(meshLayer);
  expect(uniforms.mode, 'TERRAIN_MODE.USE_COVER').toBe(TERRAIN_MODE.USE_COVER);
  expect(model.bindings.terrain_map?.width, 'Terrain cover used as sampler').toBe(1024);

  const scatterplotLayer = geoLayer.getSubLayers().find(l => l.id.endsWith('points-circle'));
  model = scatterplotLayer.state.model;
  uniforms = getLayerUniforms(scatterplotLayer);
  expect(uniforms.mode, 'TERRAIN_MODE.USE_HEIGHT_MAP').toBe(TERRAIN_MODE.USE_HEIGHT_MAP);
  expect(model.bindings.terrain_map?.id, 'Height map used as sampler').toBe('height-map');

  const pathLayer = geoLayer.getSubLayers().find(l => l.id.endsWith('linestrings'));
  model = pathLayer.state.model;
  uniforms = getLayerUniforms(pathLayer);
  expect(uniforms.mode, 'TERRAIN_MODE.SKIP').toBe(TERRAIN_MODE.SKIP);
  expect(model.bindings.terrain_map?.width, 'Dummy height map used as sampler').toBe(1);

  // preRender#diffing
  await lifecycle.update({
    layers: [terrainLayer]
  });
  expect(renderTerrainCover, 'Terrain covers are redrawn').toHaveBeenCalledTimes(4);
  renderTerrainCover.mockClear();

  model = meshLayer.state.model;
  uniforms = getLayerUniforms(meshLayer);
  expect(uniforms.mode, 'TERRAIN_MODE.NONE').toBe(TERRAIN_MODE.NONE);
  expect(model.bindings.terrain_map?.width, 'Terrain cover using empty texture').toBe(1);

  lifecycle.finalize();
});

test('TerrainEffect#without draw operation', async () => {
  const terrainEffect = new TerrainEffect();

  const terrainLayer = new TerrainLayer({
    elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    loaders: [TerrainLoader],
    loadOptions: {worker: false},
    operation: 'terrain'
  });
  const geoLayer = new GeoJsonLayer({
    data: geojson,
    pickable: true,
    extensions: [new TerrainExtension()]
  });

  const lifecycle = new LifecycleTester();

  // Initiation
  await lifecycle.update({
    viewport: new WebMercatorViewport({
      width: 800,
      height: 600,
      longitude: -122.4,
      latitude: 37.8,
      zoom: 10
    }),
    effects: [terrainEffect],
    layers: [terrainLayer]
  });
  expect(terrainEffect.terrainPass, 'TerrainPass is created').toBeTruthy();
  expect(terrainEffect.terrainPickingPass, 'terrainPickingPass is created').toBeTruthy();
  const renderTerrainCover = vi.spyOn(terrainEffect.terrainPass, 'renderTerrainCover');
  const renderPickingTerrainCover = vi.spyOn(
    terrainEffect.terrainPickingPass,
    'renderTerrainCover'
  );

  // preRender
  await lifecycle.update({
    layers: [terrainLayer, geoLayer]
  });
  expect(renderTerrainCover, 'Rendered 4 terrain covers').toHaveBeenCalledTimes(4);
  renderTerrainCover.mockClear();

  // preRender#picking
  lifecycle.render({
    pass: 'picking:hover',
    isPicking: true,
    deviceRect: {x: 200, y: 150, width: 1, height: 1},
    cullRect: {x: 200, y: 150, width: 1, height: 1}
  });
  expect(renderPickingTerrainCover, 'Rendered 1 terrain cover for picking').toHaveBeenCalledTimes(
    1
  );
  renderPickingTerrainCover.mockClear();

  // preRender#diffing
  await lifecycle.update({
    viewport: new WebMercatorViewport({
      width: 800,
      height: 600,
      longitude: -122.401,
      latitude: 37.799,
      zoom: 10
    })
  });
  expect(renderTerrainCover, 'Terrain covers do not require redraw').toHaveBeenCalledTimes(0);
  renderTerrainCover.mockClear();

  // moduleUniforms
  const meshLayer = terrainLayer.getSubLayers()[0].getSubLayers()[0];
  let model = meshLayer.state.model;
  let uniforms = getLayerUniforms(meshLayer);
  expect(uniforms.mode, 'TERRAIN_MODE.USE_COVER_ONLY').toBe(TERRAIN_MODE.USE_COVER_ONLY);
  expect(model.bindings.terrain_map?.width, 'Terrain cover used as sampler').toBe(1024);

  const scatterplotLayer = geoLayer.getSubLayers().find(l => l.id.endsWith('points-circle'));
  model = scatterplotLayer.state.model;
  uniforms = getLayerUniforms(scatterplotLayer);
  expect(uniforms.mode, 'TERRAIN_MODE.USE_HEIGHT_MAP').toBe(TERRAIN_MODE.USE_HEIGHT_MAP);
  expect(model.bindings.terrain_map?.id, 'Height map used as sampler').toBe('height-map');

  const pathLayer = geoLayer.getSubLayers().find(l => l.id.endsWith('linestrings'));
  model = pathLayer.state.model;
  uniforms = getLayerUniforms(pathLayer);
  expect(uniforms.mode, 'TERRAIN_MODE.SKIP').toBe(TERRAIN_MODE.SKIP);
  expect(model.bindings.terrain_map?.width, 'Dummy height map used as sampler').toBe(1);

  // preRender#diffing
  await lifecycle.update({
    layers: [terrainLayer]
  });
  expect(renderTerrainCover, 'Terrain covers are redrawn').toHaveBeenCalledTimes(4);
  renderTerrainCover.mockClear();

  model = meshLayer.state.model;
  uniforms = getLayerUniforms(meshLayer);
  expect(uniforms.mode, 'TERRAIN_MODE.SKIP').toBe(TERRAIN_MODE.SKIP);
  expect(model.bindings.terrain_map?.width, 'Terrain cover using empty texture').toBe(1);

  lifecycle.finalize();
});

const VIEWPORT = new WebMercatorViewport({
  width: 800,
  height: 600,
  longitude: -122.4,
  latitude: 37.8,
  zoom: 10
});
const SUMMIT: [number, number] = [-122.4, 37.8];
const GLACIER = [
  [-122.5, 37.7],
  [-122.3, 37.7],
  [-122.3, 37.9],
  [-122.5, 37.9]
];

/** External terrain that records what the TerrainEffect asks of it */
function createExternalTerrain() {
  return {
    id: 'terrain',
    renderHeightMap: vi.fn(),
    setDrapeRenderer: vi.fn(),
    onDrapeChange: vi.fn()
  };
}

function createSummitLayer() {
  return new ScatterplotLayer({
    id: 'summit',
    data: [SUMMIT],
    getPosition: d => d,
    extensions: [new TerrainExtension()]
  });
}

function createGlacierLayer() {
  return new SolidPolygonLayer({
    id: 'glacier',
    data: [GLACIER],
    getPolygon: d => d,
    getFillColor: [255, 0, 0],
    extensions: [new TerrainExtension()]
  });
}

/** Stands for terrain drawn by another renderer, as a base map integration does */
class ExternalTerrainLayer extends Layer<{externalTerrain: ExternalTerrain}> {
  static layerName = 'ExternalTerrainLayer';
  static defaultProps = {operation: 'terrain', pickable: true, externalTerrain: null};

  initializeState() {}

  draw({renderPass, parameters, shaderModuleProps}) {
    shaderModuleProps.terrain?.drawPickingSurface?.({renderPass, parameters, shaderModuleProps});
  }
}

/** A terrain layer that has not loaded any tiles yet */
class LoadingTerrainLayer extends CompositeLayer {
  static layerName = 'LoadingTerrainLayer';

  renderLayers() {
    return null;
  }
}

test('TerrainEffect#external terrain', async () => {
  const terrainEffect = new TerrainEffect();
  const externalTerrain = createExternalTerrain();
  const summitLayer = createSummitLayer();
  const glacierLayer = createGlacierLayer();

  let externalTerrainLayer = new ExternalTerrainLayer({id: 'external-terrain', externalTerrain});

  const lifecycle = new LifecycleTester();
  await lifecycle.update({
    viewport: VIEWPORT,
    effects: [terrainEffect],
    layers: [externalTerrainLayer, summitLayer, glacierLayer]
  });

  // Offset layers
  expect(
    externalTerrain.renderHeightMap,
    'External terrain draws the height map'
  ).toHaveBeenCalled();
  const [{target: heightMap, bounds}] = externalTerrain.renderHeightMap.mock.lastCall!;
  const [x, y] = VIEWPORT.projectFlat(SUMMIT);
  expect(
    bounds[0] < x && x < bounds[2] && bounds[1] < y && y < bounds[3],
    'Height map bounds'
  ).toBe(true);
  expect((bounds[2] - bounds[0]) * VIEWPORT.scale, 'Height map is padded').toBeCloseTo(64);
  expect(heightMap.width, 'Height map size').toBeGreaterThanOrEqual(64);
  expect(getLayerUniforms(summitLayer).mode, 'TERRAIN_MODE.USE_HEIGHT_MAP_METERS').toBe(
    TERRAIN_MODE.USE_HEIGHT_MAP_METERS
  );

  externalTerrain.renderHeightMap.mockClear();
  lifecycle.render();
  expect(externalTerrain.renderHeightMap, 'Height map is up to date').not.toHaveBeenCalled();
  externalTerrain.id = 'terrain-with-more-tiles';
  lifecycle.render();
  expect(externalTerrain.renderHeightMap, 'Height map follows the terrain').toHaveBeenCalledTimes(
    1
  );
  await lifecycle.update({
    viewport: new WebMercatorViewport({
      width: 800,
      height: 600,
      longitude: -122.4,
      latitude: 37.8,
      zoom: 12
    })
  });
  expect(externalTerrain.renderHeightMap, 'Height map follows the camera').toHaveBeenCalledTimes(2);
  await lifecycle.update({viewport: VIEWPORT});

  // Draped layers
  expect(getLayerUniforms(glacierLayer).mode, 'TERRAIN_MODE.SKIP').toBe(TERRAIN_MODE.SKIP);
  expect(externalTerrain.onDrapeChange).toHaveBeenLastCalledWith([glacierLayer]);
  expect(externalTerrain.setDrapeRenderer).toHaveBeenCalledTimes(1);
  const renderDrape = externalTerrain.setDrapeRenderer.mock.calls[0][0];

  // A tile inside the glacier
  const tileBounds = [x - 0.05, y - 0.05, x + 0.05, y + 0.05];
  const tile = device.createFramebuffer({width: 4, height: 4, colorAttachments: ['rgba8unorm']});
  renderDrape({target: tile, bounds: tileBounds});
  expect(Array.from(device.readPixelsToArrayWebGL(tile)), 'Draped layer is drawn').toEqual(
    Array.from({length: 16}, () => [255, 0, 0, 255]).flat()
  );
  device.beginRenderPass({framebuffer: tile, clearColor: [0, 0, 0, 0]}).end();
  renderDrape({
    target: tile,
    bounds: tileBounds,
    layerFilter: ({layer}) => layer.id !== 'glacier'
  });
  expect(Array.from(device.readPixelsToArrayWebGL(tile)), 'Layer filter').toEqual(
    new Array(64).fill(0)
  );
  tile.destroy();

  // A host that draws the layers in groups shares one height map between them
  const hutLayer = new ScatterplotLayer({
    id: 'hut',
    data: [[-122.45, 37.75]],
    getPosition: d => d,
    extensions: [new TerrainExtension()]
  });
  await lifecycle.update({layers: [externalTerrainLayer, summitLayer, hutLayer, glacierLayer]});
  externalTerrain.renderHeightMap.mockClear();
  lifecycle.render({layerFilter: ({layer}) => layer.id !== 'hut'});
  expect(
    externalTerrain.renderHeightMap,
    'Height map covers the layers of every group'
  ).not.toHaveBeenCalled();

  // A host that passes a new object for the same terrain when it updates the terrain layer
  externalTerrain.renderHeightMap.mockClear();
  externalTerrain.setDrapeRenderer.mockClear();
  externalTerrain.onDrapeChange.mockClear();
  await lifecycle.update({
    layers: [
      new ExternalTerrainLayer({id: 'external-terrain', externalTerrain: {...externalTerrain}}),
      summitLayer,
      hutLayer,
      glacierLayer
    ]
  });
  expect(externalTerrain.setDrapeRenderer, 'Draped layers stay').not.toHaveBeenCalledWith(null);
  expect(externalTerrain.setDrapeRenderer).toHaveBeenLastCalledWith(renderDrape);
  expect(externalTerrain.onDrapeChange).not.toHaveBeenCalled();
  expect(externalTerrain.renderHeightMap, 'Height map is up to date').not.toHaveBeenCalled();

  // Other terrain in the same layer
  const otherTerrain = {...createExternalTerrain(), id: 'other-terrain'};
  await lifecycle.update({
    layers: [
      new ExternalTerrainLayer({id: 'external-terrain', externalTerrain: otherTerrain}),
      summitLayer,
      hutLayer,
      glacierLayer
    ]
  });
  expect(externalTerrain.setDrapeRenderer, 'Previous terrain lets go').toHaveBeenLastCalledWith(
    null
  );
  expect(otherTerrain.setDrapeRenderer).toHaveBeenLastCalledWith(renderDrape);
  expect(otherTerrain.onDrapeChange).toHaveBeenLastCalledWith([glacierLayer]);
  externalTerrainLayer = new ExternalTerrainLayer({id: 'external-terrain', externalTerrain});
  await lifecycle.update({layers: [externalTerrainLayer, summitLayer, hutLayer, glacierLayer]});

  // Terrain layers take precedence
  externalTerrain.renderHeightMap.mockClear();
  await lifecycle.update({
    layers: [
      new SolidPolygonLayer({
        id: 'ground',
        data: [GLACIER],
        getPolygon: d => d,
        operation: 'terrain'
      }),
      externalTerrainLayer,
      summitLayer,
      glacierLayer
    ]
  });
  expect(externalTerrain.setDrapeRenderer).toHaveBeenLastCalledWith(null);
  expect(externalTerrain.renderHeightMap).not.toHaveBeenCalled();
  expect(getLayerUniforms(summitLayer).mode, 'TERRAIN_MODE.USE_HEIGHT_MAP').toBe(
    TERRAIN_MODE.USE_HEIGHT_MAP
  );
  expect(terrainEffect.terrainCovers.size, 'Terrain cover of the ground').toBe(1);

  // External terrain again, which has no use for the terrain covers
  await lifecycle.update({layers: [externalTerrainLayer, summitLayer, glacierLayer]});
  expect(terrainEffect.terrainCovers.size, 'Terrain covers are released').toBe(0);

  // Without terrain, layers draw as usual
  await lifecycle.update({layers: [summitLayer, glacierLayer]});
  expect(getLayerUniforms(summitLayer).mode, 'TERRAIN_MODE.NONE').toBe(TERRAIN_MODE.NONE);
  expect(getLayerUniforms(glacierLayer).mode, 'TERRAIN_MODE.NONE').toBe(TERRAIN_MODE.NONE);

  lifecycle.finalize();
});

const webglTest = device.type === 'webgl' ? test : test.skip;

async function waitForRender(deck: Deck): Promise<void> {
  await new Promise<void>(resolve => {
    deck.setProps({onAfterRender: () => resolve()});
  });
}

webglTest('TerrainEffect#picks layers draped over external terrain', async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  const webglContext = canvas.getContext('webgl2', {preserveDrawingBuffer: true});
  const externalTerrain = {
    id: 'terrain',
    renderHeightMap: ({target}: {target: Framebuffer}) => {
      target.device.beginRenderPass({framebuffer: target, clearColor: [2000, 0, 0, 1]}).end();
    }
  };
  // Away from the center of the view, and at different latitudes
  const getGlacier = ([longitude, latitude]: number[]) => [
    [longitude - 0.004, latitude - 0.001],
    [longitude + 0.004, latitude - 0.001],
    [longitude + 0.004, latitude + 0.001],
    [longitude - 0.004, latitude + 0.001]
  ];
  const deck = new Deck({
    gl: webglContext!,
    width: 600,
    height: 300,
    useDevicePixels: false,
    controller: false,
    viewState: {
      longitude: 8,
      latitude: 46.5,
      zoom: 13,
      pitch: 60,
      bearing: 0,
      position: [0, 0, 2000]
    },
    layers: [
      new ExternalTerrainLayer({id: 'external-terrain', externalTerrain}),
      new ScatterplotLayer({
        id: 'summit',
        data: [[8.006, 46.502]],
        getPosition: d => d,
        getRadius: 10,
        radiusUnits: 'pixels',
        pickable: true,
        extensions: [new TerrainExtension()]
      }),
      ...[
        ['west', [8.006, 46.502]],
        ['east', [8.018, 46.498]]
      ].map(
        ([id, center]) =>
          new SolidPolygonLayer({
            id: id as string,
            data: [getGlacier(center as number[])],
            getPolygon: d => d,
            pickable: true,
            extensions: [new TerrainExtension()]
          })
      )
    ]
  });

  try {
    await waitForRender(deck);
    const viewport = deck.getViewports()[0];
    const pick = (lngLatZ: number[]) => {
      const [x, y] = viewport.project(lngLatZ);
      return deck.pickObject({x, y});
    };
    expect(pick([8.006, 46.502, 2000])?.layer?.id, 'Point on the terrain over a draped layer').toBe(
      'summit'
    );
    expect(pick([8.003, 46.502, 2000])?.layer?.id, 'Draped layer on the terrain').toBe('west');
    expect(pick([8.018, 46.498, 2000])?.layer?.id, 'Second draped layer on the terrain').toBe(
      'east'
    );
    expect(pick([8.018, 46.498, 0]), 'Nothing where the draped layer would be at sea level').toBe(
      null
    );
  } finally {
    deck.finalize();
    webglContext!.getExtension('WEBGL_lose_context')?.loseContext();
  }
});

test('TerrainEffect#draped layers without terrain', async () => {
  const terrainEffect = new TerrainEffect();
  const glacierLayer = createGlacierLayer();

  const lifecycle = new LifecycleTester();
  await lifecycle.update({
    viewport: VIEWPORT,
    effects: [terrainEffect],
    layers: [glacierLayer]
  });
  expect(getLayerUniforms(glacierLayer).mode, 'TERRAIN_MODE.NONE').toBe(TERRAIN_MODE.NONE);

  await lifecycle.update({
    layers: [new LoadingTerrainLayer({id: 'terrain', operation: 'terrain+draw'}), glacierLayer]
  });
  expect(getLayerUniforms(glacierLayer).mode, 'Hidden while the terrain loads').toBe(
    TERRAIN_MODE.SKIP
  );

  lifecycle.finalize();
});
