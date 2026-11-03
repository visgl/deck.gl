// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {IconLayer, ScatterplotLayer, TextLayer} from '@deck.gl/layers';
import {MapLibreOverlay} from '@deck.gl/maplibre';
import {device} from '@deck.gl/test-utils';
import {Map as MapLibreMap} from 'maplibre-gl-v6';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';

const webglTest = device.type === 'webgl' ? test : test.skip;

// One map and one overlay per mode serve every case, and their WebGL contexts are released as
// soon as they are done. The headless suite runs close to the browser's limit of 16 live
// contexts, beyond which the browser evicts the oldest one, the shared test device.
let container: HTMLDivElement;
let map: MapLibreMap;

beforeAll(async () => {
  if (device.type !== 'webgl') {
    return;
  }
  container = document.createElement('div');
  Object.assign(container.style, {width: '400px', height: '300px'});
  document.body.append(container);
  map = new MapLibreMap({
    container,
    style: {version: 8, sources: {}, layers: []},
    center: [0, 0],
    zoom: 1,
    attributionControl: false
  });
  await new Promise<void>(resolve => map.once('load', () => resolve()));
});

afterAll(() => {
  // MapLibre releases its context in remove()
  map?.remove();
  container?.remove();
});

for (const interleaved of [false, true]) {
  describe(`interleaved=${interleaved}`, () => {
    let overlay: MapLibreOverlay;

    beforeAll(() => {
      if (device.type !== 'webgl') {
        return;
      }
      overlay = new MapLibreOverlay({interleaved, layers: []});
      map.addControl(overlay);
    });

    afterAll(() => {
      const gl = interleaved ? null : overlay?._deck?.getCanvas()?.getContext('webgl2');
      map?.removeControl(overlay);
      // Finalizing Deck does not release its own context until garbage collection
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    });

    webglTest.each([
      {layerType: 'IconLayer', billboard: true},
      {layerType: 'IconLayer', billboard: false},
      {layerType: 'TextLayer', billboard: true},
      {layerType: 'TextLayer', billboard: false}
    ])(`$layerType, billboard=$billboard`, async ({layerType, billboard}) => {
      for (const projection of ['mercator', 'globe'] as const) {
        map.setProjection({type: projection});
        const data = [{position: [0, 0] as [number, number]}];
        const iconAtlas = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1);
        // A solid glyph avoids platform-dependent font rasterization.
        const glyph = new ImageData(new Uint8ClampedArray(32 * 32 * 4).fill(255), 32, 32);
        // A fresh id per case, so the reused Deck initializes each label instead of updating it
        const labelId = `label-${layerType}-${billboard ? 'billboard' : 'flat'}-${projection}`;
        const labelProps = {
          id: labelId,
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
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(
            () =>
              reject(
                new Error(`${projection}: overlay render timed out, center pixel ${centerPixel}`)
              ),
            5000
          );
          rendered = () => {
            clearTimeout(timeout);
            resolve();
          };
          overlay.setProps({
            onAfterRender: ({gl}) => {
              const deck = overlay._deck;
              // isLoaded stays false until the layer manager has taken up this case's label
              if (!gl || !deck?.isInitialized || !label.isLoaded) {
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
                  gl.drawingBufferWidth / 2 + (14 * gl.drawingBufferWidth) / deck.width,
                  gl.drawingBufferHeight / 2,
                  1,
                  1,
                  gl.RGBA,
                  gl.UNSIGNED_BYTE,
                  pixel
                );
                backgroundPixel = Array.from(pixel);
              }
              // The label draws a frame or two after its atlas is ready; wait for it
              if (centerPixel[0] === 255) {
                rendered?.();
              }
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
        });
        expect(centerPixel, `${projection}: label covers the scatterplot dot`).toEqual([
          255, 0, 0, 255
        ]);
        const deck = overlay._deck!;
        expect(
          overlay.pickObject({x: deck.width / 2, y: deck.height / 2})?.layer?.id,
          projection
        ).toBe(labelId);
        if (layerType === 'TextLayer') {
          expect(backgroundPixel, `${projection}: text background is visible`).toEqual([
            0, 255, 0, 255
          ]);
          expect(
            overlay.pickObject({x: deck.width / 2 + 14, y: deck.height / 2})?.layer?.id,
            `${projection}: text background is pickable`
          ).toBe(labelId);
        }
      }
    });
  });
}
