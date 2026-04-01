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

interface BrowserDiagnostic {
  level: string;
  text: string;
}

interface InputEvent {
  type: string;
  [key: string]: any;
}

interface DiagnosticState {
  attached: boolean;
  entries: BrowserDiagnostic[];
}

const diagnosticStateByPage = new WeakMap<any, DiagnosticState>();
const MAX_DIAGNOSTIC_ENTRIES = 200;

function pushDiagnostic(state: DiagnosticState, entry: BrowserDiagnostic) {
  state.entries.push(entry);
  if (state.entries.length > MAX_DIAGNOSTIC_ENTRIES) {
    state.entries.splice(0, state.entries.length - MAX_DIAGNOSTIC_ENTRIES);
  }
}

function ensureDiagnosticCapture(page: any): DiagnosticState {
  let state = diagnosticStateByPage.get(page);
  if (!state) {
    state = {attached: false, entries: []};
    diagnosticStateByPage.set(page, state);
  }

  if (!state.attached) {
    page.on('console', (message: any) => {
      const level = message.type();
      if (level === 'error' || level === 'warning' || level === 'assert') {
        pushDiagnostic(state!, {
          level,
          text: message.text()
        });
      }
    });

    page.on('pageerror', (error: Error) => {
      pushDiagnostic(state!, {
        level: 'pageerror',
        text: error.stack || error.message
      });
    });

    state.attached = true;
  }

  return state;
}

function getPlaywrightKey(key: string): string {
  switch (key) {
    case 'Equal':
      return '=';
    case 'Minus':
      return '-';
    default:
      return key;
  }
}

async function focusActiveCanvas(frame: any) {
  await frame.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    const canvas = canvases.reverse().find(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    if (canvas) {
      if (!canvas.hasAttribute('tabindex')) {
        canvas.setAttribute('tabindex', '0');
      }
      canvas.focus();
    }
  });
}

async function dispatchCanvasMouseMove(frame: any, x: number, y: number) {
  await frame.evaluate(
    ({x, y}) => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      const canvas = canvases.reverse().find(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (!canvas) {
        return;
      }

      const eventInit = {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
        buttons: 0
      };

      canvas.dispatchEvent(
        new PointerEvent('pointermove', {
          ...eventInit,
          pointerId: 1,
          pointerType: 'mouse',
          isPrimary: true
        })
      );
      canvas.dispatchEvent(new MouseEvent('mousemove', eventInit));
    },
    {x, y}
  );
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
  const page = frame.page();
  ensureDiagnosticCapture(page);

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

  // Get iframe bounding box to adjust screenshot region
  const frameElement = await frame.frameElement();
  const boundingBox = await frameElement.boundingBox();
  const offsetX = boundingBox?.x ?? 0;
  const offsetY = boundingBox?.y ?? 0;

  // Take screenshot with clip region adjusted for iframe offset
  // omitBackground: true preserves transparency (matches probe.gl behavior)
  const screenshotOptions: any = {
    type: 'png',
    omitBackground: true
  };
  if (options.region) {
    screenshotOptions.clip = {
      x: options.region.x + offsetX,
      y: options.region.y + offsetY,
      width: options.region.width,
      height: options.region.height
    };
  }

  const screenshotBuffer = await page.screenshot(screenshotOptions);

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
      // Use Playwright's built-in modifiers option for reliable modifier key handling
      const modifiers: ('Alt' | 'Control' | 'Meta' | 'Shift')[] = [];
      if (event.shiftKey) {
        modifiers.push('Shift');
      }
      if (event.ctrlKey) {
        modifiers.push('Control');
      }
      if (event.altKey) {
        modifiers.push('Alt');
      }
      if (event.metaKey) {
        modifiers.push('Meta');
      }
      await page.mouse.click(adjustX(event.x), adjustY(event.y), {modifiers});
      break;
    }

    case 'dblclick': {
      // Double-click for zoom in/out operations
      // Playwright's dblclick with modifiers doesn't properly pass shiftKey to the srcEvent
      // Use keyboard.down/up around dblclick to ensure modifier state
      if (event.shiftKey) {
        await page.keyboard.down('Shift');
      }
      if (event.ctrlKey) {
        await page.keyboard.down('Control');
      }
      if (event.altKey) {
        await page.keyboard.down('Alt');
      }
      if (event.metaKey) {
        await page.keyboard.down('Meta');
      }

      await page.mouse.dblclick(adjustX(event.x), adjustY(event.y));

      if (event.metaKey) {
        await page.keyboard.up('Meta');
      }
      if (event.altKey) {
        await page.keyboard.up('Alt');
      }
      if (event.ctrlKey) {
        await page.keyboard.up('Control');
      }
      if (event.shiftKey) {
        await page.keyboard.up('Shift');
      }
      break;
    }

    case 'drag': {
      const {startX, startY, endX, endY, steps = 5, shiftKey} = event;
      await frame.evaluate(
        ({startX, startY, endX, endY, steps, shiftKey}) => {
          const canvas = Array.from(document.querySelectorAll('canvas'))
            .reverse()
            .find(element => {
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0;
            });
          if (!canvas) {
            return;
          }

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

          dispatchPointerEvent('pointerdown', startX, startY);
          for (let i = 1; i <= steps; i++) {
            const x = startX + ((endX - startX) * i) / steps;
            const y = startY + ((endY - startY) * i) / steps;
            dispatchPointerEvent('pointermove', x, y);
          }
          dispatchPointerEvent('pointerup', endX, endY);
        },
        {startX, startY, endX, endY, steps, shiftKey: shiftKey || false}
      );
      break;
    }

    case 'mousemove': {
      await dispatchCanvasMouseMove(frame, event.x, event.y);
      break;
    }

    case 'keypress': {
      const {key, shiftKey} = event;
      await focusActiveCanvas(frame);

      if (shiftKey) {
        await page.keyboard.down('Shift');
      }
      await page.keyboard.press(getPlaywrightKey(key));
      if (shiftKey) {
        await page.keyboard.up('Shift');
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

/**
 * Clears any buffered browser diagnostics for the current page.
 * Used at the start of each render test so failures include only relevant logs.
 */
export const resetBrowserDiagnostics: BrowserCommand<[]> = async ctx => {
  const frame = await ctx.frame();
  const page = frame.page();
  const state = ensureDiagnosticCapture(page);
  state.entries = [];
};

/**
 * Returns buffered browser diagnostics and clears them.
 * Used to append shader/page errors to failing render assertions.
 */
export const consumeBrowserDiagnostics: BrowserCommand<[]> = async ctx => {
  const frame = await ctx.frame();
  const page = frame.page();
  const state = ensureDiagnosticCapture(page);
  const entries = [...state.entries];
  state.entries = [];
  return entries;
};

// Export all commands for registration in vitest config
export const browserCommands = {
  captureAndDiffScreen,
  emulateInput,
  isHeadless,
  resetBrowserDiagnostics,
  consumeBrowserDiagnostics
};
