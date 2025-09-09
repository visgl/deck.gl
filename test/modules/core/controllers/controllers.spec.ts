// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {
  MapView,
  OrbitView,
  OrthographicView,
  FirstPersonView,
  _GlobeView as GlobeView
} from '@deck.gl/core';
import {Timeline} from '@luma.gl/engine';

import testController from './test-controller';

test('MapController', async t => {
  await testController(t, MapView, {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 10,
    pitch: 30,
    bearing: -45
  });

  t.end();
});

test('MapController#inertia', async t => {
  await testController(t, MapView, {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 10,
    pitch: 30,
    bearing: -45,
    inertia: true
  });

  t.end();
});

test('GlobeController', async t => {
  await testController(
    t,
    GlobeView,
    {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 0
    },
    // GlobeView cannot be rotated
    ['pan#function key', 'pinch', 'multipan']
  );

  t.end();
});

test('OrbitController', async t => {
  await testController(t, OrbitView, {
    orbitAxis: 'Y',
    rotationX: 30,
    rotationOrbit: -45,
    target: [1, 1, 0],
    zoom: 1
  });

  t.end();
});

test('OrthographicController', async t => {
  await testController(
    t,
    OrthographicView,
    {
      target: [1, 1, 0],
      zoom: 1
    },
    // OrthographicView cannot be rotated
    ['pan#function key', 'multipan']
  );

  t.end();
});

test('OrthographicController#2d zoom', async t => {
  await testController(
    t,
    OrthographicView,
    {
      target: [1, 1, 0],
      zoom: [1, 2]
    },
    // OrthographicView cannot be rotated
    ['pan#function key', 'multipan']
  );

  t.end();
});

test('OrthographicController#scroll zoom handles delayed view updates', t => {
  const timeline = new Timeline();
  const view = new OrthographicView({controller: true});

  const controllerProps = {
    id: 'test-view',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    target: [0, 0, 0],
    zoom: 0,
    scrollZoom: true,
    dragPan: true,
    dragRotate: true,
    doubleClickZoom: true,
    touchZoom: true,
    touchRotate: true,
    keyboard: true,
    ...view.controller
  };

  const viewStates: any[] = [];

  const ControllerClass = controllerProps.type;
  const controller = new ControllerClass({
    timeline,
    onViewStateChange: ({viewState}) => {
      viewStates.push({...viewState});
    },
    onStateChange: () => {},
    makeViewport: viewState =>
      view.makeViewport({
        width: controllerProps.width,
        height: controllerProps.height,
        viewState
      })
  });

  controller.setProps(controllerProps);

  const center = {
    x: controllerProps.x + controllerProps.width / 2,
    y: controllerProps.y + controllerProps.height / 2
  };
  const makeWheelEvent = (delta: number) => ({
    type: 'wheel',
    offsetCenter: center,
    delta,
    srcEvent: {
      preventDefault: () => {}
    },
    stopPropagation: () => {}
  });

  controller.handleEvent(makeWheelEvent(100));
  controller.handleEvent(makeWheelEvent(-100));

  t.is(
    viewStates.length,
    2,
    'view state updates once per wheel event even without immediate setProps'
  );

  const getZoom = ({zoom}) => (Array.isArray(zoom) ? zoom[0] : zoom);

  t.ok(getZoom(viewStates[0]) > 0, 'first wheel event zooms in');
  t.ok(Math.abs(getZoom(viewStates[1])) < 1e-7, 'subsequent wheel event uses the updated zoom');

  t.end();
});

test('FirstPersonController', async t => {
  await testController(
    t,
    FirstPersonView,
    {
      longitude: -122.45,
      latitude: 37.78,
      pitch: 15,
      bearing: 0,
      position: [0, 0, 2]
    },
    // FirstPersonController does not pan
    ['pan#function key', 'pan#function key#disabled']
  );

  t.end();
});
