// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Custom Vitest browser commands for snapshot and interaction testing.
 * These commands run on the Node.js server side and have access to:
 * - Filesystem (for reading/writing golden images)
 * - Pixelmatch (for image comparison)
 * - Playwright APIs (via ctx.frame() and ctx.iframe)
 */

import type {BrowserCommand} from 'vitest/node';
import pixelmatch from 'pixelmatch';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Types matching the existing interface from globals.d.ts
interface DiffOptions {
  goldenImage: string;
  region?: {x: number; y: number; width: number; height: number};
  saveOnFail?: boolean;
  saveAs?: string;
  threshold?: number;
  createDiffImage?: boolean;
  tolerance?: number;
  includeAA?: boolean;
  includeEmpty?: boolean;
  platform?: string;
}

interface DiffResult {
  headless: boolean;
  match: number;
  matchPercentage: string;
  success: boolean;
  error: string | null;
}

interface InputEvent {
  type: string;
  [key: string]: any;
}

/**
 * Captures a screenshot and compares it with a golden image.
 * Replaces browserTestDriver_captureAndDiffScreen from @probe.gl/test-utils
 */
export const captureAndDiffScreen: BrowserCommand<[options: DiffOptions]> = async (
  ctx,
  options
): Promise<DiffResult> => {
  const frame = await ctx.frame();

  // Resolve golden image path relative to project root
  const goldenPath = path.resolve(ctx.project.config.root, options.goldenImage);

  // Check if golden image exists
  if (!fs.existsSync(goldenPath)) {
    return {
      headless: true,
      match: 0,
      matchPercentage: '0',
      success: false,
      error: `Golden image not found: ${goldenPath}`
    };
  }

  // Take screenshot
  const screenshotOptions: any = {};
  if (options.region) {
    screenshotOptions.clip = options.region;
  }

  const screenshotBuffer = await frame.screenshot(screenshotOptions);

  // Load and normalize both images using sharp (converts to raw RGBA)
  const goldenSharp = sharp(goldenPath);
  const actualSharp = sharp(screenshotBuffer);

  const goldenMetadata = await goldenSharp.metadata();
  const actualMetadata = await actualSharp.metadata();

  // Check dimensions match
  if (
    goldenMetadata.width !== actualMetadata.width ||
    goldenMetadata.height !== actualMetadata.height
  ) {
    // If saveOnFail, save the actual image for debugging
    if (options.saveOnFail) {
      const failPath = options.saveAs
        ? path.resolve(ctx.project.config.root, options.saveAs)
        : goldenPath.replace('.png', '-fail.png');
      fs.writeFileSync(failPath, screenshotBuffer);
    }

    return {
      headless: true,
      match: 0,
      matchPercentage: '0',
      success: false,
      error: `Image dimensions mismatch: golden=${goldenMetadata.width}x${goldenMetadata.height}, actual=${actualMetadata.width}x${actualMetadata.height}`
    };
  }

  const width = goldenMetadata.width!;
  const height = goldenMetadata.height!;

  // Get raw RGBA pixel data from both images
  const goldenData = await goldenSharp.ensureAlpha().raw().toBuffer();
  const actualData = await actualSharp.ensureAlpha().raw().toBuffer();

  // Create diff buffer
  const diffData = Buffer.alloc(width * height * 4);

  // Compare images using pixelmatch
  // threshold: Matching threshold, ranges from 0 to 1. Smaller = more sensitive
  // Default probe.gl uses tolerance: 0.1 for the color difference threshold
  const pixelmatchThreshold = options.tolerance ?? 0.1;
  const mismatchedPixels = pixelmatch(goldenData, actualData, diffData, width, height, {
    threshold: pixelmatchThreshold,
    includeAA: options.includeAA ?? false
  });

  const totalPixels = width * height;
  const matchedPixels = totalPixels - mismatchedPixels;
  const matchPercentage = ((matchedPixels / totalPixels) * 100).toFixed(2);

  // threshold in options refers to minimum match percentage (e.g., 0.99 = 99%)
  const requiredMatchPercentage = (options.threshold ?? 0.99) * 100;
  const success = parseFloat(matchPercentage) >= requiredMatchPercentage;

  // Save failed images for debugging
  if (!success && options.saveOnFail) {
    const failPath = options.saveAs
      ? path.resolve(ctx.project.config.root, options.saveAs)
      : goldenPath.replace('.png', '-fail.png');
    fs.writeFileSync(failPath, screenshotBuffer);

    if (options.createDiffImage) {
      const diffPath = goldenPath.replace('.png', '-diff.png');
      const diffPng = await sharp(diffData, {raw: {width, height, channels: 4}})
        .png()
        .toBuffer();
      fs.writeFileSync(diffPath, diffPng);
    }
  }

  return {
    headless: true,
    match: matchedPixels,
    matchPercentage,
    success,
    error: success ? null : `Match ${matchPercentage}% below threshold ${requiredMatchPercentage}%`
  };
};

