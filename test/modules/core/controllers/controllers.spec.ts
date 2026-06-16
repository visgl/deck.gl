// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  MapView,
  OrbitView,
  OrthographicView,
  FirstPersonView,
  _GlobeView as GlobeView,
  _GlobeController as GlobeController
} from '@deck.gl/core';
import {Timeline} from '@luma.gl/engine';

import testController, {createTestController} from './test-controller';

const makePointerEvent = (type: string, y: number, timeStamp: number, pointerId: number = 1) => ({
  type,
  offsetCenter: {x: 50, y},
  timeStamp,
  srcEvent: {
    pointerId,
    pointerType: 'touch',
    timeStamp,
    preventDefault() {}
  },
  stopPropagation() {}
});

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

test('MapController supports double-click drag zoom when double click and touch zoom are disabled', () => {
  const controller = createTestController({
    view: new MapView({
      controller: {doubleClickZoom: false, doubleClickDragZoom: true, touchZoom: false}
    }),
    initialViewState: {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 10,
      pitch: 30,
      bearing: -45,
      inertia: 300
    }
  });

  controller.handleEvent(makePointerEvent('pointerdown', 50, 0) as any);
  controller.handleEvent(makePointerEvent('pointerup', 50, 50) as any);
  controller.handleEvent(makePointerEvent('pointerdown', 50, 120) as any);
  controller.handleEvent(makePointerEvent('pointermove', 20, 150) as any);
  const zoomAfterMove = controller.props.zoom;

  controller.handleEvent(makePointerEvent('pointerup', 20, 180) as any);

  expect(zoomAfterMove, 'dragging up after double click zooms in').toBeGreaterThan(10);
  expect(controller.props.zoom, 'release should not change zoom').toBeCloseTo(zoomAfterMove);
});

test('MapController disables double-click drag zoom', () => {
  const controller = createTestController({
    view: new MapView({controller: {doubleClickDragZoom: false}}),
    initialViewState: {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 10,
      pitch: 30,
      bearing: -45,
      inertia: 300
    }
  });

  controller.handleEvent(makePointerEvent('pointerdown', 50, 0) as any);
  controller.handleEvent(makePointerEvent('pointerup', 50, 50) as any);
  controller.handleEvent(makePointerEvent('pointerdown', 50, 120) as any);
  controller.handleEvent(makePointerEvent('pointermove', 20, 150) as any);
  controller.handleEvent(makePointerEvent('pointerup', 20, 180) as any);

  expect(controller.props.zoom, 'double-click drag zoom stays disabled').toBe(10);
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

test('GlobeController is terrain-aware by default', () => {
  const controller = createTestController({
    view: new GlobeView({controller: true}),
    initialViewState: {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 1
    }
  });

  // GlobeController is terrain-aware via the `withTerrain` mixin — WITHOUT inheriting
  // MapController/TerrainController. The mixin defaults rotation to pivot around the
  // 3D point under the pointer, which is observable on the controller props.
  expect(controller, 'GlobeView default controller is a GlobeController').toBeInstanceOf(
    GlobeController
  );
  expect(
    (controller.props as any).rotationPivot,
    'terrain mixin defaults rotationPivot to 3d'
  ).toBe('3d');
  controller.finalize();
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
    [
      'pan#function key',
      'pan#function key#disabled',
      'multipan',
      'multipan#disabled',
      'keyboard#function key'
    ]
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
    [
      'pan#function key',
      'pan#function key#disabled',
      'multipan',
      'multipan#disabled',
      'keyboard#function key'
    ]
  );
});

test('OrthographicController keyboard navigation with padding', async () => {
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
  expect(controller.props.target, 'Moved 10px left').toEqual([10, 0]);

  keyboardEvent.srcEvent.code = 'ArrowUp';
  controller.handleEvent(keyboardEvent);
  expect(controller.props.target, 'Moved 10px up').toEqual([10, 10]);
});

test('OrthographicController scroll zoom responds without transition lag', () => {
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

  expect(
    Math.abs((controller.props.zoom as number) - expectedZoom) < 1e-6,
    'zoom level updates immediately when scroll zoom is not smooth'
  ).toBeTruthy();
});

test('OrthographicController scroll zoom resets isZooming state', () => {
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
