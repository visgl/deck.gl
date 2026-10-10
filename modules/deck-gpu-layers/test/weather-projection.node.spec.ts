// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {MapView, _GlobeView} from '@deck.gl/core';
import {createWeatherScene} from '../../../examples/deck/weather/app';
import {createRiverfrontSoftShadowScene} from '../../../examples/deck/soft-shadows/app';
import {createGlobeCloudScene} from '../../../examples/deck/globe-clouds/app';
import {SKY_FIELD_OF_VIEW} from '../../../examples/deck/soft-shadows/sky-camera';

vi.mock('@deck.gl/core', async importOriginal => ({
  ...(await importOriginal<object>()),
  Deck: class {
    props: any;
    constructor(props: any) {
      this.props = props;
    }
    setProps(props: any): void {
      this.props = {...this.props, ...props};
    }
    redraw(): void {}
    finalize(): void {}
  }
}));

test('weather preserves its sky field of view after a globe round trip', () => {
  vi.stubGlobal('document', {addEventListener: vi.fn(), removeEventListener: vi.fn()});
  try {
    const scene = createWeatherScene({clientWidth: 800, clientHeight: 600} as HTMLDivElement);
    const initial = scene.deck.props.views as MapView;
    expect(initial.props.fovy).toBe(SKY_FIELD_OF_VIEW);
    scene.setProjection('globe');
    expect(scene.deck.props.views).toBeInstanceOf(_GlobeView);
    scene.setProjection('map');
    const restored = scene.deck.props.views as MapView;
    expect(restored).toBeInstanceOf(MapView);
    expect(restored.props.fovy).toBe(initial.props.fovy);
    scene.finalize();
  } finally {
    vi.unstubAllGlobals();
  }
});

test('paused weather reset and time changes rebuild the sky snapshot', () => {
  vi.stubGlobal('document', {addEventListener: vi.fn(), removeEventListener: vi.fn()});
  try {
    const scene = createWeatherScene({clientWidth: 800, clientHeight: 600} as HTMLDivElement);
    (scene.deck.props.onDeviceInitialized as any)({
      type: 'webgpu',
      createTexture: () => ({destroy: vi.fn()})
    });
    scene.setPlaying(false);
    scene.setTime(40);
    const getSky = () =>
      (scene.deck.props.layers as any[]).find(layer => layer.id === 'weather-sky');
    expect(getSky().props.time).toBe(40);
    scene.reset();
    expect(getSky().props.time).toBe(0);
    scene.finalize();
  } finally {
    vi.unstubAllGlobals();
  }
});

test('paused shadow scene does not queue layers on every draw', () => {
  const scene = createRiverfrontSoftShadowScene({
    clientWidth: 800,
    clientHeight: 600
  } as HTMLDivElement);
  scene.setAnimated(false);
  scene.setCloudAnimated(false);
  const setProps = vi.spyOn(scene.deck, 'setProps');
  const render = scene.deck.props.onBeforeRender as () => void;
  render();
  render();
  expect(setProps).not.toHaveBeenCalled();
  scene.setHour(14);
  expect(setProps).toHaveBeenCalledTimes(1);
  scene.finalize();
});

test('globe pause disables continuous drawing and resume resets the clock', () => {
  vi.stubGlobal('window', {matchMedia: () => ({matches: false})});
  try {
    const scene = createGlobeCloudScene({clientWidth: 800, clientHeight: 600} as HTMLDivElement);
    scene.setAnimate(false);
    expect(scene.deck.props._animate).toBe(false);
    scene.setAnimate(true);
    expect(scene.deck.props._animate).toBe(true);
    scene.finalize();
  } finally {
    vi.unstubAllGlobals();
  }
});
