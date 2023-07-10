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
import test from 'tape';
import {_enableDOMLogging as enableDOMLogging} from '@probe.gl/test-utils';

// import '@luma.gl/debug';

let failed = false;
// @ts-expect-error browserTestDriver_finish injected by BrowserTestDriver
test.onFinish(window.browserTestDriver_finish);
test.onFailure(() => {
  failed = true;
  // @ts-expect-error browserTestDriver_fail injected by BrowserTestDriver
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

import './modules';

// Tests currently only work in browser
import './modules/json/json-render.spec';
import './modules/main/bundle';
import './modules/aggregation-layers/utils/gpu-grid-aggregator.spec';
import './modules/aggregation-layers/gpu-cpu-aggregator.spec';
import './modules/aggregation-layers/gpu-grid-layer/gpu-grid-layer.spec';
import './modules/aggregation-layers/heatmap-layer/heatmap-layer.spec';
// TODO disabled for v9, restore ASAP
// import './modules/carto/layers/raster-tile-layer.spec';
// import './modules/core/lib/pick-layers.spec';

import './render';
// TODO disabled for v9, restore ASAP
// import './interaction';
