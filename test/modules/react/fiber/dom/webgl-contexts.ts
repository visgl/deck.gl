// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, beforeEach} from 'vitest';

type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

/**
 * Releases the WebGL contexts that each test's real `Deck` and map instances create.
 *
 * `test/setup/release-webgl-contexts.ts` already releases a file's contexts when the file ends.
 * These specs mount several roots per file, each with its own canvas and often a map, so they
 * release after every test instead to keep the page well under Chromium's context limit. Call this
 * at a file's top level. It records each WebGL context created during a test and loses it after
 * the test, once the test has unmounted its roots.
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
