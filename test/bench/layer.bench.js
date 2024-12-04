// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */
import * as data from 'deck.gl-test/data';

import {LayerManager, MapView, DeckRenderer} from '@deck.gl/core';
import {ScatterplotLayer, GeoJsonLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils';

// import {testInitializeLayer} from '@deck.gl/test-utils';

let testIdx = 0;
const testLayer = new ScatterplotLayer({data: data.points});

const testViewport = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: 0, latitude: 0, zoom: 1}
});

const layerManager = new LayerManager(device, {viewport: testViewport});
const deckRenderer = new DeckRenderer(device);

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
      {
        initialize: () => {
          // clean up
          layerManager.setLayers([]);
        }
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
      const target = new Uint8ClampedArray(numInstances * 4);
      testLayer.internalState = {};
      testLayer.calculateInstancePickingColors({value: target, size: 4}, {numInstances});
    });
}
