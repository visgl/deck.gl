// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
/* eslint-disable func-style, no-console, max-len */
import test from 'tape-catch';
import 'luma.gl/headless';
import {Scene, createGLContext} from 'luma.gl';

import {
  ChoroplethLayer,
  ScatterplotLayer,
  ArcLayer,
  ScreenGridLayer
} from '../../..';

// Import LayerManager to test that layers can successfully be updated
import {LayerManager} from '../../..';

// import CHOROPLETHS from '../../example/data/sf.zip.geo.json';
// const HEXAGONS_FILE = './example/data/hexagons.csv';
// const POINTS_FILE = './example/data/sf.bike.parking.csv';

const gl = createGLContext();

const FIXTURE = {

  layerState: {
    oldLayers: [],
    gl,
    scene: new Scene(gl)
  },

  mapState: {
    width: 800,
    height: 640,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5
  },

  choropleths: [],
  hexagons: [],
  points: [{position: [100, 100], color: [255, 0, 0]}],
  arcs: [{sourcePosition: [0, 0], targetPosition: [1, 3], color: [255, 0, 0]}]
};

test('imports', t => {
  t.ok(LayerManager, 'LayerManager imported');
  t.end();
});

test('ScreenGridLayer#constructor', t => {
  const {points} = FIXTURE;

  const layer = new ScreenGridLayer({
    data: points,
    pickable: false,
    opacity: 0.06
  });

  t.ok(layer, 'ScreenGridLayer created');
  t.end();
});

test('ChoroplethLayer#constructor', t => {
  const {choropleths} = FIXTURE;

  const layer = new ChoroplethLayer({
    data: choropleths,
    opacity: 0.8,
    pickable: false,
    drawContour: true
  });

  t.ok(layer, 'ChoroplethLayer created');
  t.end();
});

test('ScatterplotLayer#constructor', t => {
  const {mapState, points} = FIXTURE;

  const layer = new ScatterplotLayer({
    data: points,
    pickable: true
  });
  t.ok(layer instanceof ScatterplotLayer, 'ScatterplotLayer created');

  const emptyLayer = new ScatterplotLayer({
    id: 'emptyScatterplotLayer',
    data: [],
    pickable: true
  });
  t.ok(emptyLayer instanceof ScatterplotLayer, 'Empty ScatterplotLayer created');

  t.doesNotThrow(
    () => new ScatterplotLayer({
      id: 'nullScatterplotLayer',
      data: null,
      pickable: true
    }),
    'Null ScatterplotLayer did not throw exception'
  );

  t.doesNotThrow(
    () => {
      new LayerManager({gl})
        .setContext(mapState)
        .updateLayers({newLayers: [layer, emptyLayer]});
    },
    'ScatterplotLayer update does not throw'
  );

  t.end();
});

test('ArcLayer#constructor', t => {
  const {mapState, arcs} = FIXTURE;

  const layer = new ArcLayer({
    id: 'arcLayer',
    data: arcs,
    pickable: true
  });
  t.ok(layer instanceof ArcLayer, 'ArcLayer created');

  const emptyLayer = new ArcLayer({
    id: 'emptyArcLayer',
    data: [],
    pickable: true
  });
  t.ok(emptyLayer instanceof ArcLayer, 'Empty ArcLayer created');

  t.doesNotThrow(
    () => new ArcLayer({
      id: 'nullArcLayer',
      data: null,
      pickable: true
    }),
    'Null ArcLayer did not throw exception'
  );
  const layerManager = new LayerManager({gl});
  layerManager.setContext(mapState);
  layerManager.updateLayers({newLayers: [layer, emptyLayer]});

  t.doesNotThrow(
    () => {
    },
    'ArcLayer update does not throw'
  );

  t.end();
});
