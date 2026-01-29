// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  MapView,
  OrbitView,
  OrthographicView,
  FirstPersonView,
  _GlobeView as GlobeView
} from '@deck.gl/core';
import {Timeline} from '@luma.gl/engine';

import testController from './test-controller';

test('MapController', async () => {
  await testController(MapView, {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 10,
    pitch: 30,
    bearing: -45
  });
});

test('MapController#inertia', async () => {
  await testController(MapView, {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 10,
    pitch: 30,
    bearing: -45,
    inertia: true
  });
});

test('GlobeController', async () => {
  await testController(
    GlobeView,
    {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 0
    },
    // GlobeView cannot be rotated
    ['pan#function key', 'pinch', 'multipan']
  );
});

test('OrbitController', async () => {
  await testController(OrbitView, {
    orbitAxis: 'Y',
    rotationX: 30,
    rotationOrbit: -45,
    target: [1, 1, 0],
    zoom: 1
  });
});

test('OrthographicController', async () => {
  await testController(
    OrthographicView,
    {
      target: [1, 1, 0],
      zoom: 1
    },
    // OrthographicView cannot be rotated
    ['pan#function key', 'multipan']
  );
});

test('OrthographicController#2d zoom', async () => {
  await testController(
    OrthographicView,
    {
      target: [1, 1, 0],
      zoom: [1, 2]
    },
    // OrthographicView cannot be rotated
    ['pan#function key', 'multipan']
  );
});

test('OrthographicController scroll zoom responds without transition lag', () => {
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

  expect(
    Math.abs((lastViewState.zoom as number) - expectedZoom) < 1e-6,
    'zoom level updates immediately when scroll zoom is not smooth'
  ).toBeTruthy();
});

test('OrthographicController scroll zoom resets isZooming state', () => {
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
  const interactionStates: any[] = [];

  const controller = new ControllerClass({
    timeline,
    onViewStateChange: ({viewState}) => {
      currentProps = {...currentProps, ...viewState};
      controller.setProps(currentProps);
    },
    onStateChange: state => {
      interactionStates.push({...state});
    },
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

  // Verify we get exactly 2 state changes for non-smooth scroll zoom
  expect(interactionStates.length, 'scroll zoom triggers exactly 2 state changes').toBe(2);

  // Verify first state has isZooming: true
  expect(interactionStates[0].isZooming, 'isZooming is set to true at start').toBe(true);
  expect(interactionStates[0].isPanning, 'isPanning is set to true at start').toBe(true);

  // Verify last state has isZooming: false
  expect(interactionStates[1].isZooming, 'isZooming is reset to false at end').toBe(false);
  expect(interactionStates[1].isPanning, 'isPanning is reset to false at end').toBe(false);
});

test('FirstPersonController', async () => {
  await testController(
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
});
