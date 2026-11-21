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
  });

  it('registers the renderer with the DevTools hook', async () => {
    const inject = vi.fn((_internals: Record<string, unknown>) => 1);
    scope.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {isDisabled: false, supportsFiber: true, inject};

    // The module registers itself when it first loads. Other test files in this project may have
    // loaded it already, so call the registration directly instead of relying on a fresh import.
    const {registerWithDevTools} = await import('@deck.gl/react/reconciler/renderer');
    inject.mockClear();
    registerWithDevTools();

    expect(inject).toHaveBeenCalledTimes(1);
    expect(inject.mock.calls[0][0]).toMatchObject({
      rendererPackageName: '@deck.gl/react',
      version: expect.any(String)
    });
  });
});
