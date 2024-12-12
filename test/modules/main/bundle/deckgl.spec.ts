// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-catch';
import * as deckgl from 'deck.gl/../bundle';

test('standalone#imports', t => {
  t.ok(deckgl.VERSION, 'version is exported');
  t.ok(deckgl.DeckGL, 'DeckGL class is exported');
  t.ok(deckgl.WebMercatorViewport, 'WebMercatorViewport class is exported');
  t.ok(deckgl.Layer, 'Layer class is exported');
  t.ok(deckgl.ScatterplotLayer, 'ScatterplotLayer class is exported');

  t.ok(globalThis.deck, 'deck namespace is exported');
  t.ok(globalThis.luma, 'luma namespace is exported');
  t.ok(globalThis.luma.enforceWebGL2, 'enforceWebGL2 is exported');
  t.ok(globalThis.loaders, 'loaders namespace is exported');

  t.end();
});

test('standalone#DeckGL', t => {
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
      t.ok(Object.keys(deck.viewManager.controllers).length > 0, 'component has controller');

      deck.finalize();

      t.notOk(deck.layerManager, 'component is finalized');
      t.notOk(deck.viewManager, 'component is finalized');

      t.end();
    }
  });

  t.ok(deck, 'DeckGL constructor does not throw error');
});
