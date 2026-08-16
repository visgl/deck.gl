// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {BitmapLayer, ScatterplotLayer} from '@deck.gl/layers';
import {MapLibreOverlay} from '@deck.gl/maplibre';
import {Map} from 'maplibre-gl';
import {test, expect} from 'vitest';

import MockMapLibreMap, {device} from './map-mock';

const webglTest = device.type === 'webgl' ? test : test.skip;

function waitForMapRender(map: Map, condition: () => boolean, update?: () => void): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      map.off('render', onRender);
      reject(new Error('MapLibre render timed out'));
    }, 5000);
    const onRender = () => {
      if (condition()) {
        clearTimeout(timeout);
        map.off('render', onRender);
        resolve();
      }
    };
    map.on('render', onRender);
    update?.();
    map.triggerRepaint();
  });
}

test('MapLibreOverlay overlaid uses only public MapLibre APIs', async () => {
  const map = new MockMapLibreMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14,
    centerElevation: 125
  });
  map.getProjection = () => {
    throw new Error('Style is not loaded');
  };
  const overlay = new MapLibreOverlay({
    device,
    layers: [new ScatterplotLayer({id: 'points'})]
  });

  map.addControl(overlay);

  const deck = overlay._deck;
  expect(deck).toBeTruthy();
  expect(deck.props.viewState.position).toEqual([0, 0, 125]);
  expect(deck.props.views.id).toBe('maplibre');

  map.removeControl(overlay);
  expect(overlay._deck).toBeFalsy();
});

webglTest('MapLibreOverlay interleaved renders a bitmap using the v6 public API', async () => {
  const container = document.createElement('div');
  Object.assign(container.style, {width: '400px', height: '300px'});
  document.body.append(container);

  const map = new Map({
    container,
    style: {
      version: 8,
      sources: {},
      layers: [{id: 'labels', type: 'background'}]
    },
    center: [-122.45, 37.78],
    zoom: 14,
    attributionControl: false
  });
  await map.once('load');

  let bitmapDrawCount = 0;
  class TrackedBitmapLayer extends BitmapLayer {
    static layerName = 'TrackedBitmapLayer';

    override draw(parameters: Parameters<BitmapLayer['draw']>[0]): void {
      bitmapDrawCount++;
      super.draw(parameters);
    }
  }

  const image = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1);
  const bounds: [number, number, number, number] = [-122.46, 37.77, -122.44, 37.79];
  const overlay = new MapLibreOverlay({
    interleaved: true,
    layers: [
      new TrackedBitmapLayer({id: 'under-labels', image, bounds, beforeId: 'labels'}),
      new TrackedBitmapLayer({id: 'above-labels', image, bounds})
    ]
  });

  map.addControl(overlay);
  await waitForMapRender(map, () => Boolean(overlay._deck?.isInitialized && bitmapDrawCount > 0));

  expect(map.getLayer('deck-maplibre-layer-group-last')).toBeTruthy();
  expect(map.getLayersOrder()).toEqual([
    'deck-maplibre-layer-group-before:labels',
    'labels',
    'deck-maplibre-layer-group-last'
  ]);
  expect(overlay._deck).toBeTruthy();
  expect(overlay.getCanvas()).toBe(map.getCanvas());

  const gl = map.getCanvas().getContext('webgl2')!;
  const centerPixel = new Uint8Array(4);
  gl.readPixels(
    Math.floor(gl.drawingBufferWidth / 2),
    Math.floor(gl.drawingBufferHeight / 2),
    1,
    1,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    centerPixel
  );
  expect(Array.from(centerPixel)).toEqual([255, 0, 0, 255]);

  const previousDrawCount = bitmapDrawCount;
  await waitForMapRender(
    map,
    () => bitmapDrawCount > previousDrawCount,
    () => {
      map.jumpTo({center: [-122.4, 37.8], zoom: 12});
    }
  );
  const viewState = overlay._deck!.props.viewState;
  expect(viewState.longitude).toBeCloseTo(map.getCenter().lng);
  expect(viewState.latitude).toBeCloseTo(map.getCenter().lat);
  expect(viewState.zoom).toBe(map.getZoom());

  map.removeControl(overlay);
  expect(overlay._deck).toBeFalsy();
  map.remove();
  container.remove();
});
