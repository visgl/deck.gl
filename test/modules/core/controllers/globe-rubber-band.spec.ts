// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, expect, test, vi} from 'vitest';
import {type ControllerProps, _GlobeView as GlobeView, LinearInterpolator} from '@deck.gl/core';
import {zoomAdjust} from '../../../../modules/core/src/viewports/globe-viewport';
import {createTestController} from './test-controller';

const MAX_BOUNDS: [[number, number], [number, number]] = [
  [-10, -10],
  [10, 10]
];
const CENTER: [number, number] = [50, 50];

function createController({
  controller: controllerOptions,
  initialViewState,
  ...options
}: Omit<Parameters<typeof createTestController>[0], 'view'> & {
  controller?: Partial<ControllerProps>;
} = {}) {
  return createTestController({
    ...options,
    view: new GlobeView({controller: {rubberBand: true, ...controllerOptions}}),
    initialViewState: {longitude: 0, latitude: 0, zoom: 4, ...initialViewState}
  });
}

function gesture(type: string, x = 50, y = 50, overrides = {}) {
  return {
    type,
    pointerType: 'touch',
    offsetCenter: {x, y},
    deltaX: x - 50,
    deltaY: y - 50,
    velocity: 0,
    velocityX: 0,
    velocityY: 0,
    scale: 1,
    rotation: 0,
    deltaTime: 0,
    srcEvent: {preventDefault() {}},
    stopPropagation() {},
    ...overrides
  };
}

function advance(controller: ReturnType<typeof createController>, milliseconds: number) {
  const timeline = controller.transitionManager.transition._timeline;
  timeline.setTime(timeline.getTime() + milliseconds);
  controller.updateTransition();
}

afterEach(() => vi.restoreAllMocks());

test.each([
  {minBearing: -170, maxBearing: 170, direction: 1},
  {minBearing: -175, maxBearing: 175, direction: -1},
  {minBearing: -200, maxBearing: 150, direction: 1},
  {minBearing: -150, maxBearing: 200, direction: -1}
])('GlobeController rebounds to the crossed bearing limit %j', limits => {
  const {direction, minBearing, maxBearing} = limits;
  const boundary = direction > 0 ? maxBearing : minBearing;
  const controller = createController({
    controller: {dragMode: 'rotate'},
    initialViewState: {bearing: boundary, minBearing, maxBearing}
  });
  controller.handleEvent(gesture('panstart'));
  controller.handleEvent(gesture('panmove', 50 + direction * 100));
  const displayed = controller.props.bearing;
  expect((displayed - boundary) * direction).toBeGreaterThan(0);
  expect((displayed - boundary) * direction).toBeLessThan(15);
  controller.handleEvent(gesture('panend', 50 + direction * 100));
  advance(controller, 150);
  expect((controller.props.bearing - boundary) * direction).toBeGreaterThan(0);
  expect((displayed - controller.props.bearing) * direction).toBeGreaterThan(0);
  advance(controller, 150);
  expect(controller.props.bearing).toBe(boundary);
  controller.finalize();
});

test.each([
  {minBearing: -170, direction: 1},
  {maxBearing: 170, direction: -1}
])(
  'GlobeState leaves the unbounded side of a one-sided bearing limit free %j',
  ({direction, ...limits}) => {
    const controller = createController({initialViewState: limits});
    const rotated = controller.controllerState
      .rotateStart({pos: CENTER})
      .rotate({deltaAngleX: direction * 400}, {mode: 'elastic'});
    expect(rotated.getViewportProps().bearing).toBe(direction * 400);
    expect(rotated.rotateEnd({mode: 'rebound'}).getViewportProps().bearing).toBe(direction * 400);
    controller.finalize();
  }
);

test('GlobeState keeps bounded ball navigation on its configured bearing turn', () => {
  const controller = createController({
    controller: {navigation: 'ball'},
    initialViewState: {bearing: 185, minBearing: 170, maxBearing: 190}
  });
  const state = controller.controllerState;
  const panned = state.panStart({pos: CENTER}).pan({pos: CENTER}, {mode: 'elastic'});
  expect(panned.getViewportProps().bearing).toBeCloseTo(185, 8);
  const zoomed = state
    .zoomStart({pos: [55, 50]})
    .zoom({pos: [55, 50], scale: 1.05}, {mode: 'elastic'});
  expect(zoomed.getViewportProps().bearing).toBeGreaterThan(180);
  expect(zoomed.getViewportProps().bearing).toBeLessThan(190);
  controller.finalize();
});

