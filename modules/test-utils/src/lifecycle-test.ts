// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerManager, MapView, DeckRenderer} from '@deck.gl/core';
import {device} from './utils/setup-gl';

import type {Layer, CompositeLayer, Viewport} from '@deck.gl/core';
import type {Timeline} from '@luma.gl/engine';
import type {StatsManager} from '@luma.gl/core';

// Spy abstraction - supports both vitest (preferred) and probe.gl (deprecated)
// This allows @deck.gl/test-utils to work with either framework
type Spy = {
  mockRestore?: () => void; // vitest
  restore?: () => void; // probe.gl
  mock?: {calls: any[][]}; // vitest
  calls?: any[][]; // probe.gl
};

// Lazy-loaded spy framework - only initialized when createSpy is first called
// This avoids hanging on module load when vitest isn't ready
let _vi: any;
let _makeSpy: any;
let _spyFrameworkInitialized = false;

// Environment variable to force probe.gl path (for testing backward compatibility)
function shouldForceProbeGl(): boolean {
  // eslint-disable-next-line no-process-env
  return typeof process !== 'undefined' && process.env?.DECK_TEST_UTILS_USE_PROBE_GL === '1';
}

// Check if we're running inside vitest by looking for vitest-specific globals
// This avoids the error "Vitest failed to access its internal state" when
// importing vitest outside of a vitest test context
function isRunningInVitest(): boolean {
  // Vitest sets __vitest_index__ on globalThis when running
  return typeof (globalThis as any).__vitest_index__ !== 'undefined';
}

async function initSpyFramework(): Promise<void> {
  if (_spyFrameworkInitialized) return;
  _spyFrameworkInitialized = true;

  const forceProbeGl = shouldForceProbeGl();

  // Try vitest first (preferred), but only if running inside vitest context
  if (!forceProbeGl && isRunningInVitest()) {
    try {
      const vitest = await import('vitest');
      _vi = vitest.vi;
      return;
    } catch {
      // vitest not available or failed to load
    }
  }

  // Fall back to probe.gl (deprecated)
  try {
    const probegl = await import('@probe.gl/test-utils');
    _makeSpy = probegl.makeSpy;
    if (!forceProbeGl && !isRunningInVitest()) {
      // Only warn if not explicitly testing probe.gl compatibility
      // and not running in vitest (where vitest should be used)
      console.warn(
        // eslint-disable-line no-console
        '[@deck.gl/test-utils] @probe.gl/test-utils is deprecated for spying. ' +
          'Install vitest ^2.1.0 as a peer dependency. ' +
          'See https://deck.gl/docs/developer-guide/testing'
      );
    }
  } catch {
    // Neither available - error will be thrown when createSpy is called
  }
}

async function createSpy(obj: object, method: string): Promise<Spy> {
  await initSpyFramework();

  if (_vi) {
    return _vi.spyOn(obj, method);
  }
  if (_makeSpy) {
    return _makeSpy(obj, method);
  }
  throw new Error(
    '@deck.gl/test-utils requires either vitest or @probe.gl/test-utils as a peer dependency. ' +
      'Install one of: npm install -D vitest (recommended) or npm install -D @probe.gl/test-utils'
  );
}

function restoreSpy(spy: Spy): void {
  // vitest uses mockRestore(), probe.gl uses restore()
  if (spy.mockRestore) {
    spy.mockRestore();
  } else if (spy.restore) {
    spy.restore();
  }
}

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

export type LayerClass<LayerT extends Layer> = {
  new (...args): LayerT;
  layerName: string;
  defaultProps: any;
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
export async function testLayer<LayerT extends Layer>(opts: {
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

    const {layer: newLayer, spyMap} = await runLayerTestUpdate(testCase, resources, layer, spies);

    runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap);

    // Remove spies - restoreSpy handles both vitest and probe.gl
    Object.keys(spyMap).forEach(k => restoreSpy(spyMap[k]));
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

    const {layer: newLayer, spyMap} = await runLayerTestUpdate(testCase, resources, layer, spies);

    runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap);

    while (!newLayer.isLoaded) {
      await update(resources);
      runLayerTestPostUpdateCheck(testCase, newLayer, oldState, spyMap);
    }

    // Remove spies - restoreSpy handles both vitest and probe.gl
    Object.keys(spyMap).forEach(k => restoreSpy(spyMap[k]));
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

async function injectSpies(layer: Layer, spies: string[]): Promise<Record<string, Spy>> {
  const spyMap: Record<string, Spy> = {};
  if (spies) {
    for (const functionName of spies) {
      spyMap[functionName] = await createSpy(Object.getPrototypeOf(layer), functionName);
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

async function runLayerTestUpdate<LayerT extends Layer>(
  testCase: LayerTestCase<LayerT>,
  {layerManager, deckRenderer}: TestResources,
  layer: LayerT,
  spies: string[]
): Promise<{
  layer: LayerT;
  spyMap: Record<string, Spy>;
}> {
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
  const spyMap = await injectSpies(layer, spies);
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
