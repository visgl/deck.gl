// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {IconLayer, ScatterplotLayer} from '@deck.gl/layers';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {MapLibreOverlay} from '@deck.gl/maplibre';
import {device} from '@deck.gl/test-utils';
import {Map as MapLibreV5Map} from 'maplibre-gl-v5';
import {Map as MapLibreV6Map} from 'maplibre-gl-v6';
import {expect, test} from 'vitest';

const webglTest = device.type === 'webgl' ? test : test.skip;

for (const {MapClass, OverlayClass, version} of [
  {MapClass: MapLibreV5Map, OverlayClass: MapboxOverlay, version: '5 (MapboxOverlay)'},
  {MapClass: MapLibreV6Map, OverlayClass: MapLibreOverlay, version: '6 (MapLibreOverlay)'}
]) {
  for (const interleaved of [false, true]) {
    webglTest.each([true, false])(
      `IconLayer on MapLibre ${version}, interleaved=${interleaved}, billboard=%s`,
      async billboard => {
        const container = document.createElement('div');
        Object.assign(container.style, {width: '400px', height: '300px'});
        document.body.append(container);
        const map = new MapClass({
          container,
          style: {version: 8, sources: {}, layers: []},
          center: [0, 0],
          zoom: 1,
          attributionControl: false
        });

        try {
          await new Promise<void>(resolve => map.once('load', () => resolve()));
          for (const projection of ['mercator', 'globe'] as const) {
            map.setProjection({type: projection});
            const data = [{position: [0, 0] as [number, number]}];
            const iconAtlas = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1);
            let rendered: (() => void) | undefined;
            let centerPixel: number[] = [];
            const overlay = new OverlayClass({
              interleaved,
              onAfterRender: ({gl}) => {
                if (
                  !gl ||
                  !overlay._deck?.isInitialized ||
                  !overlay._deck.props.layers[1].isLoaded
                ) {
                  return;
                }
                const pixel = new Uint8Array(4);
                gl.readPixels(
                  gl.drawingBufferWidth / 2,
                  gl.drawingBufferHeight / 2,
                  1,
                  1,
                  gl.RGBA,
                  gl.UNSIGNED_BYTE,
                  pixel
                );
                centerPixel = Array.from(pixel);
                rendered?.();
              },
              layers: [
                new ScatterplotLayer({
                  id: 'dot',
                  data,
                  getPosition: d => d.position,
                  getFillColor: [0, 0, 255],
                  radiusUnits: 'pixels',
                  getRadius: 20,
                  parameters: {depthCompare: 'always'}
                }),
                new IconLayer({
                  id: 'icon',
                  data,
                  billboard,
                  iconAtlas,
                  iconMapping: {marker: {x: 0, y: 0, width: 1, height: 1}},
                  getPosition: d => d.position,
                  getIcon: () => 'marker',
                  getSize: 20,
                  pickable: true,
                  parameters: {depthCompare: 'always'}
                })
              ]
            });
            try {
              await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(
                  () => reject(new Error('Overlay render timed out')),
                  5000
                );
                rendered = () => {
                  clearTimeout(timeout);
                  resolve();
                };
                map.addControl(overlay);
              });
              expect(centerPixel, `${projection}: icon covers the scatterplot dot`).toEqual([
                255, 0, 0, 255
              ]);
              const deck = overlay._deck!;
              expect(
                overlay.pickObject({x: deck.width / 2, y: deck.height / 2})?.layer?.id,
                projection
              ).toBe('icon');
            } finally {
              map.removeControl(overlay);
            }
          }
        } finally {
          map.remove();
          container.remove();
        }
      }
    );
  }
}
