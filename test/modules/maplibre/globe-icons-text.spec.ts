// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {IconLayer, ScatterplotLayer, TextLayer} from '@deck.gl/layers';
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
    webglTest.each([
      {layerType: 'IconLayer', billboard: true},
      {layerType: 'IconLayer', billboard: false},
      {layerType: 'TextLayer', billboard: true},
      {layerType: 'TextLayer', billboard: false}
    ])(
      `$layerType on MapLibre ${version}, interleaved=${interleaved}, billboard=$billboard`,
      async ({layerType, billboard}) => {
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
            // A solid glyph avoids platform-dependent font rasterization.
            const glyph = new ImageData(new Uint8ClampedArray(32 * 32 * 4).fill(255), 32, 32);
            const labelProps = {
              id: 'label',
              data,
              billboard,
              getPosition: (d: (typeof data)[number]) => d.position,
              getSize: 20,
              pickable: true,
              parameters: {depthCompare: 'always' as const}
            };
            const label =
              layerType === 'IconLayer'
                ? new IconLayer(labelProps, {
                    iconAtlas,
                    iconMapping: {marker: {x: 0, y: 0, width: 1, height: 1}},
                    getIcon: () => 'marker'
                  })
                : new TextLayer(labelProps, {
                    fontFamily: 'MapLibre regression test',
                    characterSet: 'X',
                    fontSettings: {fontSize: 32, buffer: 2},
                    _getFontRenderer: () => ({
                      measure: () => ({advance: 32, width: 32, ascent: 32, descent: 0}),
                      draw: () => ({data: glyph})
                    }),
                    getText: () => 'X',
                    getColor: [255, 0, 0],
                    background: true,
                    backgroundPadding: [8, 8],
                    getBackgroundColor: [0, 255, 0]
                  });
            let rendered: (() => void) | undefined;
            let centerPixel: number[] = [];
            let backgroundPixel: number[] = [];
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
                if (layerType === 'TextLayer') {
                  gl.readPixels(
                    gl.drawingBufferWidth / 2 + (14 * gl.drawingBufferWidth) / overlay._deck.width,
                    gl.drawingBufferHeight / 2,
                    1,
                    1,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    pixel
                  );
                  backgroundPixel = Array.from(pixel);
                }
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
                label
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
              expect(centerPixel, `${projection}: label covers the scatterplot dot`).toEqual([
                255, 0, 0, 255
              ]);
              const deck = overlay._deck!;
              expect(
                overlay.pickObject({x: deck.width / 2, y: deck.height / 2})?.layer?.id,
                projection
              ).toBe('label');
              if (layerType === 'TextLayer') {
                expect(backgroundPixel, `${projection}: text background is visible`).toEqual([
                  0, 255, 0, 255
                ]);
                expect(
                  overlay.pickObject({x: deck.width / 2 + 14, y: deck.height / 2})?.layer?.id,
                  `${projection}: text background is pickable`
                ).toBe('label');
              }
            } finally {
              const gl = overlay._deck?.getCanvas()?.getContext('webgl2');
              map.removeControl(overlay);
              if (!interleaved) {
                // Finalizing Deck does not release its WebGL context until garbage collection.
                // Release it now to avoid exhausting the browser's context limit.
                gl?.getExtension('WEBGL_lose_context')?.loseContext();
              }
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
