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

import {LayerManager, MapView, DeckRenderer} from '@deck.gl/core';

import {makeSpy} from '@probe.gl/test-utils';
import gl from './utils/setup-gl';

const testViewport = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: 0, latitude: 0, zoom: 1}
});

function defaultOnError(error, title) {
  if (error) {
    throw error;
  }
}

export function testInitializeLayer({layer, viewport = testViewport, onError = defaultOnError}) {
  const layerManager = new LayerManager(gl, {viewport});
  layerManager.setProps({
    onError: error => onError(error, `initializing ${layer.id}`)
  });

  layerManager.setLayers([layer]);

  return null;
}

export function testUpdateLayer({
  layer,
  viewport = testViewport,
  newProps,
  onError = defaultOnError
}) {
  const layerManager = new LayerManager(gl, {viewport});

  layerManager.setProps({
    onError: error => onError(error, `updating ${layer.id}`)
  });

  layerManager.setLayers([layer]);
  layerManager.setLayers([layer.clone(newProps)]);

  return null;
}

export function testDrawLayer({
  layer,
  viewport = testViewport,
  uniforms = {},
  onError = defaultOnError
}) {
  const layerManager = new LayerManager(gl, {viewport});
  const deckRenderer = new DeckRenderer(gl);
  const props = {
    onError: error => onError(error, `drawing ${layer.id}`)
  };

  layerManager.setProps(props);
  deckRenderer.setProps(props);

  layerManager.setLayers([layer]);
  deckRenderer.renderLayers({
    viewports: [viewport],
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport
  });

  return null;
}

export function testLayer({
  Layer,
  viewport = testViewport,
  timeline = null,
  testCases = [],
  spies = [],
  onError = defaultOnError
}) {
  // assert(Layer);

  const layerManager = new LayerManager(gl, {viewport, timeline});
  const deckRenderer = new DeckRenderer(gl);

  layerManager.context.animationProps = {
    time: 0
  };

  const initialProps = testCases[0].props;
  const layer = new Layer(initialProps);

  const props = {
    onError: error => onError(error, `testing ${layer.id}`)
  };
  layerManager.setProps(props);
  deckRenderer.setProps(props);

  const oldResourceCounts = getResourceCounts();

  layerManager.setLayers([layer]);

  runLayerTests(layerManager, deckRenderer, layer, testCases, spies, onError);

  layerManager.setLayers([]);

  const resourceCounts = getResourceCounts();

  for (const resourceName in resourceCounts) {
    if (resourceCounts[resourceName] !== oldResourceCounts[resourceName]) {
      onError(
        new Error(
          `${resourceCounts[resourceName] - oldResourceCounts[resourceName]} ${resourceName}s`
        ),
        `${layer.id} should delete all ${resourceName}s`
      );
    }
  }
}

function getResourceCounts() {
  /* global luma */
  const resourceStats = luma.stats.get('Resource Counts');
  return {
    Texture2D: resourceStats.get('Texture2Ds Active').count,
    Buffer: resourceStats.get('Buffers Active').count
  };
}

function injectSpies(layer, spies) {
  const spyMap = {};
  if (spies) {
    for (const functionName of spies) {
      spyMap[functionName] = makeSpy(Object.getPrototypeOf(layer), functionName);
    }
  }
  return spyMap;
}

/* eslint-disable max-params, no-loop-func */
function runLayerTests(layerManager, deckRenderer, layer, testCases, spies, onError) {
  // Run successive update tests
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const {
      props,
      updateProps,
      onBeforeUpdate,
      onAfterUpdate,
      viewport = layerManager.context.viewport
    } = testCase;

    spies = testCase.spies || spies;

    // copy old state before update
    const oldState = Object.assign({}, layer.state);

    if (onBeforeUpdate) {
      onBeforeUpdate({layer, testCase});
    }

    if (props) {
      // Test case can reset the props on every iteration
      layer = new layer.constructor(props);
    } else if (updateProps) {
      // Test case can override with new props on every iteration
      layer = layer.clone(updateProps);
    }

    // Create a map of spies that the test case can inspect
    const spyMap = injectSpies(layer, spies);

    layerManager.setLayers([layer]);

    // call draw layer
    deckRenderer.renderLayers({
      viewports: [viewport],
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport
    });

    // layer manager should handle match subLayer and tranfer state and props
    // here we assume subLayer matches copy over the new props from a new subLayer
    const subLayers = layer.isComposite ? layer.getSubLayers() : [];
    const subLayer = subLayers.length && subLayers[0];

    // assert on updated layer
    if (onAfterUpdate) {
      onAfterUpdate({testCase, layer, oldState, subLayers, subLayer, spies: spyMap});
    }

    // Remove spies
    Object.keys(spyMap).forEach(k => spyMap[k].reset());
  }
}
/* eslint-enable max-params, no-loop-func */
