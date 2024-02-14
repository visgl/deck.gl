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

import type {Layer, CompositeLayer, Viewport} from '@deck.gl/core';
import type {Timeline} from '@luma.gl/engine';
import type {StatsManager} from '@luma.gl/core';

const testViewport = new MapView({}).makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: 0, latitude: 0, zoom: 1}
}) as Viewport;

function defaultOnError(error: unknown, title: string): void {
  if (error) {
    throw error;
  }
}

type InitializeLayerTestOptions = {
  /** The layer instance to test */
  layer: Layer;
  /** The initial viewport
   * @default WebMercatorViewport
   */
  viewport?: Viewport;
  /** Callback if any error is thrown */
  onError?: (error: unknown, title: string) => void;
};

function initializeLayerManager({
  layer,
  viewport = testViewport,
  onError = defaultOnError
}: InitializeLayerTestOptions): LayerManager {
  const layerManager = new LayerManager(device, {viewport});
  layerManager.setProps({
    onError: error => onError(error, `initializing ${layer.id}`)
  });

  layerManager.setLayers([layer]);
  return layerManager;
}

/** Test that initializing a layer does not throw.
 * Use `testInitializeLayerAsync` if the layer's initialization flow contains async operations.
 */
export function testInitializeLayer(
  opts: InitializeLayerTestOptions & {
    /** Automatically finalize the layer and release all resources after the test */
    finalize?: true;
  }
): null;
export function testInitializeLayer(
  opts: InitializeLayerTestOptions & {
    /** Automatically finalize the layer and release all resources after the test */
    finalize: false;
  }
): {
  /** Finalize the layer and release all resources */
  finalize: () => void;
};

export function testInitializeLayer(
  opts: InitializeLayerTestOptions & {
    /** Automatically finalize the layer and release all resources after the test */
    finalize?: boolean;
  }
): {
  /** Finalize the layer and release all resources */
  finalize: () => void;
} | null {
  const layerManager = initializeLayerManager(opts);
  if (opts.finalize === false) {
    return {
      finalize: () => layerManager.finalize()
    };
  }
  layerManager.finalize();
  return null;
}

/** Test that initializing a layer does not throw.
 * Resolves when the layer's isLoaded flag becomes true.
 */
export function testInitializeLayerAsync(
  opts: InitializeLayerTestOptions & {
    /** Automatically finalize the layer and release all resources after the test */
    finalize?: true;
  }
): Promise<null>;
export function testInitializeLayerAsync(
  opts: InitializeLayerTestOptions & {
    /** Automatically finalize the layer and release all resources after the test */
    finalize: false;
  }
): Promise<{
  /** Finalize the layer and release all resources */
  finalize: () => void;
}>;

export async function testInitializeLayerAsync(
  opts: InitializeLayerTestOptions & {
    /** Automatically finalize the layer and release all resources after the test */
    finalize?: boolean;
  }
): Promise<{
  /** Finalize the layer and release all resources */
  finalize: () => void;
} | null> {
  const layerManager = initializeLayerManager(opts);
  const deckRenderer = new DeckRenderer(device);
  while (!opts.layer.isLoaded) {
    await update({layerManager, deckRenderer, oldResourceCounts: {}});
  }
  if (opts.finalize === false) {
    return {
      finalize: () => layerManager.finalize()
    };
  }
  layerManager.finalize();
  return null;
}

// TODO - export from probe.gl
type Spy = ReturnType<typeof makeSpy>;

export type LayerClass<LayerT extends Layer> = {
  new (...args): LayerT;
  layerName: string;
  defaultProps: Partial<LayerT['props']>;
};

export type LayerTestCase<LayerT extends Layer> = {
  title: string;
  viewport?: Viewport;
  /** Reset the props of the test layer instance */
  props?: Partial<LayerT['props']>;
  /** Update the given props of the test layer instance */
  updateProps?: Partial<LayerT['props']>;
  /** List of layer method names to watch */
  spies?: string[];

  /** Called before layer updates */
  onBeforeUpdate?: (params: {layer: Layer; testCase: LayerTestCase<LayerT>}) => void;

  /** Called after layer is updated */
  onAfterUpdate?: (params: {
    testCase: LayerTestCase<LayerT>;
    layer: LayerT;
    oldState: any;
    subLayers: Layer[];
    subLayer: Layer | null;
    spies: Record<string, Spy>;
  }) => void;
};

type TestResources = {
  layerManager: LayerManager;
  deckRenderer: DeckRenderer;
  oldResourceCounts: Record<string, number>;
};

/**
 * Initialize and updates a layer over a sequence of scenarios (test cases).
 * Use `testLayerAsync` if the layer's update flow contains async operations.
 */
