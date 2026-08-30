// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  type ControllerProps,
  LinearInterpolator,
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

const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-10, -10],
  [10, 10]
];

function createMapRubberBandController({
  controller: controllerOptions,
  initialViewState,
  ...options
}: RubberBandControllerOptions = {}) {
  return createTestController({
    ...options,
    view: new MapView({
      controller: {maxBounds: MAP_MAX_BOUNDS, rubberBand: true, ...controllerOptions}
    }),
    initialViewState: {longitude: 0, latitude: 0, zoom: 4, ...initialViewState}
  });
}

test('MapState constrains and releases elastic panning', () => {
  const controller = createMapRubberBandController();
  const startedState = controller.controllerState.panStart({pos: [50, 50]}, {mode: 'hard'});
  const hardLongitude = startedState
    .pan({pos: [400, 50]}, {mode: 'hard'})
    .getViewportProps().longitude;
  const elasticState = startedState.pan({pos: [400, 50]}, {mode: 'elastic'});
  const elasticLongitude = elasticState.getViewportProps().longitude;
  const rawLongitude = startedState
    .pan({pos: [400, 50]}, {mode: 'preserve'})
    .getViewportProps().longitude;

  expect(elasticLongitude, 'elastic panning temporarily exceeds the edge').toBeLessThan(
    hardLongitude
  );
  expect(elasticLongitude, 'elastic panning resists the raw displacement').toBeGreaterThan(
    rawLongitude
  );
  expect(
    elasticState.panEnd({mode: 'rebound'}).getViewportProps().longitude,
    'panEnd returns to the nearest valid edge'
  ).toBeCloseTo(hardLongitude);
  controller.finalize();
});

test('MapController springs overscroll back within maxBounds', () => {
  const interactionStates: any[] = [];
  const controller = createMapRubberBandController({
    onStateChange: state => interactionStates.push({...state})
  });
  const settledLongitude = controller.controllerState
    .panStart({pos: [50, 50]}, {mode: 'hard'})
    .pan({pos: [400, 50]}, {mode: 'hard'})
    .getViewportProps().longitude;

  panRubberBand(controller, {x: 400});
  expect(controller.props.longitude, 'panning temporarily exceeds maxBounds').toBeLessThan(
    settledLongitude
  );
  controller.handleEvent(makeGestureEvent('panend', {x: 400}) as any);

  expect(controller.transitionManager.transition.inProgress, 'release starts a rebound').toBe(true);
  advanceRubberBandTransition(controller, 300);
  expect(controller.props.longitude, 'the view settles at the constrained edge').toBeCloseTo(
    settledLongitude
  );
  expectRubberBandInteractionEnded(interactionStates);
  controller.finalize();
});

