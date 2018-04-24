import test from 'tape-catch';
import {LayerManager, MapView, ScatterplotLayer} from '@deck.gl/core';
import {gl} from '@deck.gl/test-utils';

import * as DATA from '../../../../examples/layer-browser/src/data-samples';

const VIEW_STATE = {
  latitude: 37.751537058389985,
  longitude: -122.42694203247012,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

test('picking#pickObjects', t => {
  const layerManager = new LayerManager(gl);
  t.ok(layerManager, 'layer manager should be constructed');

  layerManager.setParameters({
    width: 300,
    height: 150,
    layers: [
      new ScatterplotLayer({
        data: DATA.points,
        getPosition: d => d.COORDINATES,
        getColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        opacity: 1,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    views: [new MapView()],
    viewState: VIEW_STATE,
    useDevicePixels: false
  });

  t.ok(layerManager, 'layer manager should be constructed');

  const pickInfos = layerManager.pickObjects({x: 0, y: 0, width: 300, height: 150});
  t.equal(pickInfos.length, 19, 'pickObjects should find expected number of objects');
  t.end();
});
