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

import {LayerManager, WebMercatorViewport} from 'deck.gl/core';
import {spy} from 'probe.gl/test';
import gl from './utils/setup-gl';

export function testInitializeLayer({layer, viewport}) {
  const layerManager = new LayerManager(gl);
  layerManager.setViewport(new WebMercatorViewport(100, 100));

  try {
    layerManager.setLayers([layer]);
  } catch (error) {
    return error;
  }

  return null;
}

export function testUpdateLayer({layer, viewport, newProps}) {
  const layerManager = new LayerManager(gl);
  layerManager.setViewport(new WebMercatorViewport(100, 100));

  try {
    layerManager.setLayers([layer]);
    layerManager.setLayers([layer.clone(newProps)]);
  } catch (error) {
    return error;
  }

  return null;
}

export function testDrawLayer({layer, uniforms = {}}) {
  const layerManager = new LayerManager(gl);
  layerManager.setViewport(new WebMercatorViewport(100, 100));

  try {
    layerManager.setLayers([layer]);
    layerManager.drawLayers();
  } catch (error) {
    return error;
  }

  return null;
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
  const layerManager = new LayerManager(gl);
  layerManager.setViewport(new WebMercatorViewport(100, 100));

  const newProps = Object.assign({}, testCases.INITIAL_PROPS);
  const layer = new LayerComponent(newProps);

  t.doesNotThrow(
    () => layerManager.setLayers([layer]),
    `initialization of ${LayerComponent.layerName} should not fail`
  );

  for (const {updateProps, assert} of testCases.UPDATES) {
    // Add on new props every iteration
    Object.assign(newProps, updateProps);

    // copy old state before update
    const oldState = Object.assign({}, layer.state);

    const newLayer = layer.clone(newProps);
    t.doesNotThrow(
      () => layerManager.setLayers([newLayer]),
      `update ${LayerComponent.layerName} should not fail`
    );

    // call draw layer
    t.doesNotThrow(
      () => layerManager.drawLayers(),
      `draw ${LayerComponent.layerName} should not fail`
    );

    // assert on updated layer
    assert(newLayer, oldState, t);
  }
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
  const layerManager = new LayerManager(gl);
  layerManager.setViewport(new WebMercatorViewport(100, 100));

  const newProps = Object.assign({}, testCases.INITIAL_PROPS);

  // initialize parent layer (generates and initializes)
  const layer = new LayerComponent(newProps);
  t.doesNotThrow(
    () => layerManager.setLayers([layer]),
    `initialization of ${LayerComponent.layerName} should not fail`
  );

  // Create a map of spies that the test case can inspect
  const spies = FunctionsToSpy.reduce(
    (accu, curr) =>
      Object.assign(accu, {
        [curr]: spy(LayerComponent.prototype, curr)
      }),
    {}
  );

  for (const {updateProps, assert} of testCases.UPDATES) {
    // Add on new props every iteration
    Object.assign(newProps, updateProps);

    const newLayer = layer.clone(newProps);
    t.doesNotThrow(
      () => layerManager.setLayers([newLayer]),
      `update ${LayerComponent.layerName} should not fail`
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

  /*
  failures = testInitializeLayer({layer: subLayer});
  t.ok(!failures, `initialize ${LayerComponent.layerName} subLayer should not fail`);
  testCases.UPDATES.reduce((currentProps, {updateProps, assert}) => {
    // merge updated Props with initialProps
    const newProps = Object.assign({}, currentProps, updateProps);
    // call update layer with new props
    testUpdateLayer({layer, newProps});
    testUpdateLayer({layer: subLayer, newProps: newSubLayer.props});
    t.ok(!failures, `update ${LayerComponent.layerName} subLayer should not fail`);
    return newProps;
  }, testCases.INITIAL_PROPS);
  */

  // restore spies
  Object.keys(spies).forEach(k => spies[k].restore());
}

export function testCreateLayer(t, LayerComponent, props = {}) {
  let failures = false;
  let layer = null;

  try {
    layer = new LayerComponent(
      Object.assign(
        {
          id: `${LayerComponent.layerName}-0`
        },
        props
      )
    );

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
    const emptyLayer = new LayerComponent(
      Object.assign(
        {
          id: `empty${LayerComponent.layerName}`,
          data: [],
          pickable: true
        },
        props
      )
    );

    t.ok(emptyLayer instanceof LayerComponent, `Empty ${LayerComponent.layerName} created`);
  } catch (error) {
    failures = true;
  }
  t.ok(!failures, `creating empty ${LayerComponent.layerName} should not fail`);
}

export function testNullLayer(t, LayerComponent) {
  t.doesNotThrow(
    () =>
      new LayerComponent({
        id: 'nullPathLayer',
        data: null,
        pickable: true
      }),
    `Null ${LayerComponent.layerName} did not throw exception`
  );
}
