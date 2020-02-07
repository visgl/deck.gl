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

/* eslint-disable no-console, no-invalid-this */
import * as data from 'deck.gl-test/data';

import {LayerManager, MapView, DeckRenderer} from '@deck.gl/core';
import {ScatterplotLayer, GeoJsonLayer} from '@deck.gl/layers';
import {gl} from '@deck.gl/test-utils';

// import {testInitializeLayer} from '@deck.gl/test-utils';

let testIdx = 0;
const testLayer = new ScatterplotLayer({data: data.points});

const testViewport = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: 0, latitude: 0, zoom: 1}
});

const layerManager = new LayerManager(gl, {viewport: testViewport});
const deckRenderer = new DeckRenderer(gl);

// add tests

export default function layerBench(suite) {
  return suite
    .group('LAYER UTILS')

    .add('initialize layers', () => {
      testIdx++;
      layerManager.setLayers(
        Array.from(
          {length: 100},
          (_, i) =>
            new ScatterplotLayer({
              id: `test-${testIdx}-layer-${i}`
            })
        )
      );
    })
    .add('update layers', () => {
      const newData = new Array(1000).fill({position: [0, 0], color: [0, 0, 0]});
      layerManager.setLayers(
        Array.from(
          {length: 100},
          (_, i) =>
            new ScatterplotLayer({
              id: `test-${testIdx}-layer-${i}`,
              data: newData,
              getPosition: d => d.position,
              getFillColor: d => d.color
            })
        )
      );
    })
    .add('draw layers', () => {
      deckRenderer.renderLayers({
        viewports: [testViewport],
        layers: layerManager.getLayers(),
        onViewportActive: layerManager.activateViewport
      });
    })
    .add(
      'initialize layers - composite',
      () => {
        // clean up
        layerManager.setLayers([]);
      },
      () => {
        testIdx++;
        layerManager.setLayers(
          Array.from(
            {length: 100},
            (_, i) =>
              new GeoJsonLayer({
                id: `test-${testIdx}-geojson-layer-${i}`,
                data: data.geojson,
                stroked: true,
                filled: true
              })
          )
        );
      }
    )
    .add('update layers - composite', () => {
      const newData = {...data.geojson};
      layerManager.setLayers(
        Array.from(
          {length: 100},
          (_, i) =>
            new GeoJsonLayer({
              id: `test-${testIdx}-geojson-layer-${i}`,
              data: newData,
              stroked: true,
              filled: true
            })
        )
      );
    })
    .add('encoding picking color', () => {
      testIdx++;
      if ((testIdx + 1) >> 24) {
        testIdx = 0;
      }
      testLayer.encodePickingColor(testIdx);
    })
    .add('calculate instance picking colors', () => {
      const numInstances = 1e6;
      const target = new Uint8ClampedArray(numInstances * 3);
      testLayer.calculateInstancePickingColors({value: target, size: 3}, {numInstances});
    });
}
