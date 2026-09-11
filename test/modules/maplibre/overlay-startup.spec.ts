// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapLibreOverlay} from '@deck.gl/maplibre';
import {device} from '@deck.gl/test-utils';
import {Map as MapLibreV4Map} from 'maplibre-gl-v4';
import {Map as MapLibreV5Map} from 'maplibre-gl-v5';
import {Map as MapLibreV6Map} from 'maplibre-gl-v6';
import {expect, test} from 'vitest';

import type {Map as MapLibreMap} from 'maplibre-gl-v6';

const webglTest = device.type === 'webgl' ? test : test.skip;

for (const [version, MapClass] of [
  ['4.5.1', MapLibreV4Map],
  ['5.0.0', MapLibreV5Map],
  ['6.0.0', MapLibreV6Map]
] as const) {
  webglTest(
    `MapLibre ${version} synchronizes camera changes before interleaved Deck loads`,
    async () => {
      const container = document.createElement('div');
      Object.assign(container.style, {width: '400px', height: '300px'});
      document.body.append(container);
      const map = new MapClass({
        container,
        style: {version: 8, sources: {}, layers: []},
        center: [8.5, 47.3],
        zoom: 6,
        attributionControl: false
      }) as unknown as MapLibreMap;

      try {
        await new Promise<void>(resolve => map.once('load', () => resolve()));
        let onLoad: () => void;
        const loaded = new Promise<void>(resolve => {
          onLoad = resolve;
        });
        const overlay = new MapLibreOverlay({interleaved: true, layers: [], onLoad: onLoad!});
        map.addControl(overlay);
        expect(overlay._deck!.isInitialized).toBe(false);

        map.jumpTo({center: [9, 48], zoom: 8, bearing: 25, pitch: 30});
        await loaded;

        expect(overlay._deck!.props.viewState).toMatchObject({
          longitude: map.getCenter().lng,
          latitude: map.getCenter().lat,
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch()
        });
        const projected = overlay._deck!.getViewports()[0].project([9, 48]);
        expect(projected[0]).toBeCloseTo(container.clientWidth / 2);
        expect(projected[1]).toBeCloseTo(container.clientHeight / 2);
      } finally {
        map.remove();
        container.remove();
      }
    }
  );
}