test.each([-1, 1])('GlobeController bounded fling keeps its direction %s', direction => {
  let now = 0;
  vi.spyOn(Date, 'now').mockImplementation(() => now);
  const controller = createController({
    controller: {
      inertia: 900,
      maxBounds: [
        [-170, -80],
        [170, 80]
      ]
    },
    initialViewState: {longitude: direction * 150}
  });
  controller.handleEvent(gesture('panstart'));
  controller.handleEvent(gesture('panmove', 50 - direction * 5));
  now = 16;
  controller.handleEvent(gesture('panmove', 50 - direction * 50));
  const releasedLongitude = controller.props.longitude;
  controller.handleEvent(gesture('panend', 50 - direction * 50));
  for (let frame = 0; frame < 6; frame++) {
    advance(controller, 150);
    expect((controller.props.longitude - releasedLongitude) * direction).toBeGreaterThanOrEqual(0);
    expect(Math.abs(controller.props.longitude)).toBeLessThanOrEqual(170);
  }
  expect(Math.abs(controller.props.longitude)).toBeGreaterThan(160);
  controller.finalize();
});

test.each([
  {bearing: 0, minBearing: -30, maxBearing: 30},
  {bearing: 185, minBearing: 170, maxBearing: 190}
])('GlobeState keeps bearing resistance monotonic for $minBearing to $maxBearing', limits => {
  const controller = createController({initialViewState: limits});
  const started = controller.controllerState.rotateStart({pos: CENTER});
  let previousOvershoot = 0;
  for (const deltaAngleX of [60, 180, 360, 720]) {
    const state = started.rotate({deltaAngleX}, {mode: 'elastic'});
    const bearing = state.getViewportProps().bearing;
    const overshoot = bearing - limits.maxBearing;
    expect(overshoot).toBeGreaterThan(previousOvershoot);
    expect(overshoot).toBeLessThan(15);
    previousOvershoot = overshoot;
  }
  controller.finalize();
});

test('GlobeState leaves a full bearing revolution unrestricted', () => {
  const controller = createController({initialViewState: {minBearing: -180, maxBearing: 180}});
  const state = controller.controllerState
    .rotateStart({pos: CENTER})
    .rotate({deltaAngleX: 200}, {mode: 'elastic'});
  expect(state.getViewportProps().bearing).toBe(-160);
  controller.finalize();
});

test.each([{minBearing: -30}, {maxBearing: 30}])(
  'GlobeState supports one-sided bearing limits %j',
  limits => {
    const controller = createController({initialViewState: limits});
    const direction = 'minBearing' in limits ? -1 : 1;
    const state = controller.controllerState
      .rotateStart({pos: CENTER})
      .rotate({deltaAngleX: 90 * direction}, {mode: 'elastic'});
    expect(state.getViewportProps().bearing * direction).toBeGreaterThan(30);
    expect(state.rotateEnd({mode: 'rebound'}).getViewportProps().bearing).toBe(direction * 30);
    controller.finalize();
  }
);

test('GlobeController keeps pointer zoom working above the Mercator fallback threshold', () => {
  const controller = createController({initialViewState: {zoom: 13, maxZoom: 14}});
  const started = controller.controllerState.zoomStart({pos: CENTER});
  const elastic = started.zoom({pos: CENTER, scale: 4}, {mode: 'elastic'});
  expect(elastic.getViewportProps().zoom).toBeGreaterThan(14);
  expect(elastic.zoomEnd({mode: 'rebound'}).getViewportProps().zoom).toBe(14);
  controller.finalize();
});

test.each(['map', 'ball'] as const)(
  'GlobeState anchors elastic %s zoom at the displayed scale',
  navigation => {
    const controller = createController({
      controller: {navigation},
      initialViewState: {zoom: 1, maxZoom: 1}
    });
    const position: [number, number] = [70, 55];
    const anchor = controller.makeViewport(controller.props).unproject(position);
    const elastic = controller.controllerState
      .zoomStart({pos: position})
      .zoom({pos: position, scale: 2}, {mode: 'elastic'});
    const projected = controller.makeViewport(elastic.getViewportProps()).project(anchor);
    // Fixed-bearing navigation uses a geographic correction instead of rigid rotation.
    expect(Math.hypot(projected[0] - position[0], projected[1] - position[1])).toBeLessThan(0.1);
    if (navigation === 'map') expect(elastic.getViewportProps().bearing).toBe(0);
    controller.finalize();
  }
);

test('GlobeController keeps bounded longitude transitions inside the allowed interval', () => {
  const controller = createController({
    controller: {
      maxBounds: [
        [-170, -80],
        [170, 80]
      ]
    },
    initialViewState: {longitude: 160}
  });
  controller.setProps({...controller.props, longitude: -160, transitionDuration: 300});
  advance(controller, 150);
  expect(controller.props.longitude).toBeCloseTo(0, 8);
  advance(controller, 150);
  expect(controller.props.longitude).toBeCloseTo(-160, 8);
  controller.finalize();
});

