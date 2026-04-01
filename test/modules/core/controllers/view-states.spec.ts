// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  MapController,
  OrbitController,
  FirstPersonController,
  _GlobeController as GlobeController,
  OrbitViewport,
  OrthographicController,
  Viewport
} from '@deck.gl/core';
import {normalizeViewportProps} from '@math.gl/web-mercator';

const dummyMakeViewport = (props: any) => new Viewport(props);

test('MapViewState', () => {
  const MapViewState = new MapController({} as any).ControllerState;

  let viewState = new MapViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    bearing: 180,
    makeViewport: dummyMakeViewport
  });
  let viewportProps = viewState.getViewportProps();
  const expectedProps = normalizeViewportProps({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    bearing: 180
  });

  expect(viewportProps.pitch, 'added default pitch').toBe(0);
  expect(viewportProps.longitude, 'props are normalized').toBe(expectedProps.longitude);
  expect(viewportProps.latitude, 'props are normalized').toBe(expectedProps.latitude);
  expect(viewportProps.zoom, 'props are normalized').toBe(expectedProps.zoom);

  const viewState2 = new MapViewState({
    width: 800,
    height: 600,
    longitude: -160,
    latitude: 0,
    zoom: 0,
    bearing: -30,
    makeViewport: dummyMakeViewport
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  expect(transitionViewportProps.longitude, 'found shortest path for longitude').toBe(200);
  expect(transitionViewportProps.bearing, 'found shortest path for bearing').toBe(330);

  viewState = new MapViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    bearing: 180,
    normalize: false,
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();

  expect(viewportProps.zoom, 'props are not normalized').toBe(0);

  expect(() => new MapViewState({width: 400, height: 300} as any), 'should throw').toThrow();

  viewState = new MapViewState({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 0,
    zoom: 0,
    bearing: 120,
    maxBounds: [
      [-5, 45],
      [5, 55]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.longitude, 'longitude is inside maxBounds').toBe(0);
  expect(
    viewportProps.latitude > 45 && viewportProps.latitude < 55,
    'latitude is inside maxBounds'
  ).toBeTruthy();
  expect(viewportProps.zoom > 5, 'zoom is adjusted by maxBounds').toBeTruthy();
});

test('GlobeViewState', () => {
  const GlobeViewState = new GlobeController({} as any).ControllerState;

  let viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    makeViewport: dummyMakeViewport
  });
  let viewportProps = viewState.getViewportProps();

  expect(viewportProps.longitude, 'no bounds#longitude is normalized').toBe(178);
  expect(viewportProps.latitude, 'no bounds#latitude is not changed').toBe(36);
  expect(viewportProps.zoom, 'no bounds#zoom is not changed').toBe(0);

  viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: -45,
    latitude: 36,
    zoom: 0,
    maxBounds: [
      [-180, -90],
      [180, 90]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.longitude, 'full coverage bounds#longitude is not changed').toBe(-45);
  expect(viewportProps.latitude, 'full coverage bounds#latitude is not changed').toBe(36);
  expect(viewportProps.zoom > 1, 'full coverage bounds#zoom is adjusted').toBeTruthy();

  viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: -45,
    latitude: 36,
    zoom: 0,
    maxBounds: [
      [-10, -10],
      [30, 30]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.longitude, 'medium bounds#longitude is adjusted').toBe(10);
  expect(
    viewportProps.latitude < 30 && viewportProps.latitude > -10,
    'medium bounds#latitude is adjusted'
  ).toBeTruthy();
  expect(viewportProps.zoom > 3, 'medium bounds#zoom is adjusted').toBeTruthy();

  viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 0,
    zoom: 0,
    maxBounds: [
      [-122.46, 37.75],
      [-122.44, 37.78]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(
    viewportProps.longitude > -122.46 && viewportProps.longitude < -122.44,
    'small bounds#longitude is adjusted'
  ).toBeTruthy();
  expect(
    viewportProps.latitude < 37.78 && viewportProps.latitude > 37.75,
    'small bounds#latitude is adjusted'
  ).toBeTruthy();
  expect(viewportProps.zoom > 12, 'small bounds#zoom is adjusted').toBeTruthy();
});

test('OrbitViewState', () => {
  const OrbitViewState = new OrbitController({} as any).ControllerState;
  const makeViewport = (props: any) => new OrbitViewport(props);

  let viewState = new OrbitViewState({
    width: 800,
    height: 600,
    rotationX: 60,
    rotationOrbit: 200,
    zoom: 0,
    minRotationX: -45,
    maxRotationX: 45,
    makeViewport
  });
  let viewportProps = viewState.getViewportProps();

  expect(viewportProps.target, 'added default target').toEqual([0, 0, 0]);
  expect(viewportProps.rotationX, 'props are normalized').toBe(45);
  expect(viewportProps.rotationOrbit, 'props are normalized').toBe(-160);

  const viewState2 = new OrbitViewState({
    width: 800,
    height: 600,
    rotationX: 0,
    rotationOrbit: 120,
    zoom: 0,
    makeViewport
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  expect(transitionViewportProps.rotationOrbit, 'found shortest path for rotationOrbit').toBe(-240);

  viewState = new OrbitViewState({
    width: 800,
    height: 600,
    rotationX: 0,
    rotationOrbit: 0,
    zoom: 0,
    target: [-3, 2, 0],
    maxBounds: [
      [-1, -1, -1],
      [1, 1, 1]
    ],
    makeViewport
  });
  viewportProps = viewState.getViewportProps();

  expect(viewportProps.target, 'target is clipped inside maxBounds').toEqual([-1, 1, 0]);
  expect(viewportProps.zoom > 6, 'zoom is adjusted to maxBounds').toBeTruthy();

  viewState = new OrbitViewState({
    width: 800,
    height: 600,
    rotationX: 60,
    rotationOrbit: 0,
    zoom: 0,
    target: [-3, 2, 0],
    maxBounds: [
      [-1, -1, -1],
      [1, 1, 1]
    ],
    makeViewport
  });
  viewportProps = viewState.getViewportProps();

  expect(viewportProps.target[2] < 0, 'target is clipped inside maxBounds').toBeTruthy();
});

test('OrthographicViewState', () => {
  const OrthographicViewState = new OrthographicController({} as any).ControllerState;

  let viewState = new OrthographicViewState({
    width: 800,
    height: 600,
    target: [0, 0, 0],
    zoom: [1, 3],
    zoomAxis: 'Y',
    maxZoomY: 2,
    makeViewport: dummyMakeViewport
  });
  let viewportProps = viewState.getViewportProps();
  expect(viewportProps.zoomX, 'normalized zoom').toBe(1);
  expect(viewportProps.zoomY, 'normalized zoom').toBe(2);

  viewState = new OrthographicViewState({
    width: 800,
    height: 600,
    target: [0, 0, 0],
    zoom: [3, 4],
    maxZoomX: 2,
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.zoomX, 'normalized zoom').toBe(2);
  expect(viewportProps.zoomY, 'normalized zoom').toBe(3);

  viewState = new OrthographicViewState({
    width: 800,
    height: 600,
    target: [0, 0, 0],
    zoom: 0,
    zoomAxis: 'X',
    minZoomX: 0,
    maxZoomX: 20,
    minZoomY: 0,
    maxZoomY: 0,
    maxBounds: [
      [100, 0],
      [200, 150]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.target, 'adjusted target to maxBounds').toEqual([150, 300, 0]);
  expect(viewportProps.zoomX, 'adjusted zoom to maxBounds').toBe(3);
  expect(viewportProps.zoomY, 'adjusted zoom to maxBounds').toBe(0);
});

test('FirstPersonViewState', () => {
  const FirstPersonViewState = new FirstPersonController({} as any).ControllerState;

  let viewState = new FirstPersonViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    bearing: 200,
    pitch: 60,
    maxPitch: 45,
    minPitch: -45,
    makeViewport: dummyMakeViewport
  });
  let viewportProps = viewState.getViewportProps();

  expect(viewportProps.position, 'added default position').toEqual([0, 0, 0]);
  expect(viewportProps.pitch, 'props are normalized').toBe(45);
  expect(viewportProps.bearing, 'props are normalized').toBe(-160);

  const viewState2 = new FirstPersonViewState({
    width: 800,
    height: 600,
    longitude: -160,
    latitude: 36,
    bearing: 120,
    pitch: 0,
    makeViewport: dummyMakeViewport
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  expect(transitionViewportProps.longitude, 'found shortest path for longitude').toBe(200);
  expect(transitionViewportProps.bearing, 'found shortest path for rotationOrbit').toBe(-240);

  viewState = new FirstPersonViewState({
    width: 800,
    height: 600,
    longitude: -122.4,
    latitude: 37.8,
    position: [-200, 100, 0],
    maxBounds: [
      [-100, -100],
      [100, 100]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();

  expect(viewportProps.position, 'updated position to constraints').toEqual([-100, 100, 0]);
});
