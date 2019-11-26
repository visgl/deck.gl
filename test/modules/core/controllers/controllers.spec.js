import test from 'tape-catch';
import {MapView, OrbitView, OrthographicView, FirstPersonView} from '@deck.gl/core';

import testController from './test-controller';

test('MapController', t => {
  testController(t, MapView, {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 10,
    pitch: 30,
    bearing: -45
  });

  t.end();
});

test('OrbitController', t => {
  testController(t, OrbitView, {
    orbitAxis: 'Y',
    rotationX: 30,
    rotationOrbit: -45,
    target: [1, 1, 0],
    zoom: 1
  });

  t.end();
});

test('OrthographicController', t => {
  testController(
    t,
    OrthographicView,
    {
      target: [1, 1, 0],
      zoom: 1
    },
    // OrthographicView cannot be rotated
    ['pan#function key']
  );

  t.end();
});

test('FirstPersonController', t => {
  testController(
    t,
    FirstPersonView,
    {
      longitude: -122.45,
      latitude: 37.78,
      pitch: 15,
      position: [0, 0, 2]
    },
    // FirstPersonController does not pan
    ['pan', 'pan#function key']
  );

  t.end();
});
