// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {BitmapLayer, ScatterplotLayer} from '@deck.gl/layers';
import {MapLibreOverlay} from '@deck.gl/maplibre';
import {device} from '@deck.gl/test-utils';
import {Map as MapLibreV4Map} from 'maplibre-gl-v4';
import {Map as MapLibreV5Map} from 'maplibre-gl-v5';
import {Map as MapLibreV6Map} from 'maplibre-gl-v6';
import {test, expect} from 'vitest';

import type {Map as MapLibreMap} from 'maplibre-gl-v6';

const webglTest = device.type === 'webgl' ? test : test.skip;

function waitForRender(condition: () => boolean, update?: () => void): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let animationFrame = 0;
    let finished = false;
    const timeout = setTimeout(() => {
      finished = true;
      cancelAnimationFrame(animationFrame);
      reject(new Error('MapLibre render timed out'));
    }, 5000);
    const check = () => {
      if (finished) {
        return;
      }
      if (condition()) {
        finished = true;
        clearTimeout(timeout);
        resolve();
      } else {
        animationFrame = requestAnimationFrame(check);
      }
    };
    update?.();
    check();
  });
}

function readCenterPixel(gl: WebGL2RenderingContext): number[] {
  const pixel = new Uint8Array(4);
  gl.readPixels(
    Math.floor(gl.drawingBufferWidth / 2),
    Math.floor(gl.drawingBufferHeight / 2),
    1,
    1,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixel
  );
  return Array.from(pixel);
}

// Aliases in modules/maplibre/package.json pin the earliest supported release of each major.
// Add an alias, import, and entry here when supporting a new major.
const MAPLIBRE_VERSIONS = [
  {version: '4.5.1', MapClass: MapLibreV4Map},
  {version: '5.0.0', MapClass: MapLibreV5Map},
  {version: '6.0.0', MapClass: MapLibreV6Map}
];

test('MapLibreOverlay overlaid uses only public MapLibre APIs', () => {
  const container = document.createElement('div');
  Object.defineProperties(container, {
    clientWidth: {value: 800},
    clientHeight: {value: 600}
  });
  const map = {
    get transform(): never {
      throw new Error('MapLibre private API accessed: transform');
    },
    get painter(): never {
      throw new Error('MapLibre private API accessed: painter');
    },
    get style(): never {
      throw new Error('MapLibre private API accessed: style');
    },
    getCenter: () => ({lng: -122.45, lat: 37.78}),
    getZoom: () => 14,
    getBearing: () => 0,
    getPitch: () => 0,
    getPadding: () => ({left: 0, right: 0, top: 0, bottom: 0}),
    getRenderWorldCopies: () => true,
    getCenterElevation: () => 125,
    getProjection: () => {
      throw new Error('Style is not loaded');
    },
    getContainer: () => container,
    on() {},
    off() {}
  } as unknown as Parameters<MapLibreOverlay['onAdd']>[0];
  const overlay = new MapLibreOverlay({device, layers: []});

  overlay.onAdd(map);

  expect(overlay._deck).toBeTruthy();
  expect(overlay._deck!.props.viewState.position).toEqual([0, 0, 125]);
  expect(overlay._deck!.props.views.id).toBe('maplibre');

  overlay.onRemove(map);
  expect(overlay._deck).toBeFalsy();
});

for (const {version, MapClass} of MAPLIBRE_VERSIONS) {
  webglTest(`MapLibreOverlay renders with MapLibre ${version}`, async () => {
    const container = document.createElement('div');
    Object.assign(container.style, {width: '400px', height: '300px'});
    document.body.append(container);

    const map = new MapClass({
      container,
      style: {
        version: 8,
        sources: {},
        layers: [{id: 'labels', type: 'background'}]
      },
      center: [-122.45, 37.78],
      zoom: 14,
      attributionControl: false
    }) as unknown as MapLibreMap;
    await new Promise<void>(resolve => map.once('load', () => resolve()));

    for (const interleaved of [false, true]) {
      map.jumpTo({center: [-122.45, 37.78], zoom: 14});
      let centerPixel: number[] = [];
      const image = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1);
      const bounds: [number, number, number, number] = [-122.46, 37.77, -122.44, 37.79];
      const overlay = new MapLibreOverlay({
        interleaved,
        device: interleaved ? undefined : device,
        onAfterRender: ({gl}) => {
          if (!gl || interleaved) {
            return;
          }
          const renderedPixel = readCenterPixel(gl);
          if (renderedPixel[0] === 255) {
            centerPixel = renderedPixel;
          }
        },
        layers: [
          new BitmapLayer({id: 'under-labels', image, bounds, beforeId: 'labels'}),
          new BitmapLayer({id: 'above-labels', image, bounds})
        ]
      });

      map.addControl(overlay);
      map.triggerRepaint();
      await waitForRender(() => {
        if (interleaved) {
          const renderedPixel = readCenterPixel(map.getCanvas().getContext('webgl2')!);
          if (renderedPixel[0] === 255) {
            centerPixel = renderedPixel;
          }
        }
        return Boolean(overlay._deck?.isInitialized && centerPixel[0] === 255);
      });

      expect(overlay._deck).toBeTruthy();
      expect(overlay.getCanvas() === map.getCanvas()).toBe(interleaved);
      if (interleaved) {
        expect(map.getLayersOrder()).toEqual([
          'deck-maplibre-layer-group-before:labels',
          'labels',
          'deck-maplibre-layer-group-last'
        ]);
      }

      expect(centerPixel).toEqual([255, 0, 0, 255]);

      map.jumpTo({center: [-122.4, 37.8], zoom: 12});
      map.triggerRepaint();
      await waitForRender(() => overlay._deck!.props.viewState.zoom === map.getZoom());

      const viewState = overlay._deck!.props.viewState;
      expect(viewState.longitude).toBeCloseTo(map.getCenter().lng);
      expect(viewState.latitude).toBeCloseTo(map.getCenter().lat);
      expect(viewState.zoom).toBe(map.getZoom());
      expect(viewState.roll).toBe(0);

      map.removeControl(overlay);
      expect(overlay._deck).toBeFalsy();
    }

    map.remove();
    container.remove();
  });
}