test.each([0, 60])('GlobeController can tilt outward from pitch limit %s', pitch => {
  const controller = createController({
    controller: {dragMode: 'rotate'},
    initialViewState: {pitch}
  });
  const targetY = pitch ? 25 : 75;
  controller.handleEvent(gesture('panstart'));
  controller.handleEvent(gesture('panmove', 50, targetY));
  expect(pitch ? controller.props.pitch > 60 : controller.props.pitch < 0).toBe(true);
  controller.handleEvent(gesture('panend', 50, targetY));
  advance(controller, 300);
  expect(controller.props.pitch).toBe(pitch);
  controller.finalize();
});

test('GlobeController can interrupt a rebound with a new drag', () => {
  const controller = createController({controller: {maxBounds: MAX_BOUNDS}});
  controller.handleEvent(gesture('panstart'));
  controller.handleEvent(gesture('panmove', 700));
  controller.handleEvent(gesture('panend', 700));
  advance(controller, 75);
  controller.handleEvent(gesture('panstart'));
  expect(controller.transitionManager.transition.inProgress).toBe(false);
  controller.handleEvent(gesture('panmove', 40));
  controller.handleEvent(gesture('panend', 40));
  advance(controller, 300);
  expect(controller.props.longitude).toBeGreaterThanOrEqual(-10);
  expect(controller.props.longitude).toBeLessThanOrEqual(10);
  controller.finalize();
});

test.each([
  {pos: [700, 50], key: 'longitude'},
  {pos: [-600, 50], key: 'longitude'},
  {pos: [50, 700], key: 'latitude'},
  {pos: [50, -600], key: 'latitude'},
  {pos: [700, 700], key: 'latitude'}
])('GlobeState resists bounded pan at $pos', ({pos, key}) => {
  const controller = createController({controller: {maxBounds: MAX_BOUNDS}});
  const started = controller.controllerState.panStart({pos: CENTER});
  const hard = started.pan({pos}, {mode: 'hard'}).getViewportProps();
  const elastic = started.pan({pos}, {mode: 'elastic'});
  const displayed = elastic.getViewportProps();
  const raw = started.pan({pos}, {mode: 'preserve'}).getViewportProps();
  expect(Math.abs(displayed[key] - hard[key])).toBeGreaterThan(0);
  expect(Math.abs(displayed[key] - hard[key])).toBeLessThan(Math.abs(raw[key] - hard[key]));
  const settled = elastic.panEnd({mode: 'rebound'}).getViewportProps();
  const normalized = new controller.ControllerState({
    ...settled,
    makeViewport: controller.makeViewport
  }).getViewportProps();
  expect(settled.longitude).toBeCloseTo(normalized.longitude, 6);
  expect(settled.latitude).toBeCloseTo(normalized.latitude, 6);
  expect(Object.getOwnPropertySymbols(displayed)).toEqual([]);
  expect(displayed).not.toHaveProperty('constraintContext');
  controller.finalize();
});

test.each([0, 60, 85])('GlobeState rubber-bands zoom at latitude %s', latitude => {
  const zoomOffset = zoomAdjust(latitude, true) - zoomAdjust(0, true);
  const controller = createController({
    initialViewState: {latitude, zoom: 0.5 + zoomOffset, minZoom: 0, maxZoom: 1}
  });
  for (const scale of [4, 0.25]) {
    const started = controller.controllerState.zoomStart({pos: CENTER});
    const elastic = started.zoom({pos: CENTER, scale}, {mode: 'elastic'});
    const hard = started.zoom({pos: CENTER, scale}, {mode: 'hard'}).getViewportProps();
    const displayed = elastic.getViewportProps();
    expect(Math.abs(displayed.zoom - hard.zoom)).toBeGreaterThan(0);
    expect(Math.abs(displayed.zoom - hard.zoom)).toBeLessThan(1);
    const settled = elastic.zoomEnd({mode: 'rebound'}).getViewportProps();
    expect(settled.zoom).toBeCloseTo(hard.zoom, 6);
    expect(settled.latitude).toBeCloseTo(latitude, 6);
  }
  controller.finalize();
});

