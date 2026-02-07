// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import DeckPicker from '@deck.gl/core/lib/deck-picker';
import {device} from '@deck.gl/test-utils/vitest';

const DEVICE_RECT_TEST_CASES = [
  {
    title: 'at center with radius',
    input: {deviceX: 5, deviceY: 5, deviceRadius: 1, deviceWidth: 10, deviceHeight: 10},
    output: {x: 4, y: 4, width: 3, height: 3}
  },
  {
    title: 'at center without radius',
    input: {deviceX: 5, deviceY: 5, deviceRadius: 0, deviceWidth: 10, deviceHeight: 10},
    output: {x: 5, y: 5, width: 1, height: 1}
  },
  {
    title: 'clipped by bounds',
    input: {deviceX: 0, deviceY: 10, deviceRadius: 1, deviceWidth: 10, deviceHeight: 10},
    output: {x: 0, y: 9, width: 2, height: 1}
  },
  {
    title: 'x out of bounds',
    input: {deviceX: -1, deviceY: 1, deviceRadius: 0, deviceWidth: 1, deviceHeight: 1},
    output: null
  },
  {
    title: 'y out of bounds',
    input: {deviceX: 0, deviceY: 2, deviceRadius: 0, deviceWidth: 1, deviceHeight: 1},
    output: null
  }
];

test('DeckPicker#getPickingRect', () => {
  const deckPicker = new DeckPicker(device);

  for (const testCase of DEVICE_RECT_TEST_CASES) {
    expect(
      deckPicker._getPickingRect(testCase.input),
      `${testCase.title}: returns correct result`
    ).toEqual(testCase.output);
  }
});

/* eslint-disable max-statements */
test('DeckPicker#pick empty', () => {
  const deckPicker = new DeckPicker(device);
  const view = new MapView();
  const viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const layerManager = new LayerManager(device, {viewport});

  const opts = {
    layers: [],
    views: [view],
    viewports: [viewport],
    effects: [],
    onViewportActive: layerManager.activateViewport,
    x: 1,
    y: 1
  };

  const layer = new ScatterplotLayer({
    data: [{position: [0, 0]}, {position: [0, 0]}],
    radiusMinPixels: 100,
    pickable: true
  });
  layerManager.setLayers([layer]);

  let output = deckPicker.pickObject(opts);
  expect(output.result, 'No layer is picked').toEqual([]);
  expect(output.emptyInfo.x, 'emptyInfo.x is populated').toBeTruthy();
  expect(output.emptyInfo.coordinate[0], 'emptyInfo.coordinate is populated').toBeTruthy();

  output = deckPicker.pickObjects(opts);
  expect(output, 'No layer is picked').toEqual([]);

  expect(deckPicker.pickingFBO, 'pickingFBO is not generated').toBeFalsy();

  opts.layers = [layer];
  deckPicker.setProps({_pickable: false});
  output = deckPicker.pickObject(opts);
  expect(output.result, 'No layer is picked').toEqual([]);

  expect(deckPicker.pickingFBO, 'pickingFBO is not generated').toBeFalsy();

  deckPicker.setProps({_pickable: true});
  output = deckPicker.pickObject(opts);
  expect(output.result[0].layer, 'Layer is picked').toBe(layer);

  expect(deckPicker.pickingFBO, 'pickingFBO is generated').toBeTruthy();

  layerManager.finalize();
  deckPicker.finalize();
});
