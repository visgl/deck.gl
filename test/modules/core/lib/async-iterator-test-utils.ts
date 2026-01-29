// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global setTimeout */
import {expect} from 'vitest';
import {Deck, Layer} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils';

export function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

export function testAsyncData(data) {
  class TestLayer extends Layer {
    initializeState() {}

    updateState({props, oldProps, changeFlags}) {
      if (oldProps.data) {
        expect(props.data.length > oldProps.data.length, 'data has changed').toBeTruthy();
      }
      if (Array.isArray(changeFlags.dataChanged)) {
        expect(changeFlags.dataChanged[0].startRow, 'data diff starts from last position').toBe(oldProps.data.length);
        expect(changeFlags.dataChanged[changeFlags.dataChanged.length - 1].endRow, 'data diff covers rest of range').toBe(props.data.length);
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
