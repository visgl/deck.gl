// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {TerrainCover} from '@deck.gl/extensions/terrain/terrain-cover';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

import {WebMercatorViewport, OrthographicViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {TileLayer} from '@deck.gl/geo-layers';
import {LifecycleTester} from '../utils';

test('TerrainCover#viewport diffing#geo#not tiled', async () => {
  const lifecycle = new LifecycleTester();
  let viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 0
  });
  let targetLayer = new ScatterplotLayer();

  await lifecycle.update({viewport, layers: [targetLayer]});

  const tc = new TerrainCover(targetLayer);
  expect(tc.shouldUpdate({viewport}), 'Should not need update').toBeFalsy();
  expect(tc.bounds, 'Empty targetLayer does not have bounds').toBeFalsy();
  expect(tc.renderTexture, 'Render texture should be empty').toBeFalsy();
  expect(tc.pickingTexture, 'Picking texture should be empty').toBeFalsy();

  targetLayer = new ScatterplotLayer({
    data: [
      [-90, -40.97989806962013],
      [0, 0]
    ],
    getPosition: d => d
  });
  await lifecycle.update({viewport, layers: [targetLayer]});

  expect(tc.shouldUpdate({targetLayer, viewport}), 'Should require update').toBeTruthy();
  expect(tc.bounds, 'Cartesian bounds').toEqual([128, 192, 256, 256]);
  expect(tc.renderViewport instanceof WebMercatorViewport, 'Render viewport').toBeTruthy();
  expect(tc.renderViewport.zoom, 'Render viewport zoom').toBe(1);

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 0.1
  });
  expect(tc.shouldUpdate({targetLayer, viewport}), 'Should not need update').toBeFalsy();

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 5
  });
  expect(tc.shouldUpdate({targetLayer, viewport}), 'Should require update - zoom').toBeTruthy();
  expect(tc.renderViewport.zoom, 'Render viewport zoom').toBe(6);

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -80,
    latitude: 0,
    zoom: 5
  });
  expect(tc.shouldUpdate({targetLayer, viewport}), 'Should require update - bounds').toBeTruthy();

  tc.delete();
  lifecycle.finalize();
});

test('TerrainCover#viewport diffing#geo#tiled', async () => {
  const lifecycle = new LifecycleTester();
  let viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 0
  });
  let targetLayer = new ScatterplotLayer({
    tile: {
      boundingBox: [
        [-90, -40.97989806962013],
        [0, 0]
      ]
    }
  });

  await lifecycle.update({viewport, layers: [targetLayer]});

  const tc = new TerrainCover(targetLayer);
  expect(tc.shouldUpdate({viewport}), 'Should require update').toBeTruthy();
  expect(tc.bounds, 'Cartesian bounds').toEqual([128, 192, 256, 256]);
  expect(tc.renderViewport instanceof WebMercatorViewport, 'Render viewport').toBeTruthy();
  expect(tc.renderViewport.zoom, 'Render viewport zoom').toBe(1);

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 5
  });
  expect(tc.shouldUpdate({targetLayer, viewport}), 'Should not need update').toBeFalsy();

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -80,
    latitude: 0,
    zoom: 5
  });
  expect(tc.shouldUpdate({targetLayer, viewport}), 'Should not need update').toBeFalsy();

  tc.delete();
  lifecycle.finalize();
});

test('TerrainCover#viewport diffing#non-geo', async () => {
  const lifecycle = new LifecycleTester();
  const viewport = new OrthographicViewport({width: 400, height: 300, zoom: 0});
  const targetLayer = new ScatterplotLayer({
    data: [
      [-90, -40],
      [0, 20]
    ],
    getPosition: d => d
  });

  await lifecycle.update({viewport, layers: [targetLayer]});

  const tc = new TerrainCover(targetLayer);
  expect(tc.shouldUpdate({targetLayer, viewport}), 'Should require update').toBeTruthy();
  expect(tc.bounds, 'Common bounds').toEqual([-90, -40, 0, 20]);
  expect(tc.renderViewport instanceof OrthographicViewport, 'Render viewport').toBeTruthy();
  expect(tc.renderViewport.zoom, 'Render viewport zoom').toBe(1);

  tc.delete();
  lifecycle.finalize();
});

