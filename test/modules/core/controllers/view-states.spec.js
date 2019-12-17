import test from 'tape-catch';
import {MapController, OrbitController, FirstPersonController} from '@deck.gl/core';

test('MapViewState', t => {
  const MapViewState = new MapController({}).ControllerState;

  const viewState = new MapViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    bearing: 180
  });
  const viewportProps = viewState.getViewportProps();

  t.is(viewportProps.pitch, 0, 'added default pitch');
  t.is(viewportProps.longitude, 178, 'props are normalized');
  t.not(viewportProps.latitude, 36, 'props are normalized');

  const viewState2 = new MapViewState({
    width: 800,
    height: 600,
    longitude: -160,
    latitude: 0,
    zoom: 0,
    bearing: -30
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  t.is(transitionViewportProps.longitude, 200, 'found shortest path for longitude');
  t.is(transitionViewportProps.bearing, 330, 'found shortest path for bearing');

  t.throws(
    () => new MapViewState({longitude: 0, latitude: 0, zoom: 1}),
    'should throw if missing dimension props'
  );
  t.throws(
    () => new MapViewState({width: 400, height: 300}),
    'should throw if missing geospatial props'
  );

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
