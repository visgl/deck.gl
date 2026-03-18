// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
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
  const OrbitViewState = new OrbitController({} as any).ControllerState;
  const makeViewport = props => new OrbitViewport(props);

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

  t.deepEqual(viewportProps.target, [0, 0, 0], 'added default target');
  t.is(viewportProps.rotationX, 45, 'props are normalized');
  t.is(viewportProps.rotationOrbit, -160, 'props are normalized');

  const viewState2 = new OrbitViewState({
    width: 800,
    height: 600,
    rotationX: 0,
    rotationOrbit: 120,
    zoom: 0,
    makeViewport
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  t.is(transitionViewportProps.rotationOrbit, -240, 'found shortest path for rotationOrbit');

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

  t.deepEqual(viewportProps.target, [-1, 1, 0], 'target is clipped inside maxBounds');
  t.ok(viewportProps.zoom > 6, 'zoom is adjusted to maxBounds');

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

  t.ok(viewportProps.target[2] < 0, 'target is clipped inside maxBounds');

  t.end();
});

test('OrthographicViewState', t => {
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
  t.is(viewportProps.zoomX, 1, 'normalized zoom');
  t.is(viewportProps.zoomY, 2, 'normalized zoom');

  viewState = new OrthographicViewState({
    width: 800,
    height: 600,
    target: [0, 0, 0],
    zoom: [3, 4],
    maxZoomX: 2,
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  t.is(viewportProps.zoomX, 2, 'normalized zoom');
  t.is(viewportProps.zoomY, 3, 'normalized zoom');

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
  t.deepEqual(viewportProps.target, [150, 300, 0], 'adjusted target to maxBounds');
  t.is(viewportProps.zoomX, 3, 'adjusted zoom to maxBounds');
  t.is(viewportProps.zoomY, 0, 'adjusted zoom to maxBounds');

  t.end();
});

test('FirstPersonViewState', t => {
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

  t.deepEqual(viewportProps.position, [0, 0, 0], 'added default position');
  t.is(viewportProps.pitch, 45, 'props are normalized');
  t.is(viewportProps.bearing, -160, 'props are normalized');

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
  t.is(transitionViewportProps.longitude, 200, 'found shortest path for longitude');
  t.is(transitionViewportProps.bearing, -240, 'found shortest path for rotationOrbit');

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

  t.deepEqual(viewportProps.position, [-100, 100, 0], 'updated position to constraints');

  t.end();
});
