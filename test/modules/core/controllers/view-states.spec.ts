// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {
  MapController,
  OrbitController,
  FirstPersonController,
  _GlobeController as GlobeController,
  Viewport
} from '@deck.gl/core';
import {normalizeViewportProps} from '@math.gl/web-mercator';

const dummyMakeViewport = (props: any) => new Viewport(props);

test('MapViewState', t => {
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

  t.is(viewportProps.pitch, 0, 'added default pitch');
  t.is(viewportProps.longitude, expectedProps.longitude, 'props are normalized');
  t.is(viewportProps.latitude, expectedProps.latitude, 'props are normalized');
  t.is(viewportProps.zoom, expectedProps.zoom, 'props are normalized');

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
  t.is(transitionViewportProps.longitude, 200, 'found shortest path for longitude');
  t.is(transitionViewportProps.bearing, 330, 'found shortest path for bearing');

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

  t.is(viewportProps.zoom, 0, 'props are not normalized');

  t.throws(
    () => new MapViewState({width: 400, height: 300} as any),
    'should throw if missing geospatial props'
  );

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
  t.is(viewportProps.longitude, 0, 'longitude is inside maxBounds');
  t.ok(viewportProps.latitude > 45 && viewportProps.latitude < 55, 'latitude is inside maxBounds');
  t.ok(viewportProps.zoom > 5, 'zoom is adjusted by maxBounds');

  t.end();
});

test('GlobeViewState', t => {
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

  t.is(viewportProps.longitude, 178, 'no bounds#longitude is normalized');
  t.is(viewportProps.latitude, 36, 'no bounds#latitude is not change');
  t.is(viewportProps.zoom, 0, 'no bounds#zoom is not changed');

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
  t.is(viewportProps.longitude, -45, 'full coverage bounds#longitude is not changed');
  t.is(viewportProps.latitude, 36, 'full coverage bounds#latitude is not changed');
  t.ok(viewportProps.zoom > 1, 'full coverage bounds#zoom is adjusted');

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
  t.is(viewportProps.longitude, 10, 'medium bounds#longitude is adjusted');
  t.ok(
    viewportProps.latitude < 30 && viewportProps.latitude > -10,
    'medium bounds#latitude is adjusted'
  );
  t.ok(viewportProps.zoom > 3, 'medium bounds#zoom is adjusted');

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
  console.log(viewportProps);
  t.ok(
    viewportProps.longitude > -122.46 && viewportProps.longitude < -122.44,
    'small bounds#longitude is adjusted'
  );
  t.ok(
    viewportProps.latitude < 37.78 && viewportProps.latitude > 37.75,
    'small bounds#latitude is adjusted'
  );
  t.ok(viewportProps.zoom > 12, 'small bounds#zoom is adjusted');

  t.end();
});

test('OrbitViewState', t => {
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

  t.deepEqual(viewportProps.target, [0, 0, 0], 'added default target');
  t.is(viewportProps.rotationX, 45, 'props are normalized');
  t.is(viewportProps.rotationOrbit, -160, 'props are normalized');

  const viewState2 = new OrbitViewState({
    width: 800,
    height: 600,
    orbitAxis: 'Y',
    rotationX: 0,
    rotationOrbit: 120,
    zoom: 0
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  t.is(transitionViewportProps.rotationOrbit, -240, 'found shortest path for rotationOrbit');

  t.end();
});

test('FirstPersonViewState', t => {
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

  t.deepEqual(viewportProps.position, [0, 0, 0], 'added default position');
  t.is(viewportProps.pitch, 45, 'props are normalized');
  t.is(viewportProps.bearing, -160, 'props are normalized');

  const viewState2 = new FirstPersonViewState({
    width: 800,
    height: 600,
    longitude: -160,
    latitude: 36,
    bearing: 120,
    pitch: 0
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  t.is(transitionViewportProps.longitude, 200, 'found shortest path for longitude');
  t.is(transitionViewportProps.bearing, -240, 'found shortest path for rotationOrbit');

  t.end();
});
