// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {MapView, _GlobeView} from '@deck.gl/core';
import {createWeatherScene} from '../../../examples/deck/weather/app';
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
