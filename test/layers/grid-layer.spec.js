// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

import test from 'tape-catch';
import * as data from '../data';
import {testInitializeLayer, testUpdateLayer} from '../test-utils';

import {GridLayer, GridCellLayer} from 'deck.gl';

test('GridLayer#constructor', t => {
  let layer = new GridLayer({
    id: 'emptyGeoJsonLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof GridLayer, 'Empty GridLayer created');

  layer = new GridLayer({
    data: data.points,
    cellSize: 400,
    getPosition: d => d.COORDINATES,
    pickable: true
  });
  t.ok(layer instanceof GridLayer, 'GridLayer created');

  testInitializeLayer({layer});

  const {layerData, sortedBins, valueDomain} = layer.state;
  console.log(layer.state.sortedBins.sortedBins.length)

  t.ok(layerData.length > 0, 'GridLayer.state.layerDate calculated');
  t.ok(sortedBins, 'GridLayer.state.sortedBins calculated');
  t.ok(Array.isArray(valueDomain), 'GridLayer.state.valueDomain calculated');

  t.ok(Array.isArray(sortedBins.sortedBins), 'GridLayer.state.sortedBins.sortedBins calculated');
  t.ok(Number.isFinite(sortedBins.maxCount), 'GridLayer.state.sortedBins.maxCount calculated');

  const firstSortedBin = sortedBins.sortedBins[0];
  const binTocell = layerData.find(d => d.index === firstSortedBin.i);

  t.ok(sortedBins.binMap[binTocell.index] == firstSortedBin,
    'Correct GridLayer.state.sortedBins.binMap created');

  const subLayer = layer.renderLayers();
  t.ok(subLayer instanceof GridCellLayer, 'GridCellLayer rendered');

  testUpdateLayer({layer, newProps: {
    data: data.points,

    // change cell Size
    cellSize: 1000,
    getPosition: d => d.COORDINATES,
    pickable: true
  }});

  t.doesNotThrow(
    () => new GridLayer({
      id: 'nullGridLayer',
      data: null,
      pickable: true
    }),
    'Null GridLayer did not throw exception'
  );

  t.end();
});