for (const {version, MapClass} of MAPLIBRE_VERSIONS.slice(1)) {
  for (const projection of ['mercator', 'globe'] as const) {
    for (const interleaved of [false, true]) {
      webglTest(
        `MapLibre ${version} ${projection} roll aligns rendering and picking (interleaved=${interleaved})`,
        async () => {
          const container = document.createElement('div');
          Object.assign(container.style, {width: '640px', height: '400px'});
          document.body.append(container);
          const position: [number, number] = projection === 'globe' ? [20, 55] : [8.53, 47.32];
          const map = new MapClass({
            container,
            style: {version: 8, sources: {}, layers: []},
            center: [8.5, 47.3],
            zoom: projection === 'globe' ? 2 : 11,
            pitch: 45,
            bearing: 25,
            attributionControl: false
          }) as unknown as MapLibreMap;
          let overlayCanvas: HTMLCanvasElement | null = null;
          try {
            await new Promise<void>(resolve => map.once('load', () => resolve()));
            map.setProjection({type: projection});
            map.setPadding({left: 70, right: 10, top: 25, bottom: 5});
            const data = [{position}];
            let renderedPixel: number[] = [];
            const overlay = new MapLibreOverlay({
              interleaved,
              layers: [
                new ScatterplotLayer({
                  id: 'rolled-point',
                  data,
                  getPosition: d => d.position,
                  getRadius: 8,
                  radiusUnits: 'pixels',
                  getFillColor: [0, 0, 255],
                  pickable: true
                })
              ],
              onAfterRender: ({gl}) => {
                if (!gl) return;
                const pixelPosition = map.project(position);
                const pixelRatio = gl.drawingBufferWidth / map.getCanvas().clientWidth;
                const pixel = new Uint8Array(4);
                gl.readPixels(
                  Math.floor(pixelPosition.x * pixelRatio),
                  Math.floor(gl.drawingBufferHeight - pixelPosition.y * pixelRatio),
                  1,
                  1,
                  gl.RGBA,
                  gl.UNSIGNED_BYTE,
                  pixel
                );
                if (pixel[2] === 255) {
                  renderedPixel = Array.from(pixel);
                }
              }
            });
            map.addControl(overlay);
            if (!interleaved) overlayCanvas = overlay.getCanvas();
            await waitForRender(() => Boolean(overlay._deck?.isInitialized));
            for (const roll of [28, -32, 0]) {
              renderedPixel = [];
              // Interleaved resize currently leaves luma's default framebuffer
              // dimensions stale even at zero roll. Exercise resize overlaid.
              if (roll === -32 && !interleaved) {
                container.style.width = '740px';
                container.style.height = '420px';
                map.resize();
              }
              map.setRoll(roll);
              map.triggerRepaint();
              await waitForRender(
                () => overlay._deck?.props.viewState.roll === roll && renderedPixel[2] === 255
              );
              expect(renderedPixel).toEqual([0, 0, 255, 255]);
              const projected = map.project(position);
              const viewport = overlay._deck!.getViewports()[0];
              const actual = viewport.project(position);
              expect(actual[0]).toBeCloseTo(projected.x, 2);
              expect(actual[1]).toBeCloseTo(projected.y, 2);
              const picked = overlay.pickObject({x: projected.x, y: projected.y});
              expect(picked?.object).toBe(data[0]);
              expect(picked!.coordinate![0]).toBeCloseTo(position[0], 2);
              expect(picked!.coordinate![1]).toBeCloseTo(position[1], 2);
            }
          } finally {
            map.remove();
            // Deck.finalize removes its canvas but does not release the WebGL context.
            // Avoid exhausting the browser context limit in the shared test page.
            overlayCanvas?.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
            container.remove();
            expect(device.isLost).toBe(false);
          }
        }
      );
    }
  }
}
