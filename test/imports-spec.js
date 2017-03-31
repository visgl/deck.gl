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
import 'luma.gl';

import DeckGL from 'deck.gl';
import {Layer, COORDINATE_SYSTEM} from 'deck.gl';
import {ChoroplethLayer, ScatterplotLayer, ScreenGridLayer, ArcLayer, LineLayer} from 'deck.gl';

test('Top-level imports', t0 => {
  t0.test('import "deck.gl"', t => {

    t.ok(Layer, 'Layer symbol imported');
    t.ok(Layer, 'Layer symbol imported');
    t.ok(ChoroplethLayer, 'ChoroplethLayer symbol imported');
    t.ok(ScatterplotLayer, 'ScatterplotLayer symbol imported');
    t.ok(ScreenGridLayer, 'ScreenGridLayer symbol imported');
    t.ok(ArcLayer, 'ArcLayer symbol imported');
    t.ok(LineLayer, 'LineLayer symbol imported');

    t.ok(Number.isFinite(COORDINATE_SYSTEM.LNGLAT), 'COORDINATE_SYSTEM.LNGLAT imported');
    t.ok(Number.isFinite(COORDINATE_SYSTEM.METERS), 'COORDINATE_SYSTEM.METERS imported');
    t.ok(Number.isFinite(COORDINATE_SYSTEM.IDENTITY), 'COORDINATE_SYSTEM.IDENTITY imported');
    t.end();
  });

  t0.test('import "deck.gl/react"', t => {
    t.ok(DeckGL, 'DeckGL symbol imported from /react');
    t.end();
  });

  t0.end();
});
