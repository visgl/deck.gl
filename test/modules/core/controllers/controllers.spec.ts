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

import testController, {createTestController} from './test-controller';

const makeDoubleClickDragEvent = (type: string, y: number, scale: number = 1) => ({
  type,
  offsetCenter: {x: 50, y},
  scale,
  srcEvent: {
    preventDefault() {}
  },
  stopPropagation() {}
});

const makeGestureEvent = (
  type: string,
  {
    x = 50,
    y = 50,
    deltaX = 0,
    deltaY = 0,
    pointerType = 'touch'
  }: {
    x?: number;
    y?: number;
    deltaX?: number;
    deltaY?: number;
    pointerType?: 'touch' | 'trackpad';
  } = {}
) => ({
  type,
  pointerType,
  offsetCenter: {x, y},
  deltaX,
  deltaY,
  velocity: 0,
  velocityX: 0,
  velocityY: 0,
  srcEvent: {},
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

test('MapController supports panning with multi-touch translation', () => {
  const controller = createTestController({
    view: new MapView({controller: {multiTouchDrag: 'pan'}}),
    initialViewState: {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 10,
      pitch: 30,
      bearing: -45
    }
  });

  controller.handleEvent(makeGestureEvent('multipanstart') as any);
  controller.handleEvent(makeGestureEvent('multipanmove', {x: 60, deltaX: 10, deltaY: 0}) as any);
  controller.handleEvent(makeGestureEvent('multipanend', {x: 60, deltaX: 10, deltaY: 0}) as any);

  expect(controller.props.longitude, 'horizontal translation pans the viewport').not.toBe(-122.45);
  expect(controller.props.bearing, 'translation does not change bearing').toBe(-45);
  expect(controller.props.pitch, 'translation does not change pitch').toBe(30);
});

test('MapController supports rotating with multi-touch translation', () => {
  const controller = createTestController({
    view: new MapView({controller: {multiTouchDrag: 'rotate'}}),
    initialViewState: {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 10,
      pitch: 30,
      bearing: -45
    }
  });

  controller.handleEvent(makeGestureEvent('multipanstart') as any);
  controller.handleEvent(
    makeGestureEvent('multipanmove', {x: 60, y: 60, deltaX: 10, deltaY: 10}) as any
  );
  controller.handleEvent(
    makeGestureEvent('multipanend', {x: 60, y: 60, deltaX: 10, deltaY: 10}) as any
  );

  expect(controller.props.bearing, 'horizontal translation changes bearing').not.toBe(-45);
  expect(controller.props.pitch, 'vertical translation changes pitch').not.toBe(30);
});

test('MapController only handles synthesized trackpad gestures when enabled', () => {
  const initialViewState = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 10,
    pitch: 30,
    bearing: -45
  };
  const disabledController = createTestController({
    view: new MapView({controller: {multiTouchDrag: 'pan'}}),
    initialViewState
  });

  disabledController.handleEvent(
    makeGestureEvent('multipanstart', {pointerType: 'trackpad'}) as any
  );
  disabledController.handleEvent(
    makeGestureEvent('multipanmove', {pointerType: 'trackpad', deltaX: 10}) as any
  );
  expect(disabledController.props.longitude, 'trackpad gesture is ignored by default').toBe(
    -122.45
  );

  const enabledController = createTestController({
    view: new MapView({controller: {multiTouchDrag: 'pan', trackpadGesture: true}}),
    initialViewState
  });
  enabledController.handleEvent(
    makeGestureEvent('multipanstart', {pointerType: 'trackpad'}) as any
  );
  enabledController.handleEvent(
    makeGestureEvent('multipanmove', {pointerType: 'trackpad', deltaX: 10}) as any
  );
  expect(
    enabledController.props.longitude,
    'trackpad delta is converted to pointer movement'
  ).not.toBe(-122.45);
});

test('MapController only handles trackpad pinch when trackpad gestures are enabled', () => {
  const initialViewState = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 10,
    pitch: 30,
    bearing: -45
  };
  const makePinchEvent = (type: string, scale: number) => ({
    ...makeGestureEvent(type, {pointerType: 'trackpad'}),
    scale,
    rotation: 0,
    deltaTime: type === 'pinchstart' ? 0 : 16
  });
  const disabledController = createTestController({
    view: new MapView({controller: true}),
    initialViewState
  });
  disabledController.handleEvent(makePinchEvent('pinchstart', 1) as any);
  disabledController.handleEvent(makePinchEvent('pinchmove', 1.2) as any);
  expect(disabledController.props.zoom, 'trackpad pinch is ignored by default').toBe(10);

  const enabledController = createTestController({
    view: new MapView({controller: {trackpadGesture: true}}),
    initialViewState
  });
  enabledController.handleEvent(makePinchEvent('pinchstart', 1) as any);
  enabledController.handleEvent(makePinchEvent('pinchmove', 1.2) as any);
  expect(enabledController.props.zoom, 'trackpad pinch follows touchZoom').toBeGreaterThan(10);
});

