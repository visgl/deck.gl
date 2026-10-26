// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {WebMercatorViewport} from '@deck.gl/core';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';
import {TerrainEffect} from '@deck.gl/extensions/terrain/terrain-effect';
import {TERRAIN_MODE} from '@deck.gl/extensions/terrain/shader-module';
import {GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {TerrainLoader} from '@loaders.gl/terrain';

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

test('TerrainEffect#releases covers of removed terrain layers', async () => {
  const terrainEffect = new TerrainEffect();

  const data = [
    [-122.45, 37.75],
    [-122.35, 37.85]
  ];
  const terrainLayerA = new ScatterplotLayer({
    id: 'terrain-a',
    data,
    getPosition: d => d,
    operation: 'terrain+draw'
  });
  const terrainLayerB = new ScatterplotLayer({
    id: 'terrain-b',
    data,
    getPosition: d => d,
    operation: 'terrain+draw'
  });
  const drapeLayer = new ScatterplotLayer({
    id: 'drape',
    data,
    getPosition: d => d,
    extensions: [new TerrainExtension()],
    terrainDrawMode: 'drape'
  });

  const lifecycle = new LifecycleTester();
  await lifecycle.update({
    viewport: new WebMercatorViewport({
      width: 800,
      height: 600,
      longitude: -122.4,
      latitude: 37.8,
      zoom: 10
    }),
    effects: [terrainEffect],
    layers: [terrainLayerA, terrainLayerB, drapeLayer]
  });
  const texture = terrainEffect.terrainCovers.get('terrain-b')?.getRenderFramebuffer()
    ?.colorAttachments[0].texture;
  expect(texture, 'Terrain cover is rendered').toBeTruthy();

  // Removing a terrain layer, e.g. when a terrain tile is evicted, prunes its cover
  await lifecycle.update({
    layers: [terrainLayerA, drapeLayer]
  });
  expect(terrainEffect.terrainCovers.has('terrain-b'), 'Terrain cover is pruned').toBe(false);
  expect(texture.destroyed, 'Pruned terrain cover releases its texture').toBe(true);

  lifecycle.finalize();
});
