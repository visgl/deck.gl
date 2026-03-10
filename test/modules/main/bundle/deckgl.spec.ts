// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import * as deckgl from 'deck.gl/../bundle';

test('standalone#imports', () => {
  expect(deckgl.VERSION, 'version is exported').toBeTruthy();
  expect(deckgl.DeckGL, 'DeckGL class is exported').toBeTruthy();
  expect(deckgl.WebMercatorViewport, 'WebMercatorViewport class is exported').toBeTruthy();
  expect(deckgl.Layer, 'Layer class is exported').toBeTruthy();
  expect(deckgl.ScatterplotLayer, 'ScatterplotLayer class is exported').toBeTruthy();

  expect(globalThis.deck, 'deck namespace is exported').toBeTruthy();
  expect(globalThis.luma, 'luma namespace is exported').toBeTruthy();
  expect(globalThis.luma.enforceWebGL2, 'enforceWebGL2 is exported').toBeTruthy();
  expect(globalThis.loaders, 'loaders namespace is exported').toBeTruthy();
});

test('standalone#DeckGL', () => {
  const deck = new deckgl.DeckGL({
    longitude: -122.45,
    latitude: 37.8,
    zoom: 12,
    layers: [
      new deckgl.ScatterplotLayer({
        data: [{position: [-122.45, 37.8], color: [255, 0, 0], radius: 100}]
      })
    ],
    onAfterRender: () => {
      expect(
        Object.keys(deck.viewManager.controllers).length > 0,
        'component has controller'
      ).toBeTruthy();

      deck.finalize();

      expect(deck.layerManager, 'component is finalized').toBeFalsy();
      expect(deck.viewManager, 'component is finalized').toBeFalsy();
    }
  });

  expect(deck, 'DeckGL constructor does not throw error').toBeTruthy();
});
