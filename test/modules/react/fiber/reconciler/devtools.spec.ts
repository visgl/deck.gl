// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, describe, expect, it, vi} from 'vitest';

type DevToolsHook = {
  isDisabled: boolean;
  supportsFiber: boolean;
  inject: (internals: Record<string, unknown>) => number;
};

const scope = globalThis as typeof globalThis & {__REACT_DEVTOOLS_GLOBAL_HOOK__?: DevToolsHook};

describe('React DevTools', () => {
  afterEach(() => {
    delete scope.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    vi.resetModules();
  });

  // Skipped until the follow-up to the copy adapts it: the headless project shares one page, so an earlier file has already loaded the renderer.
  it.skip('registers the renderer with the DevTools hook when the reconciler loads', async () => {
    const inject = vi.fn((_internals: Record<string, unknown>) => 1);
    scope.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {isDisabled: false, supportsFiber: true, inject};

    vi.resetModules();
    await import('@deck.gl/react/reconciler/renderer');

    expect(inject).toHaveBeenCalledTimes(1);
    expect(inject.mock.calls[0][0]).toMatchObject({
      rendererPackageName: '@deck.gl/react',
      version: expect.any(String)
    });
  });
});
