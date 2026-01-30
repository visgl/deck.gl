// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {WebMercatorViewport} from '@deck.gl/core';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';
import {TerrainEffect} from '@deck.gl/extensions/terrain/terrain-effect';
import {TERRAIN_MODE} from '@deck.gl/extensions/terrain/shader-module';
import {GeoJsonLayer} from '@deck.gl/layers';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {TerrainLoader} from '@loaders.gl/terrain';

import {device, getLayerUniforms} from '@deck.gl/test-utils';
import {geojson} from 'deck.gl-test/data';
import {LifecycleTester} from '../utils';

test('TerrainEffect', async () => {
  const terrainEffect = new TerrainEffect();

  const terrainLayer = new TerrainLayer({
    elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    loaders: [TerrainLoader],
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
  expect(renderTerrainCover.callCount, 'Rendered 4 terrain covers').toBe(4);
  renderTerrainCover.reset();

  // preRender#picking
  lifecycle.render({
    pass: 'picking:hover',
    isPicking: true,
    deviceRect: {x: 200, y: 150, width: 1, height: 1},
    cullRect: {x: 200, y: 150, width: 1, height: 1}
  });
  expect(renderPickingTerrainCover.callCount, 'Rendered 1 terrain cover for picking').toBe(1);
  renderPickingTerrainCover.reset();

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
  expect(renderTerrainCover.callCount, 'Terrain covers do not require redraw').toBe(0);
  renderTerrainCover.reset();

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
  expect(renderTerrainCover.callCount, 'Terrain covers are redrawn').toBe(4);
  renderTerrainCover.reset();

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
  expect(renderTerrainCover.callCount, 'Rendered 4 terrain covers').toBe(4);
  renderTerrainCover.reset();

  // preRender#picking
  lifecycle.render({
    pass: 'picking:hover',
    isPicking: true,
    deviceRect: {x: 200, y: 150, width: 1, height: 1},
    cullRect: {x: 200, y: 150, width: 1, height: 1}
  });
  expect(renderPickingTerrainCover.callCount, 'Rendered 1 terrain cover for picking').toBe(1);
  renderPickingTerrainCover.reset();

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
  expect(renderTerrainCover.callCount, 'Terrain covers do not require redraw').toBe(0);
  renderTerrainCover.reset();

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
  expect(renderTerrainCover.callCount, 'Terrain covers are redrawn').toBe(4);
  renderTerrainCover.reset();

  model = meshLayer.state.model;
  uniforms = getLayerUniforms(meshLayer);
  expect(uniforms.mode, 'TERRAIN_MODE.SKIP').toBe(TERRAIN_MODE.SKIP);
  expect(model.bindings.terrain_map?.width, 'Terrain cover using empty texture').toBe(1);

  lifecycle.finalize();
});
