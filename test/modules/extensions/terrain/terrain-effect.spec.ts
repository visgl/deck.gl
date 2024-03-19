import test from 'tape-promise/tape';
import {WebMercatorViewport} from '@deck.gl/core';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';
import {TerrainEffect} from '@deck.gl/extensions/terrain/terrain-effect';
import {TERRAIN_MODE} from '@deck.gl/extensions/terrain/shader-module';
import {GeoJsonLayer} from '@deck.gl/layers';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {TerrainLoader} from '@loaders.gl/terrain';

import {makeSpy} from '@probe.gl/test-utils';
import {device} from '@deck.gl/test-utils';
import {geojson} from 'deck.gl-test/data';
import {LifecycleTester} from '../utils';

test('TerrainEffect', async t => {
  const terrainEffect = new TerrainEffect();
  terrainEffect.setup({device});

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
  t.ok(terrainEffect.terrainPass, 'TerrainPass is created');
  t.ok(terrainEffect.terrainPickingPass, 'terrainPickingPass is created');
  const renderTerrainCover = makeSpy(terrainEffect.terrainPass, 'renderTerrainCover');
  const renderPickingTerrainCover = makeSpy(terrainEffect.terrainPickingPass, 'renderTerrainCover');

  // preRender
  await lifecycle.update({
    layers: [terrainLayer, geoLayer]
  });
  t.is(renderTerrainCover.callCount, 4, 'Rendered 4 terrain covers');
  renderTerrainCover.reset();

  // preRender#picking
  lifecycle.render({
    pass: 'picking:hover',
    isPicking: true,
    deviceRect: {x: 200, y: 150, width: 1, height: 1},
    cullRect: {x: 200, y: 150, width: 1, height: 1}
  });
  t.is(renderPickingTerrainCover.callCount, 1, 'Rendered 1 terrain cover for picking');
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
  t.is(renderTerrainCover.callCount, 0, 'Terrain covers do not require redraw');
  renderTerrainCover.reset();

  // moduleUniforms
  const meshLayer = terrainLayer.getSubLayers()[0].getSubLayers()[0];
  let uniforms = meshLayer.state.model.uniforms;
  t.is(uniforms.terrain_mode, TERRAIN_MODE.USE_COVER, 'TERRAIN_MODE.USE_COVER');
  t.is(uniforms.terrain_map?.width, 1024, 'Terrain cover used as sampler');

  const scatterplotLayer = geoLayer.getSubLayers().find(l => l.id.endsWith('points-circle'));
  uniforms = scatterplotLayer.state.model.uniforms;
  t.is(uniforms.terrain_mode, TERRAIN_MODE.USE_HEIGHT_MAP, 'TERRAIN_MODE.USE_HEIGHT_MAP');
  t.is(uniforms.terrain_map?.id, 'height-map', 'Height map used as sampler');

  const pathLayer = geoLayer.getSubLayers().find(l => l.id.endsWith('linestrings'));
  uniforms = pathLayer.state.model.uniforms;
  t.is(uniforms.terrain_mode, TERRAIN_MODE.SKIP, 'TERRAIN_MODE.SKIP');
  t.is(uniforms.terrain_map?.width, 1, 'Dummy height map used as sampler');

  // preRender#diffing
  await lifecycle.update({
    layers: [terrainLayer]
  });
  t.is(renderTerrainCover.callCount, 4, 'Terrain covers are redrawn');
  renderTerrainCover.reset();

  uniforms = meshLayer.state.model.uniforms;
  t.is(uniforms.terrain_mode, TERRAIN_MODE.NONE, 'TERRAIN_MODE.NONE');
  t.is(uniforms.terrain_map?.width, 1, 'Terrain cover using empty texture');

  terrainEffect.cleanup();
  lifecycle.finalize();
  t.end();
});

test('TerrainEffect#without draw operation', async t => {
  const terrainEffect = new TerrainEffect();
  terrainEffect.setup({device});

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
  t.ok(terrainEffect.terrainPass, 'TerrainPass is created');
  t.ok(terrainEffect.terrainPickingPass, 'terrainPickingPass is created');
  const renderTerrainCover = makeSpy(terrainEffect.terrainPass, 'renderTerrainCover');
  const renderPickingTerrainCover = makeSpy(terrainEffect.terrainPickingPass, 'renderTerrainCover');

  // preRender
  await lifecycle.update({
    layers: [terrainLayer, geoLayer]
  });
  t.is(renderTerrainCover.callCount, 4, 'Rendered 4 terrain covers');
  renderTerrainCover.reset();

  // preRender#picking
  lifecycle.render({
    pass: 'picking:hover',
    isPicking: true,
    deviceRect: {x: 200, y: 150, width: 1, height: 1},
    cullRect: {x: 200, y: 150, width: 1, height: 1}
  });
  t.is(renderPickingTerrainCover.callCount, 1, 'Rendered 1 terrain cover for picking');
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
  t.is(renderTerrainCover.callCount, 0, 'Terrain covers do not require redraw');
  renderTerrainCover.reset();

  // moduleUniforms
  const meshLayer = terrainLayer.getSubLayers()[0].getSubLayers()[0];
  let uniforms = meshLayer.state.model.uniforms;
  t.is(uniforms.terrain_mode, TERRAIN_MODE.USE_COVER_ONLY, 'TERRAIN_MODE.USE_COVER_ONLY');
  t.is(uniforms.terrain_map?.width, 1024, 'Terrain cover used as sampler');

  const scatterplotLayer = geoLayer.getSubLayers().find(l => l.id.endsWith('points-circle'));
  uniforms = scatterplotLayer.state.model.uniforms;
  t.is(uniforms.terrain_mode, TERRAIN_MODE.USE_HEIGHT_MAP, 'TERRAIN_MODE.USE_HEIGHT_MAP');
  t.is(uniforms.terrain_map?.id, 'height-map', 'Height map used as sampler');

  const pathLayer = geoLayer.getSubLayers().find(l => l.id.endsWith('linestrings'));
  uniforms = pathLayer.state.model.uniforms;
  t.is(uniforms.terrain_mode, TERRAIN_MODE.SKIP, 'TERRAIN_MODE.SKIP');
  t.is(uniforms.terrain_map?.width, 1, 'Dummy height map used as sampler');

  // preRender#diffing
  await lifecycle.update({
    layers: [terrainLayer]
  });
  t.is(renderTerrainCover.callCount, 4, 'Terrain covers are redrawn');
  renderTerrainCover.reset();

  uniforms = meshLayer.state.model.uniforms;
  t.is(uniforms.terrain_mode, TERRAIN_MODE.SKIP, 'TERRAIN_MODE.SKIP');
  t.is(uniforms.terrain_map?.width, 1, 'Terrain cover using empty texture');

  terrainEffect.cleanup();
  lifecycle.finalize();
  t.end();
});
