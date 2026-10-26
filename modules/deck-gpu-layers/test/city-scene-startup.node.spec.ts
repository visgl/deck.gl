// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';

const startup = vi.hoisted(() => ({resolveDevice: null as any, createScene: vi.fn()}));
vi.mock('../../../examples/v10-experimental/deck-example-device', () => ({
  resolveDeckExampleDeviceType: () => new Promise(resolve => (startup.resolveDevice = resolve))
}));
vi.mock('../../../examples/v10-experimental/city-scene/app', () => ({
  createCityScene: startup.createScene
}));

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
    diagnostics: {backend: 'webgl', playing: false},
    ...Object.fromEntries(
      [
        'setBuildingsVisible',
        'setEdgeStyle',
        'setEdgeWidth',
        'setWaterEnabled',
        'setReflectionsEnabled',
        'setReflectionQuality',
        'setReflectionDebugMode',
        'setWaterStyle',
        'setWaterColor',
        'setWaveStrength',
        'setPlaying'
      ].map(name => [name, vi.fn()])
    ),
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
    const loading = import('../../../examples/v10-experimental/city-scene/main');
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
    (controls.get('#camera') as any).value = 'waterfront';
    (controls.get('#buildings') as any).checked = false;
    (controls.get('#water') as any).checked = false;
    (controls.get('#water-color') as any).value = '#123456';
    (controls.get('#strength') as any).value = '0.8';
    (controls.get('#edge-style') as any).value = 'pencil';
    (controls.get('#edge-width') as any).value = '3';
    (controls.get('#water-style') as any).value = 'classic';
    (controls.get('#water-preset') as any).value = 'custom';
    (controls.get('#reflection-quality') as any).value = 'detailed';
    (controls.get('#reflection-view') as any).value = '2';
    window.dispatchEvent(new Event('pagehide'));
    expect(finalize).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event('pageshow'));
    await Promise.resolve();
    expect(startup.createScene).toHaveBeenCalledTimes(2);
    const restoredScene = startup.createScene.mock.results[1].value;
    expect(restoredScene.setCamera).toHaveBeenLastCalledWith('waterfront');
    expect(restoredScene.setBuildingsVisible).toHaveBeenCalledWith(false);
    expect(restoredScene.setWaterEnabled).toHaveBeenCalledWith(false);
    expect(restoredScene.setWaveStrength).toHaveBeenCalledWith(0.8);
    expect(restoredScene.setEdgeStyle).toHaveBeenCalledWith('pencil');
    expect(restoredScene.setEdgeWidth).toHaveBeenCalledWith(3);
    expect(restoredScene.setPlaying).toHaveBeenCalledWith(false);
    expect(restoredScene.setWaterStyle).toHaveBeenCalledWith('classic');
    expect(restoredScene.setWaterColor).toHaveBeenCalledWith([0x12 / 255, 0x34 / 255, 0x56 / 255]);
    expect(restoredScene.setReflectionQuality).toHaveBeenCalledWith('detailed');
    expect(restoredScene.setReflectionDebugMode).toHaveBeenCalledWith(2);
    expect(restoredScene.setReflectionsEnabled).toHaveBeenCalledWith(false);
    expect((controls.get('#water-preset') as any).value).toBe('custom');
    expect((controls.get('#camera') as any).value).toBe('waterfront');
    expect((controls.get('#playback') as any).textContent).toBe('Play waves');
    controls.get('#backend')!.dispatchEvent(new Event('change'));
    await Promise.resolve();
    expect(startup.createScene).toHaveBeenCalledTimes(3);
    expect((controls.get('#camera') as any).value).toBe('district');
    expect((controls.get('#buildings') as any).checked).toBe(true);
    expect((controls.get('#water') as any).checked).toBe(true);
  } finally {
    vi.unstubAllGlobals();
  }
});
