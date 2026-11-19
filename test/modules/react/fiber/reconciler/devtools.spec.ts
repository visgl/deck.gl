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

  it('registers the renderer with the DevTools hook when the reconciler loads', async () => {
    const inject = vi.fn((_internals: Record<string, unknown>) => 1);
    scope.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {isDisabled: false, supportsFiber: true, inject};

    vi.resetModules();
    await import('../renderer');

    expect(inject).toHaveBeenCalledTimes(1);
    expect(inject.mock.calls[0][0]).toMatchObject({
      rendererPackageName: '@deck.gl-community/react-fiber',
      version: expect.any(String)
    });
  });
});
