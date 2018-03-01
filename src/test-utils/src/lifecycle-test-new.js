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

import {LayerManager, WebMercatorViewport} from 'deck.gl';
import {makeSpy} from 'probe.gl/test';
import gl from './utils/setup-gl';

function checkDoesNotThrow(func, comment, userData) {
  try {
    return func();
  } catch (error) {
    return error;
  }
}

export function testLayer({
  Layer,
  testCases,
  spies = [],
  userData = null,
  doesNotThrow = checkDoesNotThrow
}) {
  // assert(Layer && testCases && testCases.length >= 1);

  const layerManager = new LayerManager(gl);
  layerManager.setViewport(new WebMercatorViewport(100, 100));

  const initialProps = testCases[0].props;
  const layer = new Layer(initialProps);

  doesNotThrow(
    () => layerManager.setLayers([layer]),
    `initialization of ${Layer.layerName} should not fail`,
    userData
  );

  runLayerTests(layerManager, layer, testCases, spies, userData, doesNotThrow);
}

/* eslint-disable max-params, no-loop-func */
function runLayerTests(layerManager, layer, testCases, spies, userData, doesNotThrow) {
  const initialProps = testCases[0].props;
  const newProps = Object.assign({}, initialProps);

  // Run successive update tests
  for (let i = 1; i < testCases.length; i++) {
    const {props, assert} = testCases[i];

    spies = testCases[i].spies || spies;

    // Create a map of spies that the test case can inspect
    const spyMap = {};
    if (spies) {
      for (const functionName of spies) {
        spyMap[functionName] = makeSpy(Object.getPrototypeOf(layer), functionName);
      }
    }

    // Add on new props every iteration
    Object.assign(newProps, props);

    // copy old state before update
    const oldState = Object.assign({}, layer.state);

    layer = layer.clone(newProps);
    doesNotThrow(
      () => layerManager.setLayers([layer]),
      `update ${layer} should not fail`,
      userData
    );

    // call draw layer
    doesNotThrow(() => layerManager.drawLayers(), `draw ${layer} should not fail`, userData);

    // layer manager should handle match subLayer and tranfer state and props
    // here we assume subLayer matches copy over the new props from a new subLayer
    const subLayers = layer.getSubLayers();
    const subLayer = subLayers.length && subLayers[0];

    // assert on updated layer
    if (assert) {
      assert({layer, oldState, subLayer, spies: spyMap, userData});
    }

    // Remove spies
    Object.keys(spyMap).forEach(k => spyMap[k].reset());
  }
}
/* eslint-enable parameters, no-loop-func */

/**
 * Initialize a parent layer and its subLayer
 * update the parent layer a series of newProps, assert on the updated subLayer
 *
 * Note: Updates are called sequentially. updateProps will be merged
 * with previous props
 *
 * @param {Function} t - test function
 * @param {Object} opt - test options
 * @param {Object} opt.FunctionsToSpy - Functions that spied by makeSpy
 * @param {Object} opt.Layer - The layer component class
 * @param {Array} opt.testCases - A list of testCases
 * @param {Object} opt.testCases.INITIAL_PROPS - The initial prop to initialize the layer with
 * @param {Array} opt.testCases.UPDATES - The list of updates to update
 * @param {Object} opt.testCases.UPDATES.updateProps - updated props
 * @param {Function} opt.testCases.UPDATES.assert - callbacks with updated layer, and oldState
 */
export function testSubLayerUpdateTriggers(t, {FunctionsToSpy, Layer, testCases}) {
  const layerManager = new LayerManager(gl);
  layerManager.setViewport(new WebMercatorViewport(100, 100));

  const newProps = Object.assign({}, testCases.INITIAL_PROPS);

  // initialize parent layer (generates and initializes)
  const layer = new Layer(newProps);
  t.doesNotThrow(
    () => layerManager.setLayers([layer]),
    `initialization of ${Layer.layerName} should not fail`
  );

  // Create a map of spies that the test case can inspect
  const spies = FunctionsToSpy.reduce(
    (accu, curr) =>
      Object.assign(accu, {
        [curr]: makeSpy(Layer.prototype, curr)
      }),
    {}
  );

  for (const {updateProps, assert} of testCases.UPDATES) {
    // Add on new props every iteration
    Object.assign(newProps, updateProps);

    const newLayer = layer.clone(newProps);
    t.doesNotThrow(
      () => layerManager.setLayers([newLayer]),
      `update ${Layer.layerName} should not fail`
    );

    // layer manager should handle match subLayer and tranfer state and props
    // here we assume subLayer matches copy over the new props
    // from a new subLayer
    const subLayer = layer.getSubLayers()[0];

    // assert on updated subLayer
    assert(subLayer, spies, t);

    // reset spies
    Object.keys(spies).forEach(k => spies[k].reset());
  }
}