/**
 * Emulates user input events.
 * Replaces browserTestDriver_emulateInput from @probe.gl/test-utils
 *
 * Vitest browser tests run in an iframe. Mouse coordinates must be adjusted
 * to account for the iframe's position within the parent page.
 */
export const emulateInput: BrowserCommand<[event: InputEvent]> = async (ctx, event) => {
  const frame = await ctx.frame();
  const page = frame.page();

  // Get iframe bounding box to adjust coordinates
  // The frame is inside an iframe element on the parent page
  const frameElement = await frame.frameElement();
  const boundingBox = await frameElement.boundingBox();
  const offsetX = boundingBox?.x ?? 0;
  const offsetY = boundingBox?.y ?? 0;

  // Helper to adjust coordinates for iframe offset
  const adjustX = (x: number) => x + offsetX;
  const adjustY = (y: number) => y + offsetY;

  switch (event.type) {
    case 'click': {
      // Use explicit keyboard down/up for modifiers instead of options.modifiers
      // This ensures the modifier is held during the entire click sequence
      if (event.shiftKey) {
        await page.keyboard.down('Shift');
      }
      await page.mouse.click(adjustX(event.x), adjustY(event.y));
      if (event.shiftKey) {
        await page.keyboard.up('Shift');
      }
      break;
    }

    case 'drag': {
      const {startX, startY, endX, endY, steps = 5, shiftKey} = event;

      // Use DOM pointer events for drag - deck.gl's mjolnir.js uses pointer events
      await frame.evaluate(
        ({startX, startY, endX, endY, steps, shiftKey}) => {
          const canvas = document.querySelector('canvas');
          if (!canvas) return;

          const dispatchPointerEvent = (type: string, x: number, y: number) => {
            canvas.dispatchEvent(
              new PointerEvent(type, {
                clientX: x,
                clientY: y,
                bubbles: true,
                cancelable: true,
                pointerId: 1,
                pointerType: 'mouse',
                isPrimary: true,
                button: 0,
                buttons: type === 'pointerup' ? 0 : 1,
                shiftKey
              })
            );
          };

          // Start drag
          dispatchPointerEvent('pointerdown', startX, startY);

          // Move in steps
          for (let i = 1; i <= steps; i++) {
            const x = startX + ((endX - startX) * i) / steps;
            const y = startY + ((endY - startY) * i) / steps;
            dispatchPointerEvent('pointermove', x, y);
          }

          // End drag
          dispatchPointerEvent('pointerup', endX, endY);
        },
        {startX, startY, endX, endY, steps, shiftKey: shiftKey || false}
      );
      break;
    }

    case 'mousemove': {
      // Use DOM pointer events for mousemove - deck.gl's mjolnir.js uses pointer events
      await frame.evaluate(
        ({x, y}) => {
          const canvas = document.querySelector('canvas');
          if (!canvas) return;

          // Get canvas position to calculate offset coordinates
          const rect = canvas.getBoundingClientRect();
          const offsetX = x - rect.left;
          const offsetY = y - rect.top;

          // Create pointer event with all coordinate properties
          const createPointerEvent = (type: string, bubbles = true) => {
            return new PointerEvent(type, {
              clientX: x,
              clientY: y,
              screenX: x,
              screenY: y,
              pageX: x,
              pageY: y,
              offsetX,
              offsetY,
              bubbles,
              cancelable: true,
              pointerId: 1,
              pointerType: 'mouse',
              isPrimary: true,
              button: 0,
              buttons: 0,
              view: window
            } as PointerEventInit);
          };

          // Dispatch pointerenter first to ensure deck.gl recognizes the pointer
          canvas.dispatchEvent(createPointerEvent('pointerenter', false));
          canvas.dispatchEvent(createPointerEvent('pointermove', true));
        },
        {x: event.x, y: event.y}
      );
      break;
    }

    case 'keypress': {
      const {key, shiftKey} = event;

      // Focus the canvas and dispatch keyboard events
      // deck.gl's EventManager requires focus on the container to process keyboard events
      await frame.evaluate(
        ({key, shiftKey}) => {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            // Ensure canvas is focusable and focused
            if (!canvas.hasAttribute('tabindex')) {
              canvas.setAttribute('tabindex', '0');
            }
            canvas.focus();

            // Dispatch both keydown and keyup to simulate a full keypress
            canvas.dispatchEvent(
              new KeyboardEvent('keydown', {key, shiftKey, bubbles: true, cancelable: true})
            );
            canvas.dispatchEvent(
              new KeyboardEvent('keyup', {key, shiftKey, bubbles: true, cancelable: true})
            );
          }
        },
        {key, shiftKey}
      );
      break;
    }

    default:
      throw new Error(`Unknown event type: ${event.type}`);
  }
};

/**
 * Returns whether running in headless mode.
 * Replaces browserTestDriver_isHeadless from @probe.gl/test-utils
 */
export const isHeadless: BrowserCommand<[]> = async ctx => {
  // Check the browser config for headless mode
  return ctx.project.config.browser?.headless ?? true;
};

// Export all commands for registration in vitest config
export const browserCommands = {
  captureAndDiffScreen,
  emulateInput,
  isHeadless
};
