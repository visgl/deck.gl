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

import {createGLContext} from 'luma.gl';
import {WebMercatorViewport} from '../src/lib/viewports';
import {TEST_EXPORTS as LAYER_TEST_EXPORTS} from '../src/lib/layer';

const {mergeDefaultProps} = LAYER_TEST_EXPORTS;

/**
 * Covert all numbers in a deep structure to a given precision, allowing
 * reliable float comparisons. Converts data in-place.
 * @param  {mixed} input      Input data
 * @param  {Number} [precision] Desired precision
 * @return {mixed}            Input data, with all numbers converted
 */
export function toLowPrecision(input, precision = 11) {
  /* eslint-disable guard-for-in */
  if (typeof input === 'number') {
    input = Number(input.toPrecision(precision));
  }
  if (Array.isArray(input)) {
    input = input.map(item => toLowPrecision(item, precision));
  }
  if (typeof input === 'object') {
    for (const key in input) {
      input[key] = toLowPrecision(input[key], precision);
    }
  }
  return input;
}

// Create and reuse a default context if none is supplied
let glContext = null;

function getGLContext() {
  glContext = glContext || createGLContext();
  return glContext;
}

function getViewport() {
  return new WebMercatorViewport({width: 100, height: 100});
}

export function testInitializeLayer({gl, layer, viewport}) {
  gl = gl || getGLContext();
  viewport = viewport || getViewport();

  const oldContext = {gl, viewport};
  const context = {gl, viewport};
  let failures = 0;
  try {
    layer.context = context;

    layer.initializeLayer({
      oldProps: {},
      props: layer.props,
      oldContext,
      context,
      changeFlags: layer.diffProps({}, layer.props, context)
    });

    layer.updateLayer({
      oldProps: {},
      props: layer.props,
      oldContext,
      context,
      changeFlags: layer.diffProps({}, layer.props, context)
    });
  } catch (error) {
    failures++;
  }
  return failures;
}

export function testUpdateLayer({gl, layer, viewport, newProps}) {
  gl = gl || getGLContext();
  viewport = viewport || getViewport();

  const oldContext = layer.context || {gl, viewport};
  const context = {gl, viewport};
  const oldProps = layer.oldProps || layer.props || {};

  const mergedDefaultProps = mergeDefaultProps(layer);
  layer.props = Object.assign({}, mergedDefaultProps, newProps);

  let failures = 0;
  try {
    layer.updateLayer({
      oldProps,
      props: layer.props,
      oldContext,
      context,
      changeFlags: layer.diffProps(oldProps, layer.props, context)
    });
  } catch (error) {
    failures++;
  }
  return failures;
}
