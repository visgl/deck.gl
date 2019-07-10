/* global setTimeout */
import {Deck, Layer} from '@deck.gl/core';
import {gl} from '@deck.gl/test-utils';

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
        t.ok(changeFlags.dataChanged[0].endRow, 'data diff is generated');
      }
    }
  }

  return new Promise(resolve => {
    const deck = new Deck({
      gl,
      width: 1,
      height: 1,
      viewState: {longitude: 0, latitude: 0, zoom: 0},

      layers: [
        new TestLayer({
          data,
          onDataLoad: value => {
            deck.finalize();
            resolve(value);
          }
        })
      ]
    });
  });
}
