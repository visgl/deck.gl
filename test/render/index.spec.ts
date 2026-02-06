// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, beforeAll, afterAll} from 'vitest';
import {commands} from '@vitest/browser/context';
import {Deck, MapView} from '@deck.gl/core';
import TEST_CASES from './test-cases';
import {WIDTH, HEIGHT, OS} from './constants';

// TODO: Migrate jupyter-widget.js to vitest (currently disabled due to luma.gl v9 canvas sizing issues)
// import './jupyter-widget';

let deck: Deck | null = null;
let container: HTMLDivElement | null = null;

beforeAll(async () => {
  // Create a container div with explicit size
  // This is needed because vitest browser mode may not size elements properly
  container = document.createElement('div');
  container.id = 'deck-container';
  container.style.cssText = `position: absolute; left: 0; top: 0; width: ${WIDTH}px; height: ${HEIGHT}px;`;
  document.body.appendChild(container);

  deck = new Deck({
    id: 'render-test-deck',
    container,
    width: WIDTH,
    height: HEIGHT,
    views: [new MapView({})],
    useDevicePixels: false,
    debug: true
  });

  // Wait for deck to initialize
  await new Promise<void>(resolve => {
    deck!.setProps({onLoad: resolve});
  });
});

afterAll(() => {
  if (deck) {
    deck.finalize();
    deck = null;
  }
  if (container) {
    container.remove();
    container = null;
  }
});

// Helper to wait for all layers to load
async function waitForLayersToLoad(timeout = 10000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    // @ts-expect-error Accessing protected layerManager
    const needsUpdate = deck?.layerManager?.needsUpdate();
    // @ts-expect-error Accessing protected layerManager
    const layers = deck?.layerManager?.getLayers() || [];
    const allLoaded = layers.every((layer: any) => layer.isLoaded);

    if (!needsUpdate && allLoaded) {
      // Wait one more frame to ensure rendering is complete
      await new Promise(resolve => requestAnimationFrame(resolve));
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  throw new Error('Timeout waiting for layers to load');
}

// Helper to get canvas bounding box for screenshot region
// Matches getBoundingBoxInPage from @deck.gl/test-utils
function getCanvasRegion() {
  const canvas = deck?.getCanvas();
  if (!canvas) {
    return {x: 0, y: 0, width: WIDTH, height: HEIGHT};
  }
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(window.scrollX + rect.left),
    y: Math.round(window.scrollY + rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}

test.each(TEST_CASES)('$name', async testCase => {
  const {name, viewState, layers, goldenImage, onBeforeRender, onAfterRender} = testCase;

  // Set up the test case
  deck!.setProps({
    viewState,
    layers
  });

  // Call onBeforeRender if provided
  if (onBeforeRender) {
    onBeforeRender({
      deck: deck!,
      // @ts-expect-error Accessing protected layerManager
      layers: deck!.layerManager.getLayers()
    });
  }

  // Wait for layers to load
  if (onAfterRender) {
    // Test case has custom completion logic
    await new Promise<void>(resolve => {
      onAfterRender({
        deck: deck!,
        // @ts-expect-error Accessing protected layerManager
        layers: deck!.layerManager.getLayers(),
        done: resolve
      });
    });
  } else {
    // Default: wait for all layers to load
    await waitForLayersToLoad();
  }

  // Capture and diff screenshot
  const region = getCanvasRegion();
  const diffOptions = {
    goldenImage,
    region,
    threshold: 0.99,
    tolerance: 0.1,
    includeEmpty: false,
    platform: OS,
    saveOnFail: true,
    createDiffImage: true
  };

  const result = await commands.captureAndDiffScreen(diffOptions);

  // If failed, try platform-specific golden image
  let finalResult = result;
  if (!result.success) {
    const platformGoldenImage = goldenImage.replace(
      'golden-images/',
      `golden-images/platform-overrides/${OS.toLowerCase()}/`
    );
    const platformResult = await commands.captureAndDiffScreen({
      ...diffOptions,
      goldenImage: platformGoldenImage
    });
    // Only use platform result if it succeeded, otherwise report original failure
    if (platformResult.success) {
      finalResult = platformResult;
    }
  }

  expect(
    finalResult.success,
    `${name}: ${finalResult.error || `match: ${finalResult.matchPercentage}%`}`
  ).toBe(true);
});
