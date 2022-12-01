import test from 'tape-promise/tape';
import {LayerManager, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import DeckPicker from '@deck.gl/core/lib/deck-picker';
import {device} from '@deck.gl/test-utils';

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

test('DeckPicker#getPickingRect', t => {
  const deckPicker = new DeckPicker(device);

  for (const testCase of DEVICE_RECT_TEST_CASES) {
    t.deepEqual(
      deckPicker._getPickingRect(testCase.input),
      testCase.output,
      `${testCase.title}: returns correct result`
    );
  }

  t.end();
});

// TODO - luma v9 disable - picking somehow broken
/* eslint-disable max-statements */
test.skip('DeckPicker#pick empty', t => {
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
  t.deepEqual(output.result, [], 'No layer is picked');
  t.ok(output.emptyInfo.x, 'emptyInfo.x is populated');
  t.ok(output.emptyInfo.coordinate[0], 'emptyInfo.coordinate is populated');

  output = deckPicker.pickObjects(opts);
  t.deepEqual(output, [], 'No layer is picked');

  t.notOk(deckPicker.pickingFBO, 'pickingFBO is not generated');

  opts.layers = [layer];
  deckPicker.setProps({_pickable: false});
  output = deckPicker.pickObject(opts);
  t.deepEqual(output.result, [], 'No layer is picked');

  t.notOk(deckPicker.pickingFBO, 'pickingFBO is not generated');

  deckPicker.setProps({_pickable: true});
  output = deckPicker.pickObject(opts);
  t.is(output.result[0].layer, layer, 'Layer is picked');

  t.ok(deckPicker.pickingFBO, 'pickingFBO is generated');

  layerManager.finalize();
  deckPicker.finalize();

  t.end();
});