test.skip('TerrainCover#layers diffing#non-geo', async () => {
  const lifecycle = new LifecycleTester();
  const terrainSource = new TileLayer({
    id: 'terrain',
    getTileData: ({bbox}) => {
      return {
        positions: new Float32Array([bbox.left, bbox.top, 0, bbox.right, bbox.bottom, 1])
      };
    },
    renderSubLayers: props =>
      new SimpleMeshLayer(props, {
        data: [0],
        mesh: props.data
      })
  });
  const overlay = new TileLayer({
    id: 'overlay',
    getTileData: ({bbox}) => {
      return [{type: 'Feature', geometry: {type: 'Point', coordinates: [bbox.left, bbox.top]}}];
    },
    terrainDrawMode: 'drape',
    extensions: [new TerrainExtension()]
  });
  const scatterplotLayer = new ScatterplotLayer({
    id: 'scatterplot',
    terrainDrawMode: 'drape',
    extensions: [new TerrainExtension()]
  });

  let viewport = new OrthographicViewport({width: 800, height: 600, zoom: 0, target: [400, 300]});
  await lifecycle.update({viewport, layers: [terrainSource, overlay, scatterplotLayer]});

  const targetLayer = lifecycle.layers.find(l => l.id === 'terrain-0-0-0');
  const tc = new TerrainCover(targetLayer);
  let drapeLayers = lifecycle.layers.filter(
    l => !l.isComposite && l.state.terrainDrawMode === 'drape'
  );
  expect(drapeLayers.length >= 5, 'Found drape layers').toBeTruthy();
  expect(tc.shouldUpdate({targetLayer, layers: drapeLayers}), 'Should require update').toBeTruthy();
  expect(tc.layers, 'Correctly culled layers').toEqual([
    'overlay-0-0-0-points-circle',
    'scatterplot'
  ]);

  viewport = new OrthographicViewport({width: 800, height: 600, zoom: 0, target: [-400, -300]});
  await lifecycle.update({viewport});

  drapeLayers = lifecycle.layers.filter(l => !l.isComposite && l.state.terrainDrawMode === 'drape');
  expect(drapeLayers.length >= 9, 'Found drape layers').toBeTruthy();
  expect(tc.shouldUpdate({targetLayer, layers: drapeLayers}), 'Should not need update').toBeFalsy();

  await lifecycle.update({layers: [terrainSource, overlay]});
  drapeLayers = lifecycle.layers.filter(l => !l.isComposite && l.state.terrainDrawMode === 'drape');
  expect(tc.shouldUpdate({targetLayer, layers: drapeLayers}), 'Should require update').toBeTruthy();
  expect(tc.layers, 'Correctly culled layers').toEqual(['overlay-0-0-0-points-circle']);

  tc.delete();
  lifecycle.finalize();
});

test.skip('TerrainCover#layers diffing#geo', async () => {
  const lifecycle = new LifecycleTester();
  const terrainSource = new TileLayer({
    id: 'terrain',
    getTileData: () => {
      return {
        positions: new Float32Array([0, 0, 0, 1, 1, 1])
      };
    },
    renderSubLayers: props =>
      new SimpleMeshLayer(props, {
        data: [0],
        getPosition: d => [props.tile.bbox.west, props.tile.bbox.north],
        mesh: props.data
      })
  });
  const overlay = new TileLayer({
    id: 'overlay',
    getTileData: ({bbox}) => {
      return [{type: 'Feature', geometry: {type: 'Point', coordinates: [bbox.west, bbox.north]}}];
    },
    terrainDrawMode: 'drape',
    extensions: [new TerrainExtension()]
  });
  const scatterplotLayer = new ScatterplotLayer({
    id: 'scatterplot',
    terrainDrawMode: 'drape',
    extensions: [new TerrainExtension()]
  });

  let viewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -160,
    latitude: 0,
    zoom: 2
  });
  await lifecycle.update({viewport, layers: [terrainSource, overlay, scatterplotLayer]});

  const targetLayer = lifecycle.layers.find(l => l.id === 'terrain-0-1-2');
  const tc = new TerrainCover(targetLayer);
  let drapeLayers = lifecycle.layers.filter(
    l => !l.isComposite && l.state.terrainDrawMode === 'drape'
  );
  expect(drapeLayers.length >= 5, 'Found drape layers').toBeTruthy();
  expect(tc.shouldUpdate({targetLayer, layers: drapeLayers}), 'Should require update').toBeTruthy();
  expect(tc.layers, 'Correctly culled layers').toEqual([
    'overlay-0-1-2-points-circle',
    'scatterplot'
  ]);

  await lifecycle.update({layers: [terrainSource, scatterplotLayer, overlay]});
  drapeLayers = lifecycle.layers.filter(l => !l.isComposite && l.state.terrainDrawMode === 'drape');
  expect(tc.shouldUpdate({targetLayer, layers: drapeLayers}), 'Should require update').toBeTruthy();
  expect(tc.layers, 'Correctly culled layers').toEqual([
    'scatterplot',
    'overlay-0-1-2-points-circle'
  ]);

  tc.delete();
  lifecycle.finalize();
});
