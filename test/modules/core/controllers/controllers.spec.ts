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

test('OrthographicController scroll zoom responds without transition lag', t => {
  const timeline = new Timeline();
  const view = new OrthographicView({controller: true});
  const baseProps = {
    id: 'test-view',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    target: [0, 0, 0],
    zoom: 0,
    scrollZoom: true
  };
  const controllerProps = {...view.controller, ...baseProps};
  const ControllerClass = controllerProps.type;

  let currentProps = {...controllerProps};
  let lastViewState = currentProps;

  const controller = new ControllerClass({
    timeline,
    onViewStateChange: ({viewState}) => {
      lastViewState = viewState;
      currentProps = {...currentProps, ...viewState};
      controller.setProps(currentProps);
    },
    onStateChange: () => {},
    makeViewport: viewState =>
      view.makeViewport({width: currentProps.width, height: currentProps.height, viewState})
  });

  controller.setProps(currentProps);

  const wheelEvent = {
    type: 'wheel',
    offsetCenter: {x: 50, y: 50},
    delta: -1,
    srcEvent: {preventDefault() {}},
    stopPropagation: () => {}
  };

  controller.handleEvent(wheelEvent as any);

  const speed = 0.01;
  const {delta} = wheelEvent;
  let scale = 2 / (1 + Math.exp(-Math.abs(delta * speed)));
  if (delta < 0 && scale !== 0) {
    scale = 1 / scale;
  }
  const expectedZoom = baseProps.zoom + Math.log2(scale);

  t.ok(
    Math.abs((lastViewState.zoom as number) - expectedZoom) < 1e-6,
    'zoom level updates immediately when scroll zoom is not smooth'
  );

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