export function testLayer<LayerT extends Layer>(opts: {
  /** The layer class to test against */
  Layer: LayerClass<LayerT>;
  /** The initial viewport
   * @default WebMercatorViewport
   */
  viewport?: Viewport;
  /**
   * If provided, used to controls time progression. Useful for testing transitions and animations.
   */
  timeline?: Timeline;
  testCases?: LayerTestCase<LayerT>[];
  /**
   * List of layer method names to watch
   */
  spies?: string[];
  /** Callback if any error is thrown */
  onError?: (error: Error, title: string) => void;
}): void {
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

/**
 * Initialize and updates a layer over a sequence of scenarios (test cases).
 * Each test case is awaited until the layer's isLoaded flag is true.
 */
export async function testLayerAsync<LayerT extends Layer>(opts: {
  /** The layer class to test against */
  Layer: LayerClass<LayerT>;
  /** The initial viewport
   * @default WebMercatorViewport
   */
  viewport?: Viewport;
  /**
   * If provided, used to controls time progression. Useful for testing transitions and animations.
   */
  timeline?: Timeline;
  testCases?: LayerTestCase<LayerT>[];
  /**
   * List of layer method names to watch
   */
  spies?: string[];
  /** Callback if any error is thrown */
  onError?: (error: Error, title: string) => void;
}): Promise<void> {
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
  testTitle: string,
  {
    viewport = testViewport,
    timeline,
    onError = defaultOnError
  }: {
    viewport?: Viewport;
    timeline?: Timeline;
    onError?: (error: Error, title: string) => void;
  }
): TestResources {
  const oldResourceCounts = getResourceCounts();

  const layerManager = new LayerManager(device, {viewport, timeline});
  const deckRenderer = new DeckRenderer(device);

  const props = {
    layerFilter: null,
    drawPickingColors: false,
    onError: error => onError(error, testTitle)
  };
  layerManager.setProps(props);
  deckRenderer.setProps(props);

  return {layerManager, deckRenderer, oldResourceCounts};
}

function cleanupAfterLayerTests({
  layerManager,
  deckRenderer,
  oldResourceCounts
}: TestResources): Error | null {
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

function getResourceCounts(): Record<string, number> {
  /* global luma */
  const resourceStats = (luma.stats as StatsManager).get('Resource Counts');
  return {
    Texture2D: resourceStats.get('Texture2Ds Active').count,
    Buffer: resourceStats.get('Buffers Active').count
  };
}

function injectSpies(layer: Layer, spies: string[]): Record<string, Spy> {
  const spyMap: Record<string, Spy> = {};
  if (spies) {
    for (const functionName of spies) {
      spyMap[functionName] = makeSpy(Object.getPrototypeOf(layer), functionName);
    }
  }
  return spyMap;
}

function runLayerTestPostUpdateCheck<LayerT extends Layer>(
  testCase: LayerTestCase<LayerT>,
  newLayer: LayerT,
  oldState: any,
  spyMap: Record<string, Spy>
) {
  // assert on updated layer
  if (testCase.onAfterUpdate) {
    // layer manager should handle match subLayer and tranfer state and props
    // here we assume subLayer matches copy over the new props from a new subLayer
    const subLayers = newLayer.isComposite
      ? (newLayer as Layer as CompositeLayer).getSubLayers()
      : [];
    const subLayer = subLayers.length ? subLayers[0] : null;

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

function runLayerTestUpdate<LayerT extends Layer>(
  testCase: LayerTestCase<LayerT>,
  {layerManager, deckRenderer}: TestResources,
  layer: LayerT,
  spies: string[]
): {
  layer: LayerT;
  spyMap: Record<string, Spy>;
} {
  const {props, updateProps, onBeforeUpdate, viewport = layerManager.context.viewport} = testCase;

  if (onBeforeUpdate) {
    onBeforeUpdate({layer, testCase});
  }

  if (props) {
    // Test case can reset the props on every iteration
    layer = new (layer.constructor as LayerClass<LayerT>)(props);
  } else if (updateProps) {
    // Test case can override with new props on every iteration
    layer = layer.clone(updateProps);
  }

  // Create a map of spies that the test case can inspect
  spies = testCase.spies || spies;
  const spyMap = injectSpies(layer, spies);
  const drawLayers = () => {
    deckRenderer.renderLayers({
      pass: 'test',
      views: {},
      effects: [],
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
function update({layerManager, deckRenderer}: TestResources): Promise<void> {
  return new Promise(resolve => {
    const onAnimationFrame = () => {
      if (layerManager.needsUpdate()) {
        layerManager.updateLayers();

        deckRenderer.renderLayers({
          pass: 'test',
          views: {},
          effects: [],
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