test('MapController restricts wheel zoom to mouse input when trackpad gestures are enabled', () => {
  const controller = createTestController({
    view: new MapView({controller: {trackpadGesture: true}}),
    initialViewState: {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 10,
      pitch: 30,
      bearing: -45
    }
  });
  const makeWheelEvent = (device: 'mouse' | 'trackpad' | 'unknown') => ({
    type: 'wheel',
    device,
    pointerType: 'mouse',
    offsetCenter: {x: 50, y: 50},
    delta: -1,
    srcEvent: {preventDefault() {}},
    stopPropagation() {}
  });

  controller.handleEvent(makeWheelEvent('trackpad') as any);
  controller.handleEvent(makeWheelEvent('unknown') as any);
  expect(controller.props.zoom, 'non-mouse wheel input is ignored').toBe(10);

  controller.handleEvent(makeWheelEvent('mouse') as any);
  expect(controller.props.zoom, 'mouse wheel input still zooms').not.toBe(10);
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

  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragstart', 50, 1.1) as any);
  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragmove', 20, 1.3) as any);
  const zoomAfterMove = controller.props.zoom;

  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragend', 20, 1.3) as any);

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

  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragstart', 50, 1.1) as any);
  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragmove', 20, 1.3) as any);
  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragend', 20, 1.3) as any);

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

test('GlobeController initializes multipan like pointer pan', () => {
  const controller = createTestController({
    view: new GlobeView({controller: {multiTouchDrag: 'pan'}}),
    initialViewState: {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 0
    }
  });
  controller._panHistory = [{longitude: 0, latitude: 0, timestamp: 0}];

  controller.handleEvent(makeGestureEvent('multipanstart') as any);
  expect(controller._panHistory, 'multipan start clears globe inertia history').toEqual([]);

  controller.handleEvent(makeGestureEvent('multipanmove', {x: 60, deltaX: 10}) as any);
  expect(controller.props.longitude, 'multipan uses globe panning').not.toBe(-122.45);

  controller.handleEvent(makeGestureEvent('multipanend', {x: 60, deltaX: 10}) as any);
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

test('OrthographicController supports multipan only in pan mode', () => {
  const panController = createTestController({
    view: new OrthographicView({controller: {multiTouchDrag: 'pan'}}),
    initialViewState: {
      target: [1, 1, 0],
      zoom: 1
    }
  });
  panController.handleEvent(makeGestureEvent('multipanstart') as any);
  panController.handleEvent(makeGestureEvent('multipanmove', {x: 60, deltaX: 10}) as any);
  expect(panController.props.target, 'multipan uses orthographic panning').not.toEqual([1, 1, 0]);

  const rotateController = createTestController({
    view: new OrthographicView({controller: {multiTouchDrag: 'rotate'}}),
    initialViewState: {
      target: [1, 1, 0],
      zoom: 1
    }
  });
  const handled = rotateController.handleEvent(makeGestureEvent('multipanstart') as any);
  expect(handled, 'unsupported multipan rotation is ignored').toBe(false);
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
