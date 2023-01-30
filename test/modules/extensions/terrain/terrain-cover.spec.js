import test from 'tape-promise/tape';
import TerrainCover from '@deck.gl/extensions/terrain/terrain-cover';
import {TerrainExtension} from '@deck.gl/extensions';

import {WebMercatorViewport, OrthographicViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {TileLayer} from '@deck.gl/geo-layers';
import {LifecycleTester} from '../utils';

test('TerrainCover#viewport diffing#geo', async t => {
  const lifecycle = new LifecycleTester();
  let viewport = new WebMercatorViewport({width: 400, height: 300, zoom: 0});
  let owner = new ScatterplotLayer();

  await lifecycle.update({viewport, layers: [owner]});

  const tc = new TerrainCover(owner);
  t.notOk(tc.shouldUpdate({viewport}), 'Should not need update');
  t.notOk(tc.commonBounds, 'Empty owner does not have bounds');
  t.notOk(tc.renderTexture, 'Render texture should be empty');
  t.notOk(tc.pickingTexture, 'Picking texture should be empty');

  owner = new ScatterplotLayer({
    data: [
      [-90, -40.97989806962013],
      [0, 0]
    ],
    getPosition: d => d
  });
  await lifecycle.update({viewport, layers: [owner]});

  t.ok(tc.shouldUpdate({owner, viewport}), 'Should require update');
  t.deepEqual(
    tc.commonBounds,
    [
      [128, 192, 0],
      [256, 256, 0]
    ],
    'Common bounds'
  );
  t.ok(tc.renderViewport instanceof WebMercatorViewport, 'Render viewport');
  t.is(tc.renderViewport.zoom, 0, 'Render viewport zoom');

  viewport = new WebMercatorViewport({width: 400, height: 300, zoom: 0.5});
  t.notOk(tc.shouldUpdate({owner, viewport}), 'Should not need update');

  viewport = new WebMercatorViewport({width: 400, height: 300, zoom: 2});
  t.ok(tc.shouldUpdate({owner, viewport}), 'Should require update');
  t.is(tc.renderViewport.zoom, 2, 'Render viewport zoom');

  tc.delete();
  lifecycle.finalize();
  t.end();
});

test('TerrainCover#viewport diffing#non-geo', async t => {
  const lifecycle = new LifecycleTester();
  const viewport = new OrthographicViewport({width: 400, height: 300, zoom: 0});
  const owner = new ScatterplotLayer({
    data: [
      [-90, -40],
      [0, 20]
    ],
    getPosition: d => d
  });

  await lifecycle.update({viewport, layers: [owner]});

  const tc = new TerrainCover(owner);
  t.ok(tc.shouldUpdate({owner, viewport}), 'Should require update');
  t.deepEqual(
    tc.commonBounds,
    [
      [-90, -40, 0],
      [0, 20, 0]
    ],
    'Common bounds'
  );
  t.ok(tc.renderViewport instanceof OrthographicViewport, 'Render viewport');
  t.is(tc.renderViewport.zoom, 0, 'Render viewport zoom');

  tc.delete();
  lifecycle.finalize();
  t.end();
});

test('TerrainCover#layers diffing#non-geo', async t => {
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
    terrainFittingMode: 'drape',
    extensions: [new TerrainExtension()]
  });
  const scatterplotLayer = new ScatterplotLayer({
    id: 'scatterplot',
    terrainFittingMode: 'drape',
    extensions: [new TerrainExtension()]
  });

  let viewport = new OrthographicViewport({width: 800, height: 600, zoom: 0, target: [400, 300]});
  await lifecycle.update({viewport, layers: [terrainSource, overlay, scatterplotLayer]});

  const owner = lifecycle.layers.find(l => l.id === 'terrain-0-0-0');
  const tc = new TerrainCover(owner);
  let drapeLayers = lifecycle.layers.filter(
    l => !l.isComposite && l.state.terrainFittingMode === 'drape'
  );
  t.ok(drapeLayers.length >= 5, 'Found drape layers');
  t.ok(tc.shouldUpdate({owner, layers: drapeLayers}), 'Should require update');
  t.deepEqual(tc.layers, ['overlay-0-0-0-points-circle', 'scatterplot'], 'Correctly culled layers');

  viewport = new OrthographicViewport({width: 800, height: 600, zoom: 0, target: [-400, -300]});
  await lifecycle.update({viewport});

  drapeLayers = lifecycle.layers.filter(
    l => !l.isComposite && l.state.terrainFittingMode === 'drape'
  );
  t.ok(drapeLayers.length >= 9, 'Found drape layers');
  t.notOk(tc.shouldUpdate({owner, layers: drapeLayers}), 'Should not need update');

  await lifecycle.update({layers: [terrainSource, overlay]});
  drapeLayers = lifecycle.layers.filter(
    l => !l.isComposite && l.state.terrainFittingMode === 'drape'
  );
  t.ok(tc.shouldUpdate({owner, layers: drapeLayers}), 'Should require update');
  t.deepEqual(tc.layers, ['overlay-0-0-0-points-circle'], 'Correctly culled layers');

  tc.delete();
  lifecycle.finalize();
  t.end();
});

test('TerrainCover#layers diffing#geo', async t => {
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
    terrainFittingMode: 'drape',
    extensions: [new TerrainExtension()]
  });
  const scatterplotLayer = new ScatterplotLayer({
    id: 'scatterplot',
    terrainFittingMode: 'drape',
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

  const owner = lifecycle.layers.find(l => l.id === 'terrain-0-1-2');
  const tc = new TerrainCover(owner);
  let drapeLayers = lifecycle.layers.filter(
    l => !l.isComposite && l.state.terrainFittingMode === 'drape'
  );
  t.ok(drapeLayers.length >= 5, 'Found drape layers');
  t.ok(tc.shouldUpdate({owner, layers: drapeLayers}), 'Should require update');
  t.deepEqual(tc.layers, ['overlay-0-1-2-points-circle', 'scatterplot'], 'Correctly culled layers');

  tc.delete();
  lifecycle.finalize();
  t.end();
});
