import test from 'tape-promise/tape';
import {HeightMapBuilder} from '@deck.gl/extensions/terrain/height-map-builder';
import {WebMercatorViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {LifecycleTester} from '../utils';

test('HeightMapBuilder#diffing', async t => {
  const lifecycle = new LifecycleTester();
  let viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 0
  });
  let terrainLayer = new ScatterplotLayer();

  await lifecycle.update({viewport, layers: [terrainLayer]});

  const heightMap = new HeightMapBuilder(terrainLayer.context.device);

  t.notOk(
    heightMap.shouldUpdate({layers: [terrainLayer], viewport}),
    'Height map should not require update'
  );
  t.notOk(heightMap.renderViewport, 'renderViewport is disabled');

  terrainLayer = new ScatterplotLayer({
    data: [
      [-90, -40.97989806962013],
      [0, 0]
    ],
    getPosition: d => d
  });
  await lifecycle.update({viewport, layers: [terrainLayer]});

  t.ok(
    heightMap.shouldUpdate({layers: [terrainLayer], viewport}),
    'Height map needs update (bounds changed)'
  );
  t.deepEqual(heightMap.bounds, [128, 192, 256, 256], 'Cartesian bounds');
  t.ok(heightMap.renderViewport, 'renderViewport is populated');

  t.notOk(
    heightMap.shouldUpdate({layers: [terrainLayer], viewport}),
    'Height map should not require update'
  );

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 1
  });
  t.ok(
    heightMap.shouldUpdate({layers: [terrainLayer], viewport}),
    'Height map needs update (viewport changed)'
  );

  heightMap.delete();
  lifecycle.finalize();
  t.end();
});
