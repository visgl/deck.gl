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

/* eslint-disable no-unused-vars */
import test from 'tape-catch';
import React, {createElement} from 'react';
import utils from 'react-dom/test-utils';

import DeckGL from '@deck.gl/react';
import {Viewport, WebMercatorViewport} from '@deck.gl/core';

const TEST_DATA = {
  mapState: {
    width: 793,
    height: 775,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    bearing: -44.48928121059271,
    pitch: 43.670797287818566
    // altitude: undefined
  }
};

test('Rendering DeckGL overlay without viewport params', t => {
  // TODO - should this work? A default WebMercatorViewport?
  const component = utils.renderIntoDocument(
    createElement(DeckGL, {width: 100, height: 100, layers: []})
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});

test('Rendering DeckGL overlay with viewport params', t => {
  const component = utils.renderIntoDocument(
    createElement(DeckGL, Object.assign({}, TEST_DATA.mapState, {layers: []}))
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});

test('Rendering DeckGL overlay with Viewport', t => {
  const viewport = new Viewport();
  const component = utils.renderIntoDocument(
    createElement(DeckGL, {width: 100, height: 100, viewport, layers: []})
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});

test('Rendering DeckGL overlay with WebMercatorViewport', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  const component = utils.renderIntoDocument(
    createElement(DeckGL, {width: 100, height: 100, viewport, layers: []})
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});
