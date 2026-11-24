// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// The headless project runs every test file in one page. Chromium keeps about 16 WebGL contexts
// live per page and evicts the oldest one, the shared test device, when another is created. A
// finalized Deck removes its canvas but keeps the context until garbage collection, so the
// contexts that a file's Decks, overlays and React components leave behind are released here.

import {afterAll} from 'vitest';
import {getWebGLTestDevice, webglDevice} from '@luma.gl/test-utils';

/** A WebGL context created on an `HTMLCanvasElement` since the last release. */
type TrackedContext = {
  /** The context. */
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  /** The canvas it renders to. */
  canvas: HTMLCanvasElement;
};

/** Global key for the tracked contexts. Isolation is off, so they are kept across files. */
const TRACKED_CONTEXTS_KEY = '__deckTestTrackedWebGLContexts';

/**
 * Records every WebGL context created on an `HTMLCanvasElement`. Patches `getContext` once per page.
 * @returns The list that new contexts are added to.
 */
function trackWebGLContexts(): TrackedContext[] {
  const globals = globalThis as Record<string, unknown>;
  if (!globals[TRACKED_CONTEXTS_KEY]) {
    const tracked: TrackedContext[] = [];
    globals[TRACKED_CONTEXTS_KEY] = tracked;
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: any[]) {
      const context = (getContext as any).apply(this, args);
      const isWebGL =
        context instanceof WebGL2RenderingContext || context instanceof WebGLRenderingContext;
      if (isWebGL && !tracked.some(entry => entry.gl === context)) {
        tracked.push({gl: context, canvas: this});
      }
      return context;
    } as typeof getContext;
  }
  return globals[TRACKED_CONTEXTS_KEY] as TrackedContext[];
}

/**
 * Loses the contexts of canvases that are no longer in the document. The shared test devices from
 * `@luma.gl/test-utils` render to detached canvases too, so they are kept explicitly.
 * @param tracked Contexts created since the last release.
 */
async function releaseDetachedCanvasContexts(tracked: TrackedContext[]): Promise<void> {
  const sharedDevice = await getWebGLTestDevice();
  const keep = new Set([webglDevice?.gl, sharedDevice?.handle]);
  for (let i = tracked.length - 1; i >= 0; i--) {
    const {gl, canvas} = tracked[i];
    if (keep.has(gl) || gl.isContextLost()) {
      tracked.splice(i, 1);
    } else if (!canvas.isConnected) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      tracked.splice(i, 1);
    }
  }
}

/**
 * Releases, after the current test file, the contexts of the canvases it left detached. Call it
 * from a setup file: setup files run again for every test file, but the modules they import don't.
 */
export function releaseWebGLContextsAfterFile(): void {
  const tracked = trackWebGLContexts();
  afterAll(() => releaseDetachedCanvasContexts(tracked));
}
