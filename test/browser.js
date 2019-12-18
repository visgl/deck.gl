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

/* global window */
const test = require('tape');
const {_enableDOMLogging: enableDOMLogging} = require('@probe.gl/test-utils');

// require('@luma.gl/debug');

let failed = false;
test.onFinish(window.browserTestDriver_finish);
test.onFailure(() => {
  failed = true;
  window.browserTestDriver_fail();
});

// tap-browser-color alternative
enableDOMLogging({
  getStyle: message => ({
    background: failed ? '#F28E82' : '#8ECA6C',
    position: 'absolute',
    top: '500px',
    width: '100%'
  })
});

test('deck.gl', t => {
  require('./modules');

  // Tests currently only work in browser
  require('./modules/json/json-render.spec');
  require('./modules/main/bundle');
  require('./modules/aggregation-layers/utils/gpu-grid-aggregator.spec');
  require('./modules/aggregation-layers/gpu-cpu-aggregator.spec');
  require('./modules/aggregation-layers/gpu-grid-layer/gpu-grid-layer.spec');
  require('./modules/aggregation-layers/heatmap-layer/heatmap-layer.spec');
  require('./modules/core/lib/pick-layers.spec');

  require('./render');
  require('./interaction');

  t.end();
});
