// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapboxOverlay} from '@deck.gl/mapbox';
import {device} from '@deck.gl/test-utils';
import {expect, test} from 'vitest';

import MockMapboxMap from './mapbox-gl-mock/map';

const webglTest = device.type === 'webgl' ? test : test.skip;

webglTest('MapboxOverlay synchronizes camera changes before interleaved Deck loads', async () => {
  const map = new MockMapboxMap({
    center: {lng: 8.5, lat: 47.3},
    zoom: 6
  });

  let resolveLoaded: () => void;
  const loaded = new Promise<void>(resolve => {
    resolveLoaded = resolve;
  });
  let viewStateAtLoad: unknown;
  let zoomAfterMoveAtLoad: number | undefined;
  const overlay = new MapboxOverlay({
    interleaved: true,
    layers: [],
    onLoad: () => {
      viewStateAtLoad = {...overlay._deck!.props.viewState};
      map.setZoom(9);
      zoomAfterMoveAtLoad = overlay._deck!.props.viewState.zoom;
      resolveLoaded();
    }
  });

  map.addControl(overlay);
  expect(overlay._deck!.isInitialized).toBe(false);

  map.setCenter({lng: 9, lat: 48});
  map.setZoom(8);
  map.setBearing(25);
  map.setPitch(30);
  await loaded;

  expect(viewStateAtLoad).toMatchObject({
    longitude: 9,
    latitude: 48,
    zoom: 8,
    bearing: 25,
    pitch: 30
  });
  // The move triggered from within onLoad should be picked up synchronously once watching starts
  expect(zoomAfterMoveAtLoad).toBe(9);
  expect(overlay._deck!.props.viewState).toMatchObject({
    longitude: map.getCenter().lng,
    latitude: map.getCenter().lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch()
  });

  map.removeControl(overlay);
});
