// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, beforeEach} from 'vitest';

type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

/**
 * Releases the WebGL contexts that a test file's real `Deck` and map instances create.
 *
 * Finalizing a `Deck` or removing a map does not release its WebGL context. The headless project
 * runs every test file in one page, where Chromium keeps a limited number of contexts and drops the
 * oldest one first: the shared test device, after which every GPU test fails with
 * "WebGL context is lost". Call this at a file's top level. It records each WebGL context created
 * during a test and loses it after the test, once the test has unmounted its roots. Contexts that
 * existed before the test, such as the shared test device's, are left alone.
 */
export function releaseWebGLContextsAfterEach(): void {
  const created: WebGLContext[] = [];
  let getContext: typeof HTMLCanvasElement.prototype.getContext | null = null;

  beforeEach(() => {
    getContext = HTMLCanvasElement.prototype.getContext;
    const original = getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<HTMLCanvasElement['getContext']>
    ) {
      const context = (original as (...a: unknown[]) => unknown).apply(this, args);
      const isWebGL =
        context instanceof WebGLRenderingContext || context instanceof WebGL2RenderingContext;
      if (isWebGL && !created.includes(context)) {
        created.push(context);
      }
      return context;
    } as typeof HTMLCanvasElement.prototype.getContext;
  });

  afterEach(() => {
    if (getContext) {
      HTMLCanvasElement.prototype.getContext = getContext;
      getContext = null;
    }
    for (const context of created.splice(0)) {
      if (!context.isContextLost()) {
        context.getExtension('WEBGL_lose_context')?.loseContext();
      }
    }
  });
}
