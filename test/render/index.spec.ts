// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, beforeAll, afterAll, afterEach} from 'vitest';
import {commands} from '@vitest/browser/context';
import {Deck, MapView} from '@deck.gl/core';
import TEST_CASES from './test-cases';
import {WIDTH, HEIGHT, OS} from './constants';

// TODO: Migrate jupyter-widget.js to vitest (currently disabled due to luma.gl v9 canvas sizing issues)
// import './jupyter-widget';

let deck: Deck | null = null;
let container: HTMLDivElement | null = null;

beforeAll(() => {
  // Hide scrollbars to prevent them from appearing in screenshots
  document.body.style.cssText = 'margin: 0; padding: 0; overflow: hidden;';

  // Create a container div with explicit size
  container = document.createElement('div');
  container.id = 'deck-container';
  container.style.cssText = `position: absolute; left: 0; top: 0; width: ${WIDTH}px; height: ${HEIGHT}px;`;
  document.body.appendChild(container);
});

afterEach(() => {
  // Finalize deck after each test to ensure clean state
  if (deck) {
    deck.finalize();
    deck = null;
  }
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

// Default render completion check - matches the old SnapshotTestRunner behavior
// Called after each render until layers are loaded and no more updates needed
function defaultOnAfterRender({
  deck: d,
  layers,
  done
}: {
  deck: Deck;
  layers: any[];
  done: () => void;
}) {
  // @ts-expect-error Accessing protected layerManager
  const needsUpdate = d.layerManager?.needsUpdate();
  const allLoaded = layers.every((layer: any) => layer.isLoaded);

  if (!needsUpdate && allLoaded) {
    done();
  }
}

// Helper to get canvas bounding box for screenshot region
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

// Filter out skipped tests and use test.skip for them
const activeTests = TEST_CASES.filter((tc: any) => !tc.skip);
const skippedTests = TEST_CASES.filter((tc: any) => tc.skip);

// Register skipped tests so they show up in output
skippedTests.forEach((tc: any) => {
  test.skip(tc.name, () => {});
});

test.each(activeTests)('$name', async testCase => {
  const {
    name,
    views,
    viewState,
    layers,
    effects,
    goldenImage,
    useDevicePixels,
    onBeforeRender,
    onAfterRender,
    imageDiffOptions
  } = testCase;

  // Create a new Deck instance for each test (like the old SnapshotTestRunner)
  // This ensures Deck enters a fresh render loop and properly handles async loading
  await new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout waiting for render to complete'));
    }, 10000);

    const onAfterRenderCheck = onAfterRender || defaultOnAfterRender;

    deck = new Deck({
      id: 'render-test-deck',
      container: container!,
      width: WIDTH,
      height: HEIGHT,
      views: views || new MapView({}),
      viewState,
      layers,
      effects: effects || [],
      useDevicePixels: useDevicePixels ?? false,
      debug: true,

      onLoad: () => {
        // Call onBeforeRender if provided
        if (onBeforeRender) {
          onBeforeRender({
            deck: deck!,
            // @ts-expect-error Accessing protected layerManager
            layers: deck!.layerManager?.getLayers() || []
          });
        }
      },

      onAfterRender: () => {
        // @ts-expect-error Accessing protected layerManager
        const currentLayers = deck!.layerManager?.getLayers() || [];

        // Skip if no layers yet (Deck still initializing)
        if (currentLayers.length === 0) {
          return;
        }

        onAfterRenderCheck({
          deck: deck!,
          layers: currentLayers,
          done: () => {
            clearTimeout(timeoutId);
            resolve();
          }
        });
      }
    });
  });

  // Capture and diff screenshot
  const region = getCanvasRegion();
  const diffOptions = {
    goldenImage,
    region,
    threshold: imageDiffOptions?.threshold ?? 0.99,
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
    if (platformResult.success) {
      finalResult = platformResult;
    }
  }

  expect(
    finalResult.success,
    `${name}: ${finalResult.error || `match: ${finalResult.matchPercentage}%`}`
  ).toBe(true);
});
