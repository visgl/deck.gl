// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {MapController, OrbitController, FirstPersonController} from '@deck.gl/core';

test('MapViewState', () => {
  const MapViewState = new MapController({
    longitude: 0,
    latitude: 0,
    zoom: 0
  }).ControllerState;

  const viewState = new MapViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    bearing: 180
  });
  const viewportProps = viewState.getViewportProps();

  expect(viewportProps.pitch, 'added default pitch').toBe(0);
  expect(viewportProps.longitude, 'props are normalized').toBe(178);
  expect(viewportProps.latitude, 'props are normalized').not.toBe(36);
  expect(viewportProps.zoom, 'props are normalized').not.toBe(0);

  const viewState2 = new MapViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    bearing: 180,
    normalize: false
  });
  const viewportProps2 = viewState2.getViewportProps();

  expect(viewportProps2.zoom, 'props are not normalized').toBe(0);

  const viewState3 = new MapViewState({
    width: 800,
    height: 600,
    longitude: -160,
    latitude: 0,
    zoom: 0,
    bearing: -30
  });

  const transitionViewportProps = viewState3.shortestPathFrom(viewState);
  expect(transitionViewportProps.longitude, 'found shortest path for longitude').toBe(200);
  expect(transitionViewportProps.bearing, 'found shortest path for bearing').toBe(330);

  expect(
    () => new MapViewState({width: 400, height: 300}),
    'should throw if missing geospatial props'
  ).toThrow();
});

test('OrbitViewState', () => {
  const OrbitViewState = new OrbitController({}).ControllerState;

  const viewState = new OrbitViewState({
    width: 800,
    height: 600,
    orbitAxis: 'Y',
    rotationX: 60,
    rotationOrbit: 200,
    zoom: 0,
    minRotationX: -45,
    maxRotationX: 45
  });
  const viewportProps = viewState.getViewportProps();

  expect(viewportProps.target, 'added default target').toEqual([0, 0, 0]);
  expect(viewportProps.rotationX, 'props are normalized').toBe(45);
  expect(viewportProps.rotationOrbit, 'props are normalized').toBe(-160);

  const viewState2 = new OrbitViewState({
    width: 800,
    height: 600,
    orbitAxis: 'Y',
    rotationX: 0,
    rotationOrbit: 120,
    zoom: 0
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  expect(transitionViewportProps.rotationOrbit, 'found shortest path for rotationOrbit').toBe(-240);
});

test('FirstPersonViewState', () => {
  const FirstPersonViewState = new FirstPersonController({}).ControllerState;

  const viewState = new FirstPersonViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    bearing: 200,
    pitch: 60,
    maxPitch: 45,
    minPitch: -45
  });
  const viewportProps = viewState.getViewportProps();

  expect(viewportProps.position, 'added default position').toEqual([0, 0, 0]);
  expect(viewportProps.pitch, 'props are normalized').toBe(45);
  expect(viewportProps.bearing, 'props are normalized').toBe(-160);

  const viewState2 = new FirstPersonViewState({
    width: 800,
    height: 600,
    longitude: -160,
    latitude: 36,
    bearing: 120,
    pitch: 0
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  expect(transitionViewportProps.longitude, 'found shortest path for longitude').toBe(200);
  expect(transitionViewportProps.bearing, 'found shortest path for rotationOrbit').toBe(-240);
});
