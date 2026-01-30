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
 */
export const emulateInput: BrowserCommand<[event: InputEvent]> = async (ctx, event) => {
  const frame = await ctx.frame();

  switch (event.type) {
    case 'click': {
      const options: any = {};
      if (event.shiftKey) {
        options.modifiers = ['Shift'];
      }
      await frame.mouse.click(event.x, event.y, options);
      break;
    }

    case 'drag': {
      const {startX, startY, endX, endY, steps = 5, shiftKey} = event;

      if (shiftKey) {
        await frame.keyboard.down('Shift');
      }

      await frame.mouse.move(startX, startY);
      await frame.mouse.down();

      // Move in steps
      for (let i = 1; i <= steps; i++) {
        const x = startX + ((endX - startX) * i) / steps;
        const y = startY + ((endY - startY) * i) / steps;
        await frame.mouse.move(x, y);
      }

      await frame.mouse.up();

      if (shiftKey) {
        await frame.keyboard.up('Shift');
      }
      break;
    }

    case 'mousemove': {
      await frame.mouse.move(event.x, event.y);
      break;
    }

    case 'keypress': {
      const {key, shiftKey} = event;

      // Map key names to Playwright key names
      const keyMap: Record<string, string> = {
        ArrowLeft: 'ArrowLeft',
        ArrowRight: 'ArrowRight',
        ArrowUp: 'ArrowUp',
        ArrowDown: 'ArrowDown',
        Minus: 'Minus',
        Equal: 'Equal'
      };

      const playwrightKey = keyMap[key] || key;

      if (shiftKey) {
        await frame.keyboard.down('Shift');
      }

      await frame.keyboard.press(playwrightKey);

      if (shiftKey) {
        await frame.keyboard.up('Shift');
      }
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
