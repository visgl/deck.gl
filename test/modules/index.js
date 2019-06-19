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

import './imports-spec';
import './core';

import './layers';
import './aggregation-layers';
import './geo-layers';

import './mapbox';
import './json';
import './react';
import './jupyter-widget';

if (typeof document !== 'undefined') {
  // Tests currently only work in browser
  require('./json/json-render.spec');

  require('./main/bundle');
  require('./aggregation-layers/utils/gpu-grid-aggregator.spec');
  require('./aggregation-layers/utils/grid-aggregation-utils.spec');
  require('./core/lib/pick-layers.spec');
} else if (typeof global !== 'undefined') {
  // Running in Node
  const {JSDOM} = require('jsdom');
  const dom = new JSDOM(`<!DOCTYPE html>`);
  // These globals are required by @jupyter-widgets/base
  /* global global */
  global.window = dom.window;
  global.navigator = dom.window.navigator;
  global.document = dom.window.document;
  global.Element = dom.window.Element;
  global.__JSDOM__ = true;

  const {gl} = require('@deck.gl/test-utils');
  // Create a dummy canvas for the headless gl context
  const canvas = global.document.createElement('canvas');
  canvas.width = gl.drawingBufferWidth;
  canvas.height = gl.drawingBufferHeight;
  gl.canvas = canvas;
}