test.each([false, true])('GlobeState constrains rotation with rubberBand=%s', rubberBand => {
  const controller = createController({
    controller: {rubberBand},
    initialViewState: {minBearing: -30, maxBearing: 30, minPitch: 10, maxPitch: 50, pitch: 30}
  });
  const started = controller.controllerState.rotateStart({pos: CENTER});
  for (const direction of [-1, 1]) {
    const elastic = started.rotate(
      {deltaAngleX: direction * 90, deltaAngleY: direction * 80},
      {mode: 'elastic'}
    );
    const displayed = elastic.getViewportProps();
    const settled = elastic.rotateEnd({mode: 'rebound'}).getViewportProps();
    expect(settled.bearing).toBe(direction * 30);
    expect(settled.pitch).toBe(direction > 0 ? 50 : 10);
    if (rubberBand) {
      expect((displayed.bearing - settled.bearing) * direction).toBeGreaterThan(0);
      expect((displayed.pitch - settled.pitch) * direction).toBeGreaterThan(0);
      expect(Math.abs(displayed.pitch - settled.pitch)).toBeLessThan(15);
    } else {
      expect(displayed.bearing).toBe(settled.bearing);
      expect(displayed.pitch).toBe(settled.pitch);
    }
  }
  controller.finalize();
});

test('GlobeState leaves bearing free by default and supports south-crossing limits', () => {
  const controller = createController();
  const rotated = controller.controllerState
    .rotateStart({pos: CENTER})
    .rotate({deltaAngleX: 200}, {mode: 'elastic'});
  expect(rotated.getViewportProps().bearing).toBe(-160);
  expect(rotated.rotateEnd({mode: 'rebound'}).getViewportProps().bearing).toBe(-160);
  const State = controller.ControllerState;
  for (const [bearing, expected] of [
    [175, 175],
    [185, 185],
    [150, 170],
    [210, 190],
    [-175, 170]
  ]) {
    const state = new State({
      ...controller.props,
      bearing,
      minBearing: 170,
      maxBearing: 190,
      makeViewport: controller.makeViewport
    });
    expect(state.getViewportProps().bearing).toBe(expected);
  }
  controller.finalize();
});

test.each(['pan', 'multipan', 'trackpad'])('GlobeController rebounds after %s', input => {
  const states: any[] = [];
  const controller = createController({
    controller: {maxBounds: MAX_BOUNDS, multiTouchDrag: 'pan', trackpadGesture: true},
    onStateChange: state => states.push({...state})
  });
  const prefix = input === 'pan' ? 'pan' : 'multipan';
  const extra = {pointerType: input === 'trackpad' ? 'trackpad' : 'touch'};
  controller.handleEvent(gesture(`${prefix}start`, 50, 50, extra));
  controller.handleEvent(gesture(`${prefix}move`, 700, 50, extra));
  const displayedLongitude = controller.props.longitude;
  controller.handleEvent(gesture(`${prefix}end`, 700, 50, extra));
  const transition = controller.transitionManager.transition;
  expect(transition.inProgress).toBe(true);
  expect(transition.settings.duration).toBe(300);
  expect(controller.props.longitude).toBeCloseTo(displayedLongitude, 8);
  advance(controller, 75);
  expect(controller.props.longitude).toBeGreaterThan(displayedLongitude);
  advance(controller, 225);
  expect(controller.props.longitude).toBeGreaterThanOrEqual(-10);
  expect(states.at(-1)).toMatchObject({isDragging: false, isPanning: false, inTransition: false});
  controller.finalize();
});

test.each(['shift', 'right', 'dragMode', 'multipan', 'trackpad'])(
  'GlobeController rubber-bands bearing and tilt with %s',
  input => {
    const controller = createController({
      controller: {
        dragMode: input === 'dragMode' ? 'rotate' : 'pan',
        multiTouchDrag: 'rotate',
        trackpadGesture: true
      },
      initialViewState: {pitch: 30, minBearing: -30, maxBearing: 30}
    });
    const prefix = input === 'multipan' || input === 'trackpad' ? 'multipan' : 'pan';
    const extra = {
      srcEvent: {shiftKey: input === 'shift'},
      rightButton: input === 'right',
      pointerType: input === 'trackpad' ? 'trackpad' : 'touch'
    };
    controller.handleEvent(gesture(`${prefix}start`, 50, 50, extra));
    controller.handleEvent(gesture(`${prefix}move`, 100, -100, extra));
    const {pitch, bearing} = controller.props;
    expect(pitch).toBeGreaterThan(60);
    expect(pitch).toBeLessThan(75);
    expect(bearing).toBeGreaterThan(30);
    expect(bearing).toBeLessThan(45);
    controller.handleEvent(gesture(`${prefix}end`, 100, -100, extra));
    expect(controller.props.pitch).toBeCloseTo(pitch, 8);
    expect(controller.props.bearing).toBeCloseTo(bearing, 8);
    advance(controller, 300);
    expect(controller.props.pitch).toBe(60);
    expect(controller.props.bearing).toBe(30);
    expect(controller.transitionManager.transition.inProgress).toBe(false);
    controller.finalize();
  }
);

