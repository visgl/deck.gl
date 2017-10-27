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

import WebMercatorViewport from 'deck.gl/core/viewports/web-mercator-viewport';

import spy from './spy';
import global from 'global';

import {ShaderCache} from 'luma.gl';

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

// return global glContext
function getGLContext() {
  return global.glContext;
}

function getViewport() {
  return new WebMercatorViewport({width: 100, height: 100});
}

export function testInitializeLayer({gl, layer, viewport}) {
  gl = gl || getGLContext();
  viewport = viewport || getViewport();

  const oldContext = {gl, viewport};
  let failures = false;
  const context = {gl, viewport, shaderCache: new ShaderCache({gl})};
  try {
    layer.context = context;

    layer.initializeLayer({props: layer.props, oldProps: {}, context, oldContext});
    layer.updateLayer({props: layer.props, oldProps: {}, context, oldContext});
  } catch (error) {
    console.log(error.message); // eslint-disable-line
    failures = error;
  }

  return failures;
}

export function testUpdateLayer({gl, layer, viewport, newProps}) {
  gl = gl || getGLContext();
  viewport = viewport || getViewport();

  const oldContext = layer.context || {gl, viewport};
  const context = {gl, viewport};

  layer.oldProps = layer.props;
  layer.props = layer._normalizeProps(newProps);

  let failure = false;
  try {
    layer.updateLayer({props: layer.props, oldProps: layer.oldProps, context, oldContext});
  } catch (error) {
    failure = error;
  }

  return failure;
}

export function testDrawLayer({layer, uniforms = {}}) {
  let failure = false;
  try {
    layer.drawLayer({uniforms});
  } catch (error) {
    failure = error;
  }

  return failure;
}

/**
 * Initialize a layer, test layer update
 * on a series of newProps, assert on the resulting layer
 *
 * Note: Updates are called sequentially. updateProps will be merged
 * with previous props
 *
 * @param {Function} t - test function
 * @param {Object} opt - test options
 * @param {Object} opt.LayerComponent - The layer component class
 * @param {Array} opt.testCases - A list of testCases
 * @param {Object} opt.testCases.INITIAL_PROPS - The initial prop to initialize the layer with
 * @param {Array} opt.testCases.UPDATES - The list of updates to update
 * @param {Object} opt.testCases.UPDATES.updateProps - updated props
 * @param {Function} opt.testCases.UPDATES.assert - callbacks with updated layer, and oldState
 */

export function testLayerUpdates(t, {LayerComponent, testCases}) {
  const layer = new LayerComponent(testCases.INITIAL_PROPS);

  let failure = testInitializeLayer({layer});
  t.notOk(failure, `initialize ${LayerComponent.layerName} should not return failure`);

  testCases.UPDATES.reduce((currentProps, {updateProps, assert}) => {

    // merge updated Props with initialProps
    const newProps = Object.assign({}, currentProps, updateProps);
    // copy over old state
    const oldState = Object.assign({}, layer.state);

    // call update layer with new props
    failure = testUpdateLayer({t, layer, newProps});
    t.notOk(failure, `update ${LayerComponent.layerName} should not return failure`);

    // call draw layer
    failure = testDrawLayer({layer});
    t.notOk(failure, `draw ${LayerComponent.layerName} should not return failure`);

    // assert on updated layer
    assert(layer, oldState, t);

    return newProps;
  }, testCases.INITIAL_PROPS);
}

/**
 * Initialize a parent layer and its subLayer
 * update the parent layer a series of newProps, assert on the updated subLayer
 *
 * Note: Updates are called sequentially. updateProps will be merged
 * with previous props
 *
 * @param {Function} t - test function
 * @param {Object} opt - test options
 * @param {Object} opt.FunctionsToSpy - Functions that spied by spy
 * @param {Object} opt.LayerComponent - The layer component class
 * @param {Array} opt.testCases - A list of testCases
 * @param {Object} opt.testCases.INITIAL_PROPS - The initial prop to initialize the layer with
 * @param {Array} opt.testCases.UPDATES - The list of updates to update
 * @param {Object} opt.testCases.UPDATES.updateProps - updated props
 * @param {Function} opt.testCases.UPDATES.assert - callbacks with updated layer, and oldState
 */

export function testSubLayerUpdateTriggers(t, {FunctionsToSpy, LayerComponent, testCases}) {
  let failures = false;
  const spies = FunctionsToSpy.reduce((accu, curr) => Object.assign(accu, {
    [curr]: spy(LayerComponent.prototype, curr)
  }), {});

  // initialize parent layer
  const layer = new LayerComponent(testCases.INITIAL_PROPS);
  failures = testInitializeLayer({layer});
  t.ok(!failures, `initialize ${LayerComponent.layerName} subLayer should not fail`);

  // initialize subLayer
  const subLayer = layer.renderLayers();

  failures = testInitializeLayer({layer: subLayer});
  t.ok(!failures, `initialize ${LayerComponent.layerName} subLayer should not fail`);

  testCases.UPDATES.reduce((currentProps, {updateProps, assert}) => {

    // merge updated Props with initialProps
    const newProps = Object.assign({}, currentProps, updateProps);

    // call update layer with new props
    testUpdateLayer({layer, newProps});

    // layer manager should handle match subLayer and tranfer state and props
    // here we assume subLayer matches copy over the new props
    // from a new subLayer
    const newSubLayer = layer.renderLayers();

    testUpdateLayer({layer: subLayer, newProps: newSubLayer.props});
    t.ok(!failures, `update ${LayerComponent.layerName} subLayer should not fail`);

    // assert on updated subLayer
    assert(subLayer, spies, t);

    // reset spies
    Object.keys(spies).forEach(k => spies[k].reset());

    return newProps;
  }, testCases.INITIAL_PROPS);

  // restore spies
  Object.keys(spies).forEach(k => spies[k].restore());
}

export function testCreateLayer(t, LayerComponent, props = {}) {
  let failures = false;
  let layer = null;

  try {
    layer = new LayerComponent(Object.assign({
      id: `${LayerComponent.layerName}-0`
    }, props));

    t.ok(layer instanceof LayerComponent, `${LayerComponent.layerName} created`);
  } catch (error) {
    failures = true;
  }
  t.ok(!failures, `creating ${LayerComponent.layerName} should not fail`);

  return layer;
}

export function testCreateEmptyLayer(t, LayerComponent, props = {}) {
  let failures = false;
  try {
    const emptyLayer = new LayerComponent(Object.assign({
      id: `empty${LayerComponent.layerName}`,
      data: [],
      pickable: true
    }, props));

    t.ok(emptyLayer instanceof LayerComponent, `Empty ${LayerComponent.layerName} created`);
  } catch (error) {
    failures = true;
  }
  t.ok(!failures, `creating empty ${LayerComponent.layerName} should not fail`);
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
