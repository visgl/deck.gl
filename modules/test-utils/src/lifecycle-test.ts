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
import {device} from './utils/setup-gl';

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

function initializeLayerManager({layer, viewport = testViewport, onError = defaultOnError}) {
  const layerManager = new LayerManager(device, {viewport});
  layerManager.setProps({
    onError: error => onError(error, `initializing ${layer.id}`)
  });

  layerManager.setLayers([layer]);
  return layerManager;
}

export function testInitializeLayer(opts) {
  const layerManager = initializeLayerManager(opts);
  if (opts.finalize === false) {
    return {
      finalize: () => layerManager.finalize()
    };
  }
  layerManager.finalize();
  return null;
}

export async function testInitializeLayerAsync(opts) {
  const layerManager = initializeLayerManager(opts);
  const deckRenderer = new DeckRenderer(device);
  while (!opts.layer.isLoaded) {
    await update({layerManager, deckRenderer});
  }
  if (opts.finalize === false) {
    return {
      finalize: () => layerManager.finalize()
    };
  }
  layerManager.finalize();
  return null;
}

export function testLayer(opts) {
  const {Layer, testCases = [], spies = [], onError = defaultOnError} = opts;

  const resources = setupLayerTests(`testing ${Layer.layerName}`, opts);

  let layer = new Layer();
  // Run successive update tests
  for (const testCase of testCases) {
    // Save old state before update
    const oldState = {...layer.state};

    const {layer: newLayer, spyMap} = runLayerTestUpdate(testCase, resources, layer, spies);

    runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap);

    // Remove spies
    Object.keys(spyMap).forEach(k => spyMap[k].reset());
    layer = newLayer;
  }

  const error = cleanupAfterLayerTests(resources);
  if (error) {
    onError(error, `${Layer.layerName} should delete all resources`);
  }
}

export async function testLayerAsync(opts) {
  const {Layer, testCases = [], spies = [], onError = defaultOnError} = opts;

  const resources = setupLayerTests(`testing ${Layer.layerName}`, opts);

  let layer = new Layer();
  // Run successive update tests
  for (const testCase of testCases) {
    // Save old state before update
    const oldState = {...layer.state};

    const {layer: newLayer, spyMap} = runLayerTestUpdate(testCase, resources, layer, spies);

    runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap);

    while (!newLayer.isLoaded) {
      await update(resources);
      runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap);
    }

    // Remove spies
    Object.keys(spyMap).forEach(k => spyMap[k].reset());
    layer = newLayer;
  }

  const error = cleanupAfterLayerTests(resources);
  if (error) {
    onError(error, `${Layer.layerName} should delete all resources`);
  }
}

function setupLayerTests(
  testTitle,
  {viewport = testViewport, timeline = null, onError = defaultOnError}
) {
  const oldResourceCounts = getResourceCounts();

  const layerManager = new LayerManager(device, {viewport, timeline});
  const deckRenderer = new DeckRenderer(device);

  layerManager.context.animationProps = {
    time: 0
  };

  const props = {
    onError: error => onError(error, testTitle)
  };
  layerManager.setProps(props);
  deckRenderer.setProps(props);

  return {layerManager, deckRenderer, oldResourceCounts};
}

function cleanupAfterLayerTests({layerManager, deckRenderer, oldResourceCounts}) {
  layerManager.setLayers([]);
  layerManager.finalize();
  deckRenderer.finalize();

  const resourceCounts = getResourceCounts();

  for (const resourceName in resourceCounts) {
    if (resourceCounts[resourceName] !== oldResourceCounts[resourceName]) {
      return new Error(
        `${resourceCounts[resourceName] - oldResourceCounts[resourceName]} ${resourceName}s`
      );
    }
  }
  return null;
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

function runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap) {
  // assert on updated layer
  if (testCase.onAfterUpdate) {
    // layer manager should handle match subLayer and tranfer state and props
    // here we assume subLayer matches copy over the new props from a new subLayer
    const subLayers = newLayer.isComposite ? newLayer.getSubLayers() : [];
    const subLayer = subLayers.length && subLayers[0];

    testCase.onAfterUpdate({
      testCase,
      layer: newLayer,
      oldState,
      subLayers,
      subLayer,
      spies: spyMap
    });
  }
}

function runLayerTestUpdate(testCase, {layerManager, deckRenderer}, layer, spies) {
  const {props, updateProps, onBeforeUpdate, viewport = layerManager.context.viewport} = testCase;

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
  spies = testCase.spies || spies;
  const spyMap = injectSpies(layer, spies);
  const drawLayers = () => {
    deckRenderer.renderLayers({
      viewports: [viewport],
      layers: layerManager.getLayers(),
      onViewportActive: layerManager.activateViewport
    });
  };

  layerManager.setLayers([layer]);
  drawLayers();

  // clear update flags set by viewport change, if any
  if (layerManager.needsUpdate()) {
    layerManager.updateLayers();
    drawLayers();
  }

  return {layer, spyMap};
}

/* global setTimeout */
function update({layerManager, deckRenderer}) {
  return new Promise(resolve => {
    const onAnimationFrame = () => {
      if (layerManager.needsUpdate()) {
        layerManager.updateLayers();

        deckRenderer.renderLayers({
          viewports: [layerManager.context.viewport],
          layers: layerManager.getLayers(),
          onViewportActive: layerManager.activateViewport
        });
        resolve();
        return;
      }

      setTimeout(onAnimationFrame, 50);
    };

    onAnimationFrame();
  });
}
