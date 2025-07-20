// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {TerrainCover} from '@deck.gl/extensions/terrain/terrain-cover';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

import {WebMercatorViewport, OrthographicViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {TileLayer} from '@deck.gl/geo-layers';
import {LifecycleTester} from '../utils';

test('TerrainCover#viewport diffing#geo#not tiled', async t => {
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
  t.notOk(tc.shouldUpdate({viewport}), 'Should not need update');
  t.notOk(tc.bounds, 'Empty targetLayer does not have bounds');
  t.notOk(tc.renderTexture, 'Render texture should be empty');
  t.notOk(tc.pickingTexture, 'Picking texture should be empty');

  targetLayer = new ScatterplotLayer({
    data: [
      [-90, -40.97989806962013],
      [0, 0]
    ],
    getPosition: d => d
  });
  await lifecycle.update({viewport, layers: [targetLayer]});

  t.ok(tc.shouldUpdate({targetLayer, viewport}), 'Should require update');
  t.deepEqual(tc.bounds, [128, 192, 256, 256], 'Cartesian bounds');
  t.ok(tc.renderViewport instanceof WebMercatorViewport, 'Render viewport');
  t.is(tc.renderViewport.zoom, 1, 'Render viewport zoom');

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 0.1
  });
  t.notOk(tc.shouldUpdate({targetLayer, viewport}), 'Should not need update');

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 5
  });
  t.ok(tc.shouldUpdate({targetLayer, viewport}), 'Should require update - zoom');
  t.is(tc.renderViewport.zoom, 6, 'Render viewport zoom');

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -80,
    latitude: 0,
    zoom: 5
  });
  t.ok(tc.shouldUpdate({targetLayer, viewport}), 'Should require update - bounds');

  tc.delete();
  lifecycle.finalize();
  t.end();
});

test('TerrainCover#viewport diffing#geo#tiled', async t => {
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
  t.ok(tc.shouldUpdate({viewport}), 'Should require update');
  t.deepEqual(tc.bounds, [128, 192, 256, 256], 'Cartesian bounds');
  t.ok(tc.renderViewport instanceof WebMercatorViewport, 'Render viewport');
  t.is(tc.renderViewport.zoom, 1, 'Render viewport zoom');

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 5
  });
  t.notOk(tc.shouldUpdate({targetLayer, viewport}), 'Should not need update');

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -80,
    latitude: 0,
    zoom: 5
  });
  t.notOk(tc.shouldUpdate({targetLayer, viewport}), 'Should not need update');

  tc.delete();
  lifecycle.finalize();
  t.end();
});

test('TerrainCover#viewport diffing#non-geo', async t => {
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
  t.ok(tc.shouldUpdate({targetLayer, viewport}), 'Should require update');
  t.deepEqual(tc.bounds, [-90, -40, 0, 20], 'Common bounds');
  t.ok(tc.renderViewport instanceof OrthographicViewport, 'Render viewport');
  t.is(tc.renderViewport.zoom, 1, 'Render viewport zoom');

  tc.delete();
  lifecycle.finalize();
  t.end();
});

test.skip('TerrainCover#layers diffing#non-geo', async t => {
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
  t.ok(drapeLayers.length >= 5, 'Found drape layers');
  t.ok(tc.shouldUpdate({targetLayer, layers: drapeLayers}), 'Should require update');
  t.deepEqual(tc.layers, ['overlay-0-0-0-points-circle', 'scatterplot'], 'Correctly culled layers');

  viewport = new OrthographicViewport({width: 800, height: 600, zoom: 0, target: [-400, -300]});
  await lifecycle.update({viewport});

  drapeLayers = lifecycle.layers.filter(l => !l.isComposite && l.state.terrainDrawMode === 'drape');
  t.ok(drapeLayers.length >= 9, 'Found drape layers');
  t.notOk(tc.shouldUpdate({targetLayer, layers: drapeLayers}), 'Should not need update');

  await lifecycle.update({layers: [terrainSource, overlay]});
  drapeLayers = lifecycle.layers.filter(l => !l.isComposite && l.state.terrainDrawMode === 'drape');
  t.ok(tc.shouldUpdate({targetLayer, layers: drapeLayers}), 'Should require update');
  t.deepEqual(tc.layers, ['overlay-0-0-0-points-circle'], 'Correctly culled layers');

  tc.delete();
  lifecycle.finalize();
  t.end();
});

test.skip('TerrainCover#layers diffing#geo', async t => {
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
  t.ok(drapeLayers.length >= 5, 'Found drape layers');
  t.ok(tc.shouldUpdate({targetLayer, layers: drapeLayers}), 'Should require update');
  t.deepEqual(tc.layers, ['overlay-0-1-2-points-circle', 'scatterplot'], 'Correctly culled layers');

  await lifecycle.update({layers: [terrainSource, scatterplotLayer, overlay]});
  drapeLayers = lifecycle.layers.filter(l => !l.isComposite && l.state.terrainDrawMode === 'drape');
  t.ok(tc.shouldUpdate({targetLayer, layers: drapeLayers}), 'Should require update');
  t.deepEqual(tc.layers, ['scatterplot', 'overlay-0-1-2-points-circle'], 'Correctly culled layers');

  tc.delete();
  lifecycle.finalize();
  t.end();
});