test('MapController rubber-bands continuous zoom limits', () => {
  const controller = createMapRubberBandController({
    controller: {maxBounds: null},
    initialViewState: {zoom: 0.5, minZoom: 0, maxZoom: 1}
  });
  const endEvent = pinchRubberBand(controller, 4);

  expect(controller.props.zoom, 'pinch zoom temporarily exceeds maxZoom').toBeGreaterThan(1);
  expect(controller.props.zoom, 'elastic zoom resists the raw zoom').toBeLessThan(2.5);
  controller.handleEvent(endEvent as any);
  advanceRubberBandTransition(controller, 300);
  expect(controller.props.zoom, 'zoom settles at maxZoom').toBeCloseTo(1);
  controller.finalize();
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

const ZOOM_AROUND_CASES = [
  {
    title: 'MapController',
    ViewClass: MapView,
    initialViewState: {longitude: 0, latitude: 0, zoom: 1},
    getPosition: props => [props.longitude, props.latitude]
  },
  {
    title: 'OrbitController',
    ViewClass: OrbitView,
    initialViewState: {target: [0, 0, 0], rotationX: 0, rotationOrbit: 0, zoom: 1},
    getPosition: props => props.target
  },
  {
    title: 'OrthographicController',
    ViewClass: OrthographicView,
    initialViewState: {target: [0, 0, 0], zoom: 1},
    getPosition: props => props.target
  },
  {
    title: 'FirstPersonController',
    ViewClass: FirstPersonView,
    initialViewState: {position: [0, 0, 1], bearing: 0, pitch: 0},
    getPosition: props => props.position
  }
];

const makeWheelEvent = () => ({
  type: 'wheel',
  pointerType: 'mouse',
  offsetCenter: {x: 75, y: 25},
  delta: -10,
  srcEvent: {preventDefault() {}},
  stopPropagation() {}
});

test.each(ZOOM_AROUND_CASES)('$title applies shared zoomAround option', testCase => {
  const makeController = (zoomAround: 'center' | 'pointer') =>
    createTestController({
      view: new testCase.ViewClass({controller: {zoomAround}}),
      initialViewState: testCase.initialViewState
    });

  const centerZoomController = makeController('center');
  const pointerZoomController = makeController('pointer');

  centerZoomController.handleEvent(makeWheelEvent() as any);
  pointerZoomController.handleEvent(makeWheelEvent() as any);

  expect(
    testCase.getPosition(pointerZoomController.props),
    'pointer and center anchors produce different camera positions'
  ).not.toEqual(testCase.getPosition(centerZoomController.props));
});

test('Controller defaults zoomAround to pointer', () => {
  const makeController = controller =>
    createTestController({
      view: new MapView({controller}),
      initialViewState: {longitude: 0, latitude: 0, zoom: 1}
    });
  const defaultController = makeController(true);
  const pointerController = makeController({zoomAround: 'pointer'});

  defaultController.handleEvent(makeWheelEvent() as any);
  pointerController.handleEvent(makeWheelEvent() as any);

  expect(defaultController.props.longitude, 'default longitude matches pointer mode').toBeCloseTo(
    pointerController.props.longitude
  );
  expect(defaultController.props.latitude, 'default latitude matches pointer mode').toBeCloseTo(
    pointerController.props.latitude
  );
});

test('Controller center zoom preserves the padded viewport center', () => {
  const view = new MapView({
    controller: {zoomAround: 'center'},
    padding: {left: 40, right: 0, top: 10, bottom: 30}
  });
  const controller = createTestController({
    view,
    initialViewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const viewport = view.makeViewport({
    width: controller.props.width,
    height: controller.props.height,
    viewState: controller.props
  })!;

  const paddedCenter = viewport.project([0, 0]);
  expect(paddedCenter[0], 'padding offsets the semantic center horizontally').toBeCloseTo(70);
  expect(paddedCenter[1], 'padding offsets the semantic center vertically').toBeCloseTo(40);

  controller.handleEvent(makeWheelEvent() as any);

  expect(controller.props.longitude, 'center zoom preserves longitude').toBeCloseTo(0);
  expect(controller.props.latitude, 'center zoom preserves latitude').toBeCloseTo(0);
});

test('Controller applies updated zoomAround option without recreating the view', () => {
  const controller = createTestController({
    view: new MapView({controller: {zoomAround: 'center'}}),
    initialViewState: {longitude: 0, latitude: 0, zoom: 1}
  });

  controller.handleEvent(makeWheelEvent() as any);
  expect(controller.props.longitude, 'center zoom preserves longitude').toBeCloseTo(0);

  controller.setProps({...controller.props, zoomAround: 'pointer'});
  controller.handleEvent(makeWheelEvent() as any);
  expect(controller.props.longitude, 'pointer zoom adjusts longitude').not.toBeCloseTo(0);
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

const ORTHOGRAPHIC_MAX_BOUNDS: [[number, number], [number, number]] = [
  [0, 0],
  [200, 200]
];

type RubberBandControllerOptions = Omit<Parameters<typeof createTestController>[0], 'view'> & {
  controller?: Partial<ControllerProps>;
};

/** Creates a bounded orthographic controller with elasticity enabled by default. */
function createRubberBandController({
  controller: controllerOptions,
  initialViewState,
  ...options
}: RubberBandControllerOptions = {}) {
  return createTestController({
    ...options,
    view: new OrthographicView({
      controller: {
        maxBounds: ORTHOGRAPHIC_MAX_BOUNDS,
        rubberBand: true,
        ...controllerOptions
      }
    }),
    initialViewState: {target: [100, 100, 0], zoom: 0, ...initialViewState}
  });
}

/** Replays a pointer or two-finger pan through deck.gl's normal gesture handlers. */
function panRubberBand(
  controller: ReturnType<typeof createTestController>,
  position: Parameters<typeof makeGestureEvent>[1] = {x: 200},
  gesture: 'pan' | 'multipan' = 'pan'
) {
  controller.handleEvent(makeGestureEvent(`${gesture}start`) as any);
  return controller.handleEvent(makeGestureEvent(`${gesture}move`, position) as any);
}

/** Replays a pinch zoom through deck.gl's normal gesture handlers. */
function pinchRubberBand(controller: ReturnType<typeof createTestController>, scale: number) {
  const makePinchEvent = (type: string, eventScale: number) => ({
    ...makeGestureEvent(type),
    scale: eventScale,
    rotation: 0,
    deltaTime: type === 'pinchstart' ? 0 : 16
  });
  controller.handleEvent(makePinchEvent('pinchstart', 1) as any);
  controller.handleEvent(makePinchEvent('pinchmove', scale) as any);
  return makePinchEvent('pinchend', scale);
}

/** Advances a spring-back deterministically on the controller's own timeline. */
function advanceRubberBandTransition(
  controller: ReturnType<typeof createTestController>,
  duration: number
) {
  const timeline: Timeline = controller.transitionManager.transition._timeline;
  timeline.setTime(timeline.getTime() + duration);
  controller.updateTransition();
}

/** Checks that both gesture and transition interaction flags are cleared. */
function expectRubberBandInteractionEnded(interactionStates: any[]) {
  expect(
    interactionStates[interactionStates.length - 1],
    'interaction state is cleared'
  ).toMatchObject({
    inTransition: false,
    isDragging: false,
    isPanning: false
  });
}

test('OrthographicState constrains and releases panning without gesture handlers', () => {
  for (const rubberBand of [false, true]) {
    const controller = createRubberBandController({controller: {rubberBand}});
    const panningState = controller.controllerState
      .panStart({pos: [50, 50]}, {mode: 'hard'})
      .pan({pos: [200, 50]}, {mode: rubberBand ? 'elastic' : 'hard'});
    const draggedTarget = panningState.getViewportProps().target;

    if (rubberBand) {
      expect(draggedTarget[0], 'the state permits resisted overscroll').toBeLessThan(50);
      expect(draggedTarget[0], 'the state resists raw pan displacement').toBeGreaterThan(-50);
    } else {
      expect(draggedTarget, 'the state keeps default bounds hard').toEqual([50, 100]);
    }

    const releasedProps = panningState.panEnd({mode: 'rebound'}).getViewportProps();
    expect(releasedProps.target, 'panEnd returns to the nearest valid edge').toEqual([50, 100]);
    expect(Object.getOwnPropertySymbols(releasedProps), 'state metadata stays private').toEqual([]);
    controller.finalize();
  }
});

test('OrthographicController keeps maxBounds hard by default', () => {
  for (const rubberBand of [undefined, false]) {
    const controller = createRubberBandController({controller: {rubberBand}});
    panRubberBand(controller);
    expect(controller.props.target, 'panning stops at the visible bounds').toEqual([50, 100]);
    controller.finalize();
  }
});

test.each([
  {description: 'maxZoom', scale: 4, expectedElasticZoom: 1.5, expectedSettledZoom: 1},
  {description: 'minZoom', scale: 0.25, expectedElasticZoom: -1.5, expectedSettledZoom: -1}
])(
  'OrthographicController rubber-bands $description during continuous zoom',
  ({scale, expectedElasticZoom, expectedSettledZoom}) => {
    const interactionStates: any[] = [];
    const controller = createRubberBandController({
      controller: {maxBounds: null},
      initialViewState: {zoom: 0, minZoomX: -1, minZoomY: -1, maxZoomX: 1, maxZoomY: 1},
      onStateChange: state => interactionStates.push({...state})
    });
    const endEvent = pinchRubberBand(controller, scale);

    expect(controller.props.zoomX, 'pinch zoom temporarily exceeds the limit').toBeCloseTo(
      expectedElasticZoom
    );
    controller.handleEvent(endEvent as any);

    const transition = controller.transitionManager.transition;
    expect(transition.inProgress, 'release starts a rebound transition').toBe(true);
    expect(transition.settings.duration, 'zoom rebound uses the short duration').toBe(300);
    advanceRubberBandTransition(controller, 300);
    expect(controller.props.zoomX, 'zoom settles at the configured limit').toBeCloseTo(
      expectedSettledZoom
    );
    expectRubberBandInteractionEnded(interactionStates);
    controller.finalize();
  }
);

test('OrthographicState keeps one-shot zoom hard with rubberBand enabled', () => {
  const controller = createRubberBandController({
    controller: {maxBounds: null},
    initialViewState: {zoom: 0, minZoomX: -1, minZoomY: -1, maxZoomX: 1, maxZoomY: 1}
  });
  const zoomedState = controller.controllerState.zoom({pos: [50, 50], scale: 4});
  expect(zoomedState.getViewportProps().zoomX, 'zoom without elastic context is clamped').toBe(1);
  controller.finalize();
});

test('OrthographicController hard-constrains programmatic transition endpoints', () => {
  const controller = createRubberBandController();
  controller.setProps({
    ...controller.props,
    target: [300, 100, 0],
    transitionDuration: 500
  });

  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'the programmatic transition starts').toBe(true);
  expect(transition.settings.duration, 'the programmatic duration is preserved').toBe(500);
  advanceRubberBandTransition(controller, 500);
  expect(controller.props.target, 'the transition ends at the hard-constrained edge').toEqual([
    150, 100, 0
  ]);
  controller.finalize();
});

test('OrthographicController keeps non-gesture bounds hard with rubber-banding enabled', () => {
  const controller = createRubberBandController({
    controller: {keyboard: {moveSpeed: 150}},
    initialViewState: {target: [-100, 100, 0]},
    onViewStateChange: ({viewState}) => ({...viewState, transitionDuration: 0})
  });
  expect(controller.props.target, 'programmatic view state is hard-clamped').toEqual([50, 100, 0]);
  controller.handleEvent({
    type: 'keydown',
    srcEvent: {code: 'ArrowRight', preventDefault() {}},
    stopPropagation() {}
  } as any);
  expect(controller.props.target[0], 'keyboard navigation is hard-clamped').toBe(50);
  controller.finalize();

  const disabledController = createRubberBandController({controller: {dragPan: false}});
  const handled = panRubberBand(disabledController);
  expect(handled, 'disabled panning ignores movement').toBe(false);
  expect(disabledController.props.target, 'disabled panning does not overscroll').toEqual([
    100, 100, 0
  ]);
  expect(
    disabledController.transitionManager.transition.inProgress,
    'disabled panning does not start a spring-back'
  ).toBe(false);
  disabledController.finalize();
});

test('OrthographicController rubber-bands a modifier-remapped pan action', () => {
  const interactionStates: any[] = [];
  const controller = createRubberBandController({
    controller: {dragMode: 'rotate'},
    onStateChange: state => interactionStates.push({...state})
  });
  const makeRemappedGesture = (type: string, x: number = 50) => ({
    ...makeGestureEvent(type, {x}),
    srcEvent: {shiftKey: true}
  });

  expect(controller.handleEvent(makeRemappedGesture('panstart') as any)).toBe(true);
  expect(controller.handleEvent(makeRemappedGesture('panmove', 200) as any)).toBe(true);
  expect(controller.props.target[0], 'the remapped action exceeds the edge').toBeLessThan(50);
  expect(controller.props.target[0], 'the remapped action is resisted').toBeGreaterThan(-50);
  expect(controller.handleEvent(makeRemappedGesture('panend', 200) as any)).toBe(true);

  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'the remapped action starts the controller rebound').toBe(true);
  expect(transition.settings.duration, 'the remapped action uses the short spring').toBe(300);
  expect(
    interactionStates[interactionStates.length - 1],
    'the remapped spring keeps semantic panning active'
  ).toMatchObject({inTransition: true, isDragging: false, isPanning: true});
  advanceRubberBandTransition(controller, 300);
  expect(controller.props.target, 'the remapped action settles at the edge').toEqual([50, 100]);
  expectRubberBandInteractionEnded(interactionStates);
  controller.finalize();
});

test('OrthographicController applies resistance beyond every edge', () => {
  for (const {x, y, axes} of [
    {x: 200, y: 50, axes: [0]},
    {x: -100, y: 50, axes: [0]},
    {x: 50, y: 200, axes: [1]},
    {x: 50, y: -100, axes: [1]},
    {x: 200, y: 200, axes: [0, 1]}
  ]) {
    const controller = createRubberBandController();
    panRubberBand(controller, {x, y});
    for (const axis of axes) {
      const displacement = Math.abs(controller.props.target[axis] - 100);
      expect(Number.isFinite(displacement), 'overscroll stays finite').toBe(true);
      expect(displacement, 'panning temporarily exceeds the visible bounds').toBeGreaterThan(50);
      expect(displacement, 'overscroll is smaller than the unresisted displacement').toBeLessThan(
        150
      );
    }
    controller.finalize();
  }
});

test.each([
  {
    description: 'numeric pixels',
    viewportSize: 100,
    padding: {left: 25, right: 25, top: 25, bottom: 25},
    expectedZoom: 1
  },
  {
    description: 'percentage expressions',
    viewportSize: 200,
    padding: {
      left: '10%',
      right: 'calc(20% - 10px)',
      top: '10%',
      bottom: 'calc(20% - 10px)'
    },
    expectedZoom: Math.log2(6),
    expectedTarget: 40 / 3
  },
  {
    description: 'negative remaining dimensions',
    viewportSize: 100,
    padding: {left: '60%', right: '60%', top: '60%', bottom: '60%'},
    expectedZoom: -10
  }
])(
  'OrthographicController resolves maxBoundsPadding from $description',
  ({viewportSize, padding, expectedZoom, expectedTarget = 12.5}) => {
    const boundsSize = 25;
    const controller = createRubberBandController({
      controller: {
        maxBounds: [
          [0, 0],
          [boundsSize, boundsSize]
        ],
        maxBoundsPadding: padding
      },
      initialViewState: {
        width: viewportSize,
        height: viewportSize,
        target: [boundsSize / 2, boundsSize / 2, 0],
        zoom: -10
      }
    });

    expect(controller.props.zoomX, 'horizontal fit uses the padded width').toBeCloseTo(
      expectedZoom
    );
    expect(controller.props.zoomY, 'vertical fit uses the padded height').toBeCloseTo(expectedZoom);
    expect(controller.props.target, 'fitted bounds use the padded rectangle').toEqual([
      expectedTarget,
      expectedTarget,
      0
    ]);
    controller.finalize();
  }
);

test.each([
  {
    description: 'zero remaining width',
    padding: {left: 50, right: 50},
    expectedTargetX: 25
  },
  {
    description: 'negative remaining width',
    padding: {left: 60, right: 60},
    expectedTargetX: 100
  }
])('OrthographicController handles $description', ({padding, expectedTargetX}) => {
  const controller = createRubberBandController({
    controller: {
      maxBounds: [
        [0, 0],
        [25, 25]
      ],
      maxBoundsPadding: padding
    },
    initialViewState: {
      width: 100,
      height: 100,
      target: [100, 12.5, 0],
      zoom: -10,
      zoomAxis: 'X'
    }
  });

  expect(controller.props.zoomX, 'non-positive width does not constrain zoom').toBe(-10);
  expect(controller.props.target[0], 'target constraint follows width sign').toBe(expectedTargetX);
  controller.finalize();
});

test('OrthographicController resolves percentage maxBoundsPadding after resize', () => {
  const controller = createRubberBandController({
    controller: {
      maxBounds: [
        [0, 0],
        [100, 100]
      ],
      maxBoundsPadding: {left: '25%', right: '25%', top: '25%', bottom: '25%'}
    },
    initialViewState: {width: 100, height: 100, target: [50, 50, 0], zoom: -10}
  });
  expect(controller.props.zoomX, 'padding initially resolves against 100 pixels').toBe(-1);

  controller.setProps({...controller.props, width: 200, height: 200});
  expect(controller.props.zoomX, 'padding is re-resolved against 200 pixels').toBe(0);

  controller.setProps({...controller.props, maxBoundsPadding: null});
  expect(controller.props.zoomX, 'changing only padding re-normalizes the fit').toBe(1);
  controller.finalize();
});

test('OrthographicController fits maxBounds around the projected target', () => {
  const controller = createTestController({
    view: new OrthographicView({
      // The semantic target projects to x=40 rather than the geometric center x=50.
      padding: {left: 10, right: 30},
      controller: {
        maxBounds: [
          [0, 0],
          [200, 200]
        ],
        maxBoundsPadding: {left: 20}
      }
    }),
    initialViewState: {width: 100, height: 100, target: [200, 100, 0], zoom: 0}
  });

  // The target box spans x=20..100, leaving 20px left and 60px right of
  // the projected target. The right edge therefore constrains target.x to 140.
  expect(controller.props.target, 'asymmetric padding uses the projected target anchor').toEqual([
    140, 100, 0
  ]);
  controller.finalize();
});

test.each(
  [
    {description: 'exact fit', width: 100, span: 25, zoom: 2, maxZoom: 6},
    {
      description: 'floating-point-inverted fit',
      width: 1024,
      span: 5,
      zoom: Math.log2(1024 / 5),
      maxZoom: 12
    },
    {description: 'content smaller than the viewport', width: 100, span: 25, zoom: 1, maxZoom: 1}
  ].flatMap(viewport =>
    [
      {direction: 'left', offsetX: viewport.width, offsetY: 0, axes: [0]},
      {direction: 'right', offsetX: -viewport.width, offsetY: 0, axes: [0]},
      {direction: 'top', offsetX: 0, offsetY: viewport.width, axes: [1]},
      {direction: 'bottom', offsetX: 0, offsetY: -viewport.width, axes: [1]},
      {direction: 'diagonal', offsetX: viewport.width, offsetY: viewport.width, axes: [0, 1]}
    ].map(direction => ({...viewport, ...direction}))
  )
)(
  'OrthographicController rubber-bands $description toward the $direction',
  ({width, span, zoom, maxZoom, offsetX, offsetY, axes}) => {
    const center = span / 2;
    const maxBounds: [[number, number], [number, number]] = [
      [0, 0],
      [span, span]
    ];
    const interactionStates: any[] = [];
    const controller = createRubberBandController({
      controller: {maxBounds, inertia: 900},
      initialViewState: {
        width,
        height: width,
        target: [center, center, 0],
        zoom,
        maxZoomX: maxZoom,
        maxZoomY: maxZoom
      },
      onStateChange: state => interactionStates.push({...state})
    });
    const startPosition = {x: width / 2, y: width / 2};
    const endPosition = {
      x: startPosition.x + offsetX,
      y: startPosition.y + offsetY
    };

    controller.handleEvent(makeGestureEvent('panstart', startPosition) as any);
    controller.handleEvent(makeGestureEvent('panmove', endPosition) as any);

    for (const axis of axes) {
      const displacement = Math.abs(controller.props.target[axis] - center);
      expect(displacement, 'a centered axis visibly overscrolls').toBeGreaterThan(0);
      expect(displacement, 'the overscroll is resisted').toBeLessThan(span);
    }

    controller.handleEvent(makeGestureEvent('panend', endPosition) as any);
    const transition = controller.transitionManager.transition;
    expect(transition.inProgress, 'release starts one spring-back transition').toBe(true);
    expect(transition.settings.duration, 'the spring is independent of fling inertia').toBe(300);

    advanceRubberBandTransition(controller, 300);
    expect(controller.props.target[0], 'the horizontal axis settles at its center').toBeCloseTo(
      center
    );
    expect(controller.props.target[1], 'the vertical axis settles at its center').toBeCloseTo(
      center
    );
    expect(transition.inProgress, 'the spring finishes').toBe(false);
    expectRubberBandInteractionEnded(interactionStates);
    controller.finalize();
  }
);

test.each([
  {
    description: 'the vertical bounds cannot fill the viewport',
    maxBounds: [
      [0, 10],
      [200, 11]
    ] as [[number, number], [number, number]],
    initialViewState: {target: [100, 10.5, 0], zoomAxis: 'X', maxZoomX: 6, maxZoomY: 2},
    position: {x: 200, y: 50},
    elasticAxis: 0,
    centeredAxis: 1
  },
  {
    description: 'the horizontal bounds cannot fill the viewport',
    maxBounds: [
      [10, 0],
      [11, 200]
    ] as [[number, number], [number, number]],
    initialViewState: {target: [10.5, 100, 0], zoomAxis: 'X', maxZoomX: 2, maxZoomY: 6},
    position: {x: 50, y: 200},
    elasticAxis: 1,
    centeredAxis: 0
  }
])('OrthographicController preserves rubber-band panning when $description', testCase => {
  const {maxBounds, initialViewState, position, elasticAxis, centeredAxis} = testCase;
  const interactionStates: any[] = [];
  const controller = createRubberBandController({
    controller: {maxBounds},
    initialViewState,
    onStateChange: state => interactionStates.push({...state})
  });
  expect(controller.props.target[centeredAxis], 'the non-fitting axis is centered').toBe(10.5);
  panRubberBand(controller, position);
  expect(controller.props.target[centeredAxis], 'panning keeps the other axis centered').toBe(10.5);
  expect(controller.props.target[elasticAxis], 'the fitting axis overshoots').toBeLessThan(50);
  expect(controller.props.target[elasticAxis], 'the overshoot is resisted').toBeGreaterThan(-50);
  controller.handleEvent(makeGestureEvent('panend', position) as any);
  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'the fitting axis starts a spring-back transition').toBe(true);
  advanceRubberBandTransition(controller, transition.settings.duration);
  expect(controller.props.target[elasticAxis], 'the fitting axis settles at its edge').toBe(50);
  expect(controller.props.target[centeredAxis], 'the non-fitting axis stays centered').toBe(10.5);
  expectRubberBandInteractionEnded(interactionStates);
  controller.finalize();
});

test('OrthographicController preserves inertia when only the horizontal axis fits', () => {
  const controller = createRubberBandController({
    controller: {
      inertia: 900,
      maxBounds: [
        [0, 10],
        [200, 11]
      ]
    },
    initialViewState: {
      target: [100, 10.5, 0],
      zoomAxis: 'X',
      maxZoomX: 6,
      maxZoomY: 2
    }
  });
  panRubberBand(controller, {x: 60});
  controller.handleEvent({
    ...makeGestureEvent('panend', {x: 60}),
    velocity: 0.05,
    velocityX: 0.05
  } as any);

  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'the in-bounds horizontal fling starts native inertia').toBe(true);
  expect(transition.settings.duration, 'the fling keeps its configured inertia').toBe(900);
  advanceRubberBandTransition(controller, 900);
  expect(controller.props.target[1], 'the non-fitting vertical axis remains centered').toBe(10.5);
  controller.finalize();
});

test('OrthographicController springs overscroll back within maxBounds', () => {
  for (const inertia of [undefined, false, true, 450, 900]) {
    const interactionStates: any[] = [];
    const controller = createRubberBandController({
      controller: {inertia},
      onStateChange: state => interactionStates.push({...state})
    });
    panRubberBand(controller);
    const draggedTarget = controller.props.target[0];
    controller.handleEvent(makeGestureEvent('panend', {x: 200}) as any);
    const transition = controller.transitionManager.transition;
    expect(transition.inProgress, 'release starts a spring-back transition').toBe(true);
    expect(transition.settings.duration, 'spring-back is independent of fling inertia').toBe(300);
    expect(
      interactionStates[interactionStates.length - 1],
      'the spring keeps semantic panning active after input ends'
    ).toMatchObject({inTransition: true, isDragging: false, isPanning: true});

    const initialDistance = Math.abs(draggedTarget - 50);
    let previousDistance = initialDistance;
    for (const elapsed of [75, 150, 225, 300]) {
      advanceRubberBandTransition(controller, 75);
      const distance = Math.abs(controller.props.target[0] - 50);
      expect(distance, 'the spring moves directly toward the edge').toBeLessThanOrEqual(
        previousDistance
      );
      expect(distance, 'the spring follows exponential ease-out').toBeCloseTo(
        elapsed === 300 ? 0 : initialDistance * 2 ** (-10 * (elapsed / 300))
      );
      previousDistance = distance;
    }

    expect(controller.props.target, 'spring-back finishes exactly at the edge').toEqual([50, 100]);
    expect(transition.inProgress, 'the transition finishes').toBe(false);
    expectRubberBandInteractionEnded(interactionStates);
    controller.finalize();
  }
});

test('OrthographicController lets inertia take precedence over rebound', () => {
  const controller = createRubberBandController({controller: {inertia: 900}});
  panRubberBand(controller);
  controller.handleEvent({
    ...makeGestureEvent('panend', {x: 200}),
    velocity: 1,
    velocityX: 1,
    velocityY: 0
  } as any);

  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'the release starts native inertia').toBe(true);
  expect(transition.settings.duration, 'inertia keeps its configured duration').toBe(900);
  controller.finalize();
});

test.each([
  {description: 'slow horizontal velocity', velocity: 0.05, velocityX: 0.05, velocityY: 0},
  {description: 'slow diagonal velocity', velocity: 0.22, velocityX: 0.22, velocityY: 0.22},
  {description: 'moderate horizontal velocity', velocity: 0.3, velocityX: 0.3, velocityY: 0},
  {description: 'fast horizontal velocity', velocity: 0.4, velocityX: 0.4, velocityY: 0}
])(
  'OrthographicController preserves native inertia for $description',
  ({velocity, velocityX, velocityY}) => {
    const controller = createRubberBandController({controller: {inertia: 900}});
    panRubberBand(controller, {x: 60});
    controller.handleEvent({
      ...makeGestureEvent('panend', {x: 60}),
      velocity,
      velocityX,
      velocityY
    } as any);

    const transition = controller.transitionManager.transition;
    expect(transition.inProgress, 'the in-bounds fling starts native inertia').toBe(true);
    expect(transition.settings.duration, 'the fling keeps its configured inertia').toBe(900);
    expect(
      transition.settings.interpolator,
      'in-bounds flings retain native linear interpolation'
    ).toBeInstanceOf(LinearInterpolator);
    advanceRubberBandTransition(controller, 900);
    expect(transition.inProgress, 'the native fling finishes').toBe(false);
    controller.finalize();
  }
);

test.each([
  ['pointer pan', 'pan'],
  ['multi-touch pan', 'multipan']
])('OrthographicController interrupts spring-back with a new %s', (_description, gesture) => {
  const interactionStates: any[] = [];
  const controller = createRubberBandController({
    controller: {multiTouchDrag: 'pan'},
    onStateChange: state => interactionStates.push({...state})
  });
  panRubberBand(controller);
  controller.handleEvent(makeGestureEvent('panend', {x: 200}) as any);
  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'release starts a spring-back transition').toBe(true);
  advanceRubberBandTransition(controller, transition.settings.duration / 4);
  const targetBeforeInterruption = controller.props.target.slice();
  expect(targetBeforeInterruption[0], 'the return remains overscrolled').toBeLessThan(50);
  controller.handleEvent(makeGestureEvent(`${gesture}start`) as any);
  expect(transition.inProgress, 'the new gesture interrupts the return').toBe(false);
  expect(
    controller.props.target,
    'the hard start context resolves the remaining overshoot'
  ).toEqual([50, 100]);
  expect(interactionStates[interactionStates.length - 1], 'the new drag is active').toMatchObject({
    inTransition: false,
    isDragging: true,
    isPanning: false
  });
  const position = {x: 60, deltaX: 10};
  controller.handleEvent(makeGestureEvent(`${gesture}move`, position) as any);
  controller.handleEvent(makeGestureEvent(`${gesture}end`, position) as any);
  if (transition.inProgress) {
    advanceRubberBandTransition(controller, transition.settings.duration);
  }
  expectRubberBandInteractionEnded(interactionStates);
  controller.finalize();
});

