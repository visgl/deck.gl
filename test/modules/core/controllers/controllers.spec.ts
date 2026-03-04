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

import testController, {createTestController} from './test-controller';

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

test('OrthographicController keyboard navigation with padding', async t => {
  const controller = createTestController({
    view: new OrthographicView({
      controller: {
        keyboard: {moveSpeed: 10}
      },
      padding: {left: 50, top: 20}
    }),
    initialViewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    onViewStateChange: ({viewState}) => {
      viewState.transitionDuration = 0;
      return viewState;
    }
  });
  controller.setProps({...controller.props, target: [0, 0, 0], zoom: 0});

  const keyboardEvent = {
    type: 'keydown',
    srcEvent: {preventDefault() {}, code: 'ArrowLeft'},
    stopPropagation: () => {}
  };

  controller.handleEvent(keyboardEvent);
  t.deepEqual(controller.props.target, [10, 0], 'Moved 10px left');

  keyboardEvent.srcEvent.code = 'ArrowUp';
  controller.handleEvent(keyboardEvent);
  t.deepEqual(controller.props.target, [10, 10], 'Moved 10px up');

  t.end();
});

test('OrthographicController scroll zoom responds without transition lag', t => {
  const controller = createTestController({
    view: new OrthographicView({controller: true, padding: {left: 50, top: 20}}),
    initialViewState: {
      target: [0, 0, 0],
      zoom: 0,
      scrollZoom: true
    }
  });

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
  const expectedZoom = Math.log2(scale);

  t.ok(
    Math.abs((controller.props.zoom as number) - expectedZoom) < 1e-6,
    'zoom level updates immediately when scroll zoom is not smooth'
  );

  t.end();
});

test('OrthographicController scroll zoom resets isZooming state', t => {
  const interactionStates: any[] = [];
  const controller = createTestController({
    view: new OrthographicView({controller: true, padding: {left: 50, top: 20}}),
    initialViewState: {
      target: [0, 0, 0],
      zoom: 0,
      scrollZoom: true
    },
    onStateChange: state => {
      interactionStates.push({...state});
    }
  });

  const wheelEvent = {
    type: 'wheel',
    offsetCenter: {x: 50, y: 50},
    delta: -1,
    srcEvent: {preventDefault() {}},
    stopPropagation: () => {}
  };

  controller.handleEvent(wheelEvent as any);

  // Verify we get exactly 2 state changes for non-smooth scroll zoom
  t.is(interactionStates.length, 2, 'scroll zoom triggers exactly 2 state changes');

  // Verify first state has isZooming: true
  t.is(interactionStates[0].isZooming, true, 'isZooming is set to true at start');
  t.is(interactionStates[0].isPanning, true, 'isPanning is set to true at start');

  // Verify last state has isZooming: false
  t.is(interactionStates[1].isZooming, false, 'isZooming is reset to false at end');
  t.is(interactionStates[1].isPanning, false, 'isPanning is reset to false at end');

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
