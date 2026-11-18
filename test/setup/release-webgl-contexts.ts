// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// The headless and browser projects run every test file in one page (`isolate: false`). Chromium
// keeps a limited number of WebGL contexts per page and drops the oldest one when a new one goes
// over the limit. Finalizing a `Deck` or removing a map does not release its context, so contexts
// that test files leave behind add up until the shared test device is dropped, after which every
// GPU test fails with "WebGL context is lost".
//
// This setup file runs before each test file. It records every WebGL context the file creates and
// loses them once the file is done. The shared synchronous test device is always kept. luma.gl's
// async test devices recreate themselves when their context is lost.

import {afterAll} from 'vitest';
import {webglDevice} from '@luma.gl/core/test-utils-legacy';

/** A WebGL 1 or WebGL 2 rendering context. */
type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;
/** The WebGL contexts created since the current test file started. */
type ContextRecorder = {created: Set<WebGLContext>};

/** Global key for the recorder, so the `getContext` wrapper is installed once per page. */
const RECORDER_KEY = '__deckTestWebGLContexts';
/** The shared synchronous test device's context, which is never released. */
const sharedContext: WebGLContext | undefined = webglDevice?.gl;
/** The page's recorder, shared by every test file. */
const recorder = installRecorder();

/**
 * Wraps `HTMLCanvasElement.prototype.getContext` to record each WebGL context it returns.
 * Runs once per page: later test files reuse the recorder stored on `globalThis`.
 * @returns The page's recorder.
 */
function installRecorder(): ContextRecorder {
  const global = globalThis as typeof globalThis & {[RECORDER_KEY]?: ContextRecorder};
  const existing = global[RECORDER_KEY];
  if (existing) {
    return existing;
  }

  const installed: ContextRecorder = {created: new Set()};
  global[RECORDER_KEY] = installed;

  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    ...args: Parameters<HTMLCanvasElement['getContext']>
  ) {
    const context = (getContext as (...a: unknown[]) => unknown).apply(this, args);
    if (context instanceof WebGLRenderingContext || context instanceof WebGL2RenderingContext) {
      installed.created.add(context);
    }
    return context;
  } as typeof HTMLCanvasElement.prototype.getContext;

  return installed;
}

afterAll(() => {
  for (const context of recorder.created) {
    if (context !== sharedContext && !context.isContextLost()) {
      context.getExtension('WEBGL_lose_context')?.loseContext();
    }
  }
  recorder.created.clear();
});