test('OrthographicController applies rubber-band resistance to multi-touch panning', () => {
  const controller = createRubberBandController({controller: {multiTouchDrag: 'pan'}});
  const position = {x: 200, deltaX: 150};
  panRubberBand(controller, position, 'multipan');
  expect(controller.props.target[0], 'multi-touch panning overshoots the edge').toBeLessThan(50);
  expect(controller.props.target[0], 'multi-touch overscroll is resisted').toBeGreaterThan(-50);
  expect(controller.handleEvent(makeGestureEvent('multipanend', position) as any)).toBe(true);

  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'multi-touch panEnd starts the controller rebound').toBe(true);
  expect(transition.settings.duration, 'multi-touch panEnd uses the short spring').toBe(300);
  advanceRubberBandTransition(controller, 300);
  expect(controller.props.target, 'multi-touch panEnd settles at the edge').toEqual([50, 100]);
  controller.finalize();
});

test('OrthographicController does not expose rubber-band interaction metadata', () => {
  const viewStates: Record<string, any>[] = [];
  const controller = createRubberBandController({
    onViewStateChange: ({viewState}) => {
      viewStates.push(viewState);
    }
  });
  panRubberBand(controller);
  controller.handleEvent(makeGestureEvent('panend', {x: 200}) as any);
  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'release starts a spring-back transition').toBe(true);
  advanceRubberBandTransition(controller, transition.settings.duration / 2);
  advanceRubberBandTransition(controller, transition.settings.duration / 2);
  expect(viewStates.length, 'drag and transition updates are emitted').toBeGreaterThan(3);
  for (const viewState of viewStates) {
    expect(Object.getOwnPropertySymbols(viewState), 'view state has no private symbols').toEqual(
      []
    );
    expect(Object.getOwnPropertySymbols(viewState.target), 'target has no private symbols').toEqual(
      []
    );
    expect(viewState, 'constraint policy is not public view state').not.toHaveProperty(
      'constraintContext'
    );
    expect(JSON.parse(JSON.stringify(viewState)).target, 'view state remains serializable').toEqual(
      viewState.target
    );
  }
  controller.finalize();
});

