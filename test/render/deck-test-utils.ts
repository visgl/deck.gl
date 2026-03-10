// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect} from 'vitest';
import {commands} from 'vitest/browser';
import {Deck, MapView} from '@deck.gl/core';
import {WIDTH, HEIGHT, OS} from './constants';

export interface TestCase {
  name: string;
  skip?: boolean;
  views?: any;
  viewState: any;
  layers: any[];
  effects?: any[];
  useDevicePixels?: boolean | number;
  onBeforeRender?: (params: {deck: Deck; layers: any[]}) => void;
  onAfterRender?: (params: {deck: Deck; layers: any[]; done: () => void}) => void;
  goldenImage: string;
  imageDiffOptions?: {
    threshold?: number;
    tolerance?: number;
  };
}

export interface DeckTestContext {
  deck: Deck | null;
  container: HTMLDivElement | null;
}

/**
 * Creates the container element for Deck tests.
 * Call this in beforeAll.
 */
export function createContainer(): HTMLDivElement {
  // Hide scrollbars to prevent them from appearing in screenshots
  document.body.style.cssText = 'margin: 0; padding: 0; overflow: hidden;';

  const container = document.createElement('div');
  container.id = 'deck-container';
  container.style.cssText = `position: absolute; left: 0; top: 0; width: ${WIDTH}px; height: ${HEIGHT}px;`;
  document.body.appendChild(container);
  return container;
}

/**
 * Removes the container element.
 * Call this in afterAll.
 */
export function removeContainer(container: HTMLDivElement | null): void {
  if (container) {
    container.remove();
  }
}

/**
 * Finalizes the deck instance.
 * Call this in afterEach.
 */
export function finalizeDeck(ctx: DeckTestContext): void {
  if (ctx.deck) {
    ctx.deck.finalize();
    ctx.deck = null;
  }
}

/**
 * Default render completion check - matches the old SnapshotTestRunner behavior.
 * Called after each render until layers are loaded and no more updates needed.
 */
export function defaultOnAfterRender({
  deck,
  layers,
  done
}: {
  deck: Deck;
  layers: any[];
  done: () => void;
}): void {
  // @ts-expect-error Accessing protected layerManager
  const needsUpdate = deck.layerManager?.needsUpdate();
  const allLoaded = layers.every((layer: any) => layer.isLoaded);

  if (!needsUpdate && allLoaded) {
    done();
  }
}

/**
 * Creates a Deck instance for reuse across multiple tests.
 * Use with updateDeckForTest() for tests that need the animation loop to keep running.
 */
export function createDeck(container: HTMLDivElement): Deck {
  return new Deck({
    id: 'render-test-deck',
    container,
    width: WIDTH,
    height: HEIGHT,
    useDevicePixels: false,
    debug: true
  });
}

/**
 * Helper to get canvas bounding box for screenshot region
 */
function getCanvasRegion(deck: Deck | null) {
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

/**
 * Runs a single render test case.
 * Creates a Deck instance, waits for render completion, captures and diffs screenshot.
 */
export async function runRenderTest(
  testCase: TestCase,
  ctx: DeckTestContext,
  timeout = 60000
): Promise<void> {
  const {views, viewState, layers, effects, useDevicePixels, onBeforeRender, onAfterRender} =
    testCase;

  // Create a new Deck instance for each test (like the old SnapshotTestRunner)
  // This ensures Deck enters a fresh render loop and properly handles async loading
  await new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout waiting for render to complete'));
    }, timeout);

    const onAfterRenderCheck = onAfterRender || defaultOnAfterRender;

    ctx.deck = new Deck({
      id: 'render-test-deck',
      container: ctx.container!,
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
            deck: ctx.deck!,
            // @ts-expect-error Accessing protected layerManager
            layers: ctx.deck!.layerManager?.getLayers() || []
          });
        }
      },

      onAfterRender: () => {
        // @ts-expect-error Accessing protected layerManager
        const currentLayers = ctx.deck!.layerManager?.getLayers() || [];

        // Skip if no layers yet (Deck still initializing)
        if (currentLayers.length === 0) {
          return;
        }

        onAfterRenderCheck({
          deck: ctx.deck!,
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
  await captureAndDiffScreenshot(testCase, ctx);
}

/**
 * Captures and diffs a screenshot against a golden image.
 * Used by both runRenderTest and updateDeckForTest.
 */
async function captureAndDiffScreenshot(testCase: TestCase, ctx: DeckTestContext): Promise<void> {
  const {name, goldenImage, imageDiffOptions} = testCase;

  const region = getCanvasRegion(ctx.deck);
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
}

/**
 * Updates an existing Deck instance for a test case using setProps().
 * Use this instead of runRenderTest when tests need the animation loop to keep running
 * between onAfterRender callbacks (e.g., for timeline/transition tests).
 *
 * The Deck instance must be created beforehand with createDeck().
 */
export async function updateDeckForTest(
  testCase: TestCase,
  ctx: DeckTestContext,
  timeout = 60000
): Promise<void> {
  const {views, viewState, layers, effects, useDevicePixels, onBeforeRender, onAfterRender} =
    testCase;

  if (!ctx.deck) {
    throw new Error('Deck instance not found. Call createDeck() in beforeAll first.');
  }

  // Use setProps on existing deck - keeps the animation loop running
  await new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout waiting for render to complete'));
    }, timeout);

    const onAfterRenderCheck = onAfterRender || defaultOnAfterRender;

    ctx.deck!.setProps({
      views: views || new MapView({}),
      viewState,
      layers,
      effects: effects || [],
      useDevicePixels: useDevicePixels ?? false,

      // onBeforeRender is called before each render frame - used for timeline setup
      // Always provide a function to clear any previous callback
      onBeforeRender: () => {
        if (onBeforeRender) {
          onBeforeRender({
            deck: ctx.deck!,
            // @ts-expect-error Accessing protected layerManager
            layers: ctx.deck!.layerManager?.getLayers() || []
          });
        }
      },

      onAfterRender: () => {
        // @ts-expect-error Accessing protected layerManager
        const currentLayers = ctx.deck!.layerManager?.getLayers() || [];

        // Skip if no layers yet (Deck still initializing)
        if (currentLayers.length === 0) {
          return;
        }

        onAfterRenderCheck({
          deck: ctx.deck!,
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
  await captureAndDiffScreenshot(testCase, ctx);
}
