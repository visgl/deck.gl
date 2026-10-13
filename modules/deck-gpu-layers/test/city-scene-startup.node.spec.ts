// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';

const startup = vi.hoisted(() => ({resolveDevice: null as any, createScene: vi.fn()}));
vi.mock('../../../examples/deck/deck-example-device', () => ({
  resolveDeckExampleDeviceType: () => new Promise(resolve => (startup.resolveDevice = resolve))
}));
vi.mock('../../../examples/deck/city-scene/app', () => ({createCityScene: startup.createScene}));

test('city startup handles pending navigation and back-forward cache restoration', async () => {
  vi.resetModules();
  startup.resolveDevice = null;
  startup.createScene.mockReset();
  const finalize = vi.fn();
  const setCamera = vi.fn();
  startup.createScene.mockImplementation(() => ({
    finalize,
    setCamera,
    ready: Promise.resolve(),
    diagnostics: {backend: 'webgl'},
    features: []
  }));
  const controls = new Map<string, EventTarget>();
  const window = new EventTarget();
  vi.stubGlobal('window', window);
  vi.stubGlobal('location', {search: ''});
  vi.stubGlobal('document', {
    body: {dataset: {}},
    querySelector: (selector: string) => {
      if (!controls.has(selector)) controls.set(selector, new EventTarget());
      return controls.get(selector);
    }
  });
  try {
    const loading = import('../../../examples/deck/city-scene/main');
    await vi.waitFor(() => expect(startup.resolveDevice).toBeTypeOf('function'));
    controls.get('#camera')!.dispatchEvent(new Event('change'));
    controls.get('#playback')!.dispatchEvent(new Event('click'));
    expect(startup.createScene).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('pagehide'));
    startup.resolveDevice('webgl');
    await loading;
    expect(startup.createScene).not.toHaveBeenCalled();
    controls.get('#backend')!.dispatchEvent(new Event('change'));
    expect(startup.createScene).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('pageshow'));
    await Promise.resolve();
    expect(startup.createScene).toHaveBeenCalledTimes(1);
    controls.get('#camera')!.dispatchEvent(new Event('change'));
    expect(setCamera).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event('pagehide'));
    expect(finalize).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event('pageshow'));
    await Promise.resolve();
    expect(startup.createScene).toHaveBeenCalledTimes(2);
    controls.get('#backend')!.dispatchEvent(new Event('change'));
    expect(startup.createScene).toHaveBeenCalledTimes(3);
  } finally {
    vi.unstubAllGlobals();
  }
});