test('OrthographicController ignores rubberBand panning without maxBounds', () => {
  for (const rubberBand of [false, true]) {
    const controller = createRubberBandController({
      controller: {maxBounds: null, rubberBand}
    });
    panRubberBand(controller);
    expect(controller.props.target, 'unbounded panning is unchanged').toEqual([-50, 100]);
    controller.handleEvent(makeGestureEvent('panend', {x: 200}) as any);
    controller.setProps({...controller.props, target: [0, 100, 0], transitionDuration: 500});
    advanceRubberBandTransition(controller, 100);
    controller.handleEvent(makeGestureEvent('panstart') as any);
    expect(
      controller.transitionManager.transition.inProgress,
      'a stationary gesture does not change native transition interruption'
    ).toBe(true);
    controller.finalize();
  }
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

test('OrthographicController scroll zoom preserves the position under the pointer', () => {
  const view = new OrthographicView({controller: true});
  const controller = createTestController({
    view,
    initialViewState: {target: [0, 0, 0], zoom: 0, scrollZoom: true}
  });
  const pointer: [number, number] = [75, 50];
  const positionBefore = view
    .makeViewport({width: 100, height: 100, viewState: controller.props})!
    .unproject(pointer);

  controller.handleEvent({
    type: 'wheel',
    offsetCenter: {x: pointer[0], y: pointer[1]},
    delta: 100,
    srcEvent: {preventDefault() {}},
    stopPropagation() {}
  } as any);

  const positionAfter = view
    .makeViewport({width: 100, height: 100, viewState: controller.props})!
    .unproject(pointer);
  expect(positionAfter[0], 'pointer retains the same world X position').toBeCloseTo(
    positionBefore[0]
  );
  expect(positionAfter[1], 'pointer retains the same world Y position').toBeCloseTo(
    positionBefore[1]
  );
  expect(controller.props.target[0], 'off-center zoom updates target').not.toBe(0);
  controller.finalize();
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