test('GlobeController combines elastic pinch zoom and bearing without double resistance', () => {
  const controller = createController({
    controller: {touchRotate: true},
    initialViewState: {zoom: 0.5, maxZoom: 1, minBearing: -30, maxBearing: 30}
  });
  controller.handleEvent(gesture('pinchstart'));
  controller.handleEvent(gesture('pinchmove', 50, 50, {scale: 4, rotation: -90, deltaTime: 16}));
  expect(controller.props.zoom).toBeCloseTo(1.6, 8);
  expect(controller.props.bearing).toBeCloseTo(42, 8);
  controller.handleEvent(gesture('pinchend', 50, 50, {scale: 4, rotation: -90, deltaTime: 32}));
  expect(controller.props.zoom).toBeCloseTo(1.6, 8);
  advance(controller, 150);
  expect(controller.props.zoom).toBeGreaterThan(1);
  expect(controller.props.bearing).toBeGreaterThan(30);
  advance(controller, 150);
  expect(controller.props.zoom).toBe(1);
  expect(controller.props.bearing).toBe(30);
  controller.finalize();
});

test.each([0.25, 4])('GlobeController rebounds double-click drag zoom at scale %s', scale => {
  const controller = createController({
    controller: {doubleClickDragZoom: true},
    initialViewState: {zoom: 0.5, maxZoom: 1}
  });
  controller.handleEvent(gesture('dblclickdragstart'));
  controller.handleEvent(gesture('dblclickdragmove', 50, 50, {scale}));
  const displayedZoom = controller.props.zoom;
  expect(scale > 1 ? displayedZoom > 1 : displayedZoom < 0).toBe(true);
  controller.handleEvent(gesture('dblclickdragend', 50, 50, {scale}));
  expect(controller.props.zoom).toBeCloseTo(displayedZoom, 8);
  advance(controller, 300);
  expect(controller.props.zoom).toBe(scale > 1 ? 1 : 0);
  controller.finalize();
});

test('GlobeController keeps programmatic transition endpoints bounded', () => {
  const controller = createController({
    initialViewState: {zoom: 0.5, maxZoom: 1, bearing: -150, minBearing: -160, maxBearing: 160}
  });
  controller.setProps({
    ...controller.props,
    zoom: 3,
    pitch: 100,
    bearing: 150,
    transitionDuration: 300
  });
  advance(controller, 150);
  expect(controller.props.bearing).toBeCloseTo(0, 8);
  expect(controller.props.pitch).toBeLessThan(60);
  advance(controller, 150);
  expect(controller.props).toMatchObject({zoom: 1, pitch: 60, bearing: 150});
  controller.finalize();
});

test('GlobeController keeps one-shot zoom and keyboard rotation hard', () => {
  for (const event of [
    gesture('wheel', 50, 50, {delta: 10000}),
    gesture('dblclick'),
    gesture('keydown', 50, 50, {srcEvent: {code: 'ArrowUp', shiftKey: true, preventDefault() {}}})
  ]) {
    const controller = createController({initialViewState: {zoom: 1, maxZoom: 1, pitch: 60}});
    controller.handleEvent(event);
    advance(controller, 300);
    expect(controller.props.zoom).toBeLessThanOrEqual(1);
    expect(controller.props.pitch).toBeLessThanOrEqual(60);
    controller.finalize();
  }
});

test('GlobeController constrained fling finishes inside bounds', () => {
  let now = 0;
  vi.spyOn(Date, 'now').mockImplementation(() => now);
  const controller = createController({controller: {maxBounds: MAX_BOUNDS, inertia: 900}});
  controller.handleEvent(gesture('panstart'));
  controller.handleEvent(gesture('panmove', 55));
  now = 16;
  controller.handleEvent(gesture('panmove', 60));
  controller.handleEvent(gesture('panend', 60, 50, {velocity: 1, velocityX: 1}));
  expect(controller.transitionManager.transition.settings.interpolator).toBeInstanceOf(
    LinearInterpolator
  );
  advance(controller, 900);
  const normalized = new controller.ControllerState({
    ...controller.props,
    makeViewport: controller.makeViewport
  }).getViewportProps();
  expect(controller.props.longitude).toBeCloseTo(normalized.longitude, 8);
  expect(controller.props.latitude).toBeCloseTo(normalized.latitude, 8);
  controller.finalize();
});
