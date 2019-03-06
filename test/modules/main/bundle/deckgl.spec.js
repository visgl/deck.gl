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
import deckgl from 'deck.gl/../bundle';

test('standalone#imports', t => {
  t.ok(deckgl.version, 'version is exported');
  t.ok(deckgl.DeckGL, 'DeckGL class is exported');
  t.ok(deckgl.WebMercatorViewport, 'WebMercatorViewport class is exported');
  t.ok(deckgl.Layer, 'Layer class is exported');
  t.ok(deckgl.ScatterplotLayer, 'ScatterplotLayer class is exported');

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
