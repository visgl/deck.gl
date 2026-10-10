// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {OrthographicViewport, WebMercatorViewport, _GlobeViewport} from '@deck.gl/core';
import {expect, test} from 'vitest';
import {
  createSkyObserver,
  getSunPosition,
  getSkyDirection,
  skyDirectionToGlobe
} from '@math.gl/sun';
import {getSkyObserver} from '../src/layers/sky-coordinates';
import {getSkyBodyClipPosition} from '../src/layers/sky-body-layer';

const DIRECTION = [0, Math.cos(Math.PI / 18), Math.sin(Math.PI / 18)] as const;
const ORIGIN = [-74, 40.7, 0] as const;
function getViewport(longitude = -74, latitude = 40.7, zoom = 15, bearing = 0) {
  return new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude,
    latitude,
    zoom,
    pitch: 80,
    bearing,
    fovy: 50
  });
}

test('sky directions ignore map translation and zoom but follow camera rotation', () => {
  const original = getSkyBodyClipPosition(getViewport(), DIRECTION, ORIGIN)!;
  for (const viewport of [getViewport(-73, 41), getViewport(-74, 40.7, 10)]) {
    const moved = getSkyBodyClipPosition(viewport, DIRECTION, ORIGIN)!;
    expect(moved[0]).toBeCloseTo(original[0], 6);
    expect(moved[1]).toBeCloseTo(original[1], 6);
    expect(moved[2]).toBe(1);
  }
  expect(
    getSkyBodyClipPosition(getViewport(-74, 40.7, 15, 20), DIRECTION, ORIGIN)![0]
  ).not.toBeCloseTo(original[0], 3);
});

test('sky bodies do not render below the horizon, behind the eye, or on orthographic maps', () => {
  expect(getSkyBodyClipPosition(getViewport(), [0, 1, -0.1], ORIGIN)).toBeNull();
  expect(getSkyBodyClipPosition(getViewport(), [0, -1, 0.1], ORIGIN)).toBeNull();
  expect(
    getSkyBodyClipPosition(new OrthographicViewport({width: 800, height: 600}), DIRECTION, ORIGIN)
  ).toBeNull();
});

test('globe celestial directions are independent of the chosen observer frame', () => {
  const timestamp = Date.UTC(2026, 9, 4, 13);
  const viewport = new _GlobeViewport({
    width: 800,
    height: 600,
    longitude: 180,
    latitude: 0,
    zoom: -1
  });
  const positions = [
    [20, 20],
    [-74, 40.7],
    [140, -35]
  ].map(([longitude, latitude]) => {
    const observer = createSkyObserver({longitude, latitude});
    const sun = getSunPosition(timestamp, latitude, longitude);
    const direction = getSkyDirection(sun.altitude, sun.azimuth);
    const globe = skyDirectionToGlobe(direction, observer);
    return {
      globe,
      clip: getSkyBodyClipPosition(viewport, direction, [longitude, latitude, 0], observer)!
    };
  });
  for (const position of positions) {
    expect(position.clip).not.toBeNull();
    for (let component = 0; component < 3; component++) {
      expect(position.globe[component]).toBeCloseTo(positions[0].globe[component], 6);
      expect(position.clip[component]).toBeCloseTo(positions[0].clip[component], 6);
    }
  }
});

test('observer defaults follow the camera, while explicit observers remain fixed', () => {
  const viewport = new _GlobeViewport({width: 800, height: 600, longitude: 137, latitude: -35});
  expect(getSkyObserver(viewport)).toEqual({longitude: 137, latitude: -35, elevation: 0});
  expect(getSkyObserver(viewport, undefined, [-74, 40.7, 15])).toEqual({
    longitude: -74,
    latitude: 40.7,
    elevation: 15
  });
  const observer = createSkyObserver({longitude: 20, latitude: 20});
  expect(getSkyObserver(viewport, observer)).toBe(observer);
});
