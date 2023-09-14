/* global setTimeout */
import {Deck, Layer} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils';

export function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

export function testAsyncData(t, data) {
  class TestLayer extends Layer {
    initializeState() {}

    updateState({props, oldProps, changeFlags}) {
      if (oldProps.data) {
        t.ok(props.data.length > oldProps.data.length, 'data has changed');
      }
      if (Array.isArray(changeFlags.dataChanged)) {
        t.is(
          changeFlags.dataChanged[0].startRow,
          oldProps.data.length,
          'data diff starts from last position'
        );
        t.is(
          changeFlags.dataChanged[changeFlags.dataChanged.length - 1].endRow,
          props.data.length,
          'data diff covers rest of range'
        );
      }
    }
  }

  return new Promise(resolve => {
    let loadedData = null;

    const deck = new Deck({
      device,
      width: 1,
      height: 1,
      viewState: {longitude: 0, latitude: 0, zoom: 0},

      layers: [
        new TestLayer({
          data,
          onDataLoad: value => {
            loadedData = value;
          }
        })
      ],

      onAfterRender: () => {
        if (loadedData) {
          deck.finalize();
          resolve(loadedData);
        }
      }
    });
  });
}
