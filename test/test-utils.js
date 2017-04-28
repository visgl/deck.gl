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
import sinon from 'sinon';

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

export function testDrawLayer({layer, uniforms = {}}) {
  let failures = 0;
  try {
    layer.drawLayer({uniforms});
  } catch (error) {
    failures++;
  }

  return failures;
}
// testLayerUpdates test takes a layer component, initialize it, then call testUpdateLayer
// on a series of test case, assert on the resulting layer
export function testLayerUpdates({LayerComponent, testCases, t}) {
  const layer = new LayerComponent(testCases.initialProps);
  let failures = testInitializeLayer({layer});
  t.ok(failures === 0, `initialize ${LayerComponent.layerName} should not return failure`);

  testCases.updates.reduce((currentProps, {updateProps, assert}) => {

    // merge updated Props with initialProps
    const newProps = Object.assign({}, currentProps, updateProps);
    // copy over old state
    const oldState = Object.assign({}, layer.state);

    // call update layer with new props
    failures = testUpdateLayer({layer, newProps});
    t.ok(failures === 0, `update ${LayerComponent.layerName} should not return failure`);

    // call draw layer
    failures = testDrawLayer({layer});
    t.ok(failures === 0, `draw ${LayerComponent.layerName} should not return failure`);

    // assert on updated layer
    assert(layer, oldState, t);

    return newProps;
  }, testCases.initialProps);
}

// testSubLayerUpdateTriggers test takes a layer component, initialize the parent layer,
// then the subLayer, call testUpdateLayer on a series of test case,
// assert on the resulting subLayer
export function testSubLayerUpdateTriggers(t, {FunctionsToSpy, LayerComponent, testCases}) {
  let failures = 0;
  const spies = FunctionsToSpy.reduce((accu, curr) => Object.assign(accu, {
    [curr]: sinon.spy(LayerComponent.prototype, curr)
  }), {});

  // initialize parent layer
  const layer = new LayerComponent(testCases.initialProps);
  failures = testInitializeLayer({layer});
  t.ok(failures === 0, `initialize ${LayerComponent.layerName} subLayer should not fail`);

  // initialize subLayer
  const subLayer = layer.renderLayers();

  failures = testInitializeLayer({layer: subLayer});
  t.ok(failures === 0, `initialize ${LayerComponent.layerName} subLayer should not fail`);

  testCases.updates.forEach(({newProps, assert}) => {

    // call update layer with new props
    testUpdateLayer({layer, newProps});

    // layer manager should handle match subLayer and tranfer state and props
    // here we assume subLayer matches copy over the new props
    // from a new subLayer
    const newSubLayer = layer.renderLayers();

    testUpdateLayer({layer: subLayer, newProps: newSubLayer.props});
    t.ok(failures === 0, `update ${LayerComponent.layerName} subLayer should not fail`);

    // assert on updated subLayer
    assert(subLayer, spies, t);

    // reset spies
    Object.keys(spies).forEach(k => spies[k].reset());
  });

  // restore spies
  Object.keys(spies).forEach(k => spies[k].restore());
}

export function testCreateLayer(t, LayerComponent, props = {}) {
  let failures = 0;
  try {
    const layer = new LayerComponent(Object.assign({
      id: `${LayerComponent.layerName}-0`
    }, props));
    t.ok(layer instanceof LayerComponent, `${LayerComponent.layerName} created`);

  } catch (error) {
    failures++;
  }
  t.ok(failures === 0, `creating ${LayerComponent.layerName} should not fail`);
}

export function testCreateEmptyLayer(t, LayerComponent, props = {}) {
  let failures = 0;
  try {
    const emptyLayer = new LayerComponent(Object.assign({
      id: `empty${LayerComponent.layerName}`,
      data: [],
      pickable: true
    }, props));

    t.ok(emptyLayer instanceof LayerComponent, `Empty ${LayerComponent.layerName} created`);
  } catch (error) {
    failures++;
  }
  t.ok(failures === 0, `creating empty ${LayerComponent.layerName} should not fail`);
}

export function testNullLayer(t, LayerComponent) {
  t.doesNotThrow(
    () => new LayerComponent({
      id: 'nullPathLayer',
      data: null,
      pickable: true
    }),
    `Null ${LayerComponent.layerName} did not throw exception`
  );
}
