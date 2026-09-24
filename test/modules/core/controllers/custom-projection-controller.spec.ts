// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_CustomProjectionView as CustomProjectionView, WebMercatorViewport} from '@deck.gl/core';
import {CustomProjectionState} from '@deck.gl/core/controllers/custom-projection-controller';
import {MapState} from '@deck.gl/core/controllers/map-controller';
import testController, {createTestController} from './test-controller';

const view = new CustomProjectionView({
  projection: {forward: p => p.slice(), inverse: () => null},
  outputBounds: [0, 0, 512, 512]
});
const makeViewport = props => view.makeViewport({width: 800, height: 600, viewState: props})!;
const options = {width: 800, height: 600, makeViewport, maxBounds: null};

class TestProjectionView extends CustomProjectionView {
  constructor(props = {}) {
    super({
      projection: {forward: p => p.slice(), inverse: p => p.slice()},
      outputBounds: [0, 0, 512, 512],
      ...props
    });
  }
}

for (const inertia of [false, true]) {
  test(`CustomProjectionController shared gesture suite, inertia=${inertia}`, async () => {
    await testController(TestProjectionView, {
      center: [256, 256, 0],
      zoom: 2,
      pitch: 30,
      bearing: -45,
      maxBounds: null,
      inertia
    });
  });
}

test('CustomProjectionController honors pointer and center zoom anchors', () => {
  for (const zoomAround of ['pointer', 'center'] as const) {
    const controller = createTestController({
      view: new TestProjectionView({controller: {zoomAround, maxBounds: null}}),
      initialViewState: {center: [256, 256, 0], zoom: 2, pitch: 30, bearing: 20}
    });
    try {
      controller.handleEvent({
        type: 'wheel',
        pointerType: 'mouse',
        offsetCenter: {x: 75, y: 25},
        delta: -10,
        srcEvent: {preventDefault() {}},
        stopPropagation() {}
      } as any);
      expect(controller.props.zoom).toBeLessThan(2);
      if (zoomAround === 'center') {
        expect(controller.props.center[0]).toBeCloseTo(256);
        expect(controller.props.center[1]).toBeCloseTo(256);
      } else {
        expect(controller.props.center).not.toEqual([256, 256, 0]);
      }
    } finally {
      controller.finalize();
    }
  }
});

test('CustomProjectionState applies both zoom limits, rotation wrapping and padded bounds', () => {
  const state = new CustomProjectionState({...options, zoom: 0, minZoom: -1, maxZoom: 1});
  expect(state.zoomIn(8).getViewportProps().zoom).toBe(1);
  expect(state.zoomOut(8).getViewportProps().zoom).toBe(-1);
  expect(state.zoomIn().zoomOut().getViewportProps().zoom).toBe(0);
  const from = new CustomProjectionState({...options, bearing: -170});
  const to = new CustomProjectionState({...options, bearing: 170});
  expect(to.shortestPathFrom(from).bearing).toBe(-190);
  expect(to.shortestPathFrom(to).bearing).toBe(170);
  const bounds = {
    maxBounds: [
      [0, 0],
      [512, 512]
    ] as [[number, number], [number, number]]
  };
  const fitted = new CustomProjectionState({...options, ...bounds});
  const padded = new CustomProjectionState({
    ...options,
    ...bounds,
    maxBoundsPadding: {left: 100, right: 100}
  });
  expect(padded.getViewportProps().zoom).toBeLessThan(fitted.getViewportProps().zoom);
  const unconstrained = new CustomProjectionState({
    ...options,
    ...bounds,
    center: [1000, 1000, 0],
    maxBoundsPadding: {left: 1000, top: 1000}
  });
  expect(unconstrained.getViewportProps().center).toEqual([1000, 1000, 0]);
  const constrained = new CustomProjectionState({
    ...options,
    pitch: 100,
    minPitch: -20,
    maxPitch: 100
  });
  expect(constrained.getViewportProps().pitch).toBe(85);
});

test('CustomProjectionState ignores unprojectable gesture anchors', () => {
  const state = new CustomProjectionState({
    ...options,
    makeViewport: () => ({unproject: () => [NaN, NaN]}) as any
  });
  expect(state.pan({pos: [1, 2], startPos: [3, 4]})).toBe(state);
  expect(state.zoom({pos: [1, 2], scale: 2})).toBe(state);
  expect(state.rotate({pos: [1, 2]})).toBe(state);
});

test('CustomProjectionController transitions pitch and bearing using the shortest path', () => {
  const from = new CustomProjectionState({...options, pitch: 20, bearing: 170});
  const to = new CustomProjectionState({...options, pitch: 60, bearing: -170});
  const controller = createTestController({
    view: new TestProjectionView({controller: {maxBounds: null}}),
    initialViewState: from.getViewportProps()
  });
  try {
    const {transitionInterpolator} = controller.transition;
    const {start, end} = transitionInterpolator.initializeProps(
      from.getViewportProps(),
      to.shortestPathFrom(from)
    );
    expect(transitionInterpolator.interpolateProps(start, end, 0.5)).toEqual({
      center: [256, 256, 0],
      zoom: 0,
      pitch: 40,
      bearing: 180
    });
  } finally {
    controller.finalize();
  }
});

test('CustomProjectionState honors minPitch and maxPitch', () => {
  const state = new CustomProjectionState({
    ...options,
    pitch: 40,
    minPitch: 20,
    maxPitch: 60
  });
  expect(state.rotateUp(100).getViewportProps().pitch).toBe(60);
  expect(state.rotateDown(100).getViewportProps().pitch).toBe(20);
});

test('CustomProjectionState rotation matches MapState', () => {
  const custom = new CustomProjectionState({...options, pitch: 40, bearing: 10});
  const map = new MapState({
    ...options,
    makeViewport: props => new WebMercatorViewport(props),
    longitude: 0,
    latitude: 0,
    zoom: 0,
    pitch: 40,
    bearing: 10,
    minPitch: 0,
    maxPitch: 85,
    normalize: false
  });
  for (const startY of [0, 3, 200, 300, 597, 600]) {
    for (const dy of [-700, -100, 0, 100, 700]) {
      const start = {pos: [400, startY] as [number, number]};
      const end = {pos: [500, startY + dy] as [number, number]};
      const actual = custom.rotateStart(start).rotate(end).getViewportProps();
      const expected = map.rotateStart(start).rotate(end).getViewportProps();
      expect(actual.pitch).toBeCloseTo(expected.pitch);
      expect(actual.bearing).toBeCloseTo(expected.bearing);
    }
  }
  for (const method of ['rotateUp', 'rotateDown', 'rotateLeft', 'rotateRight'] as const) {
    expect(custom[method]().getViewportProps().pitch).toBe(map[method]().getViewportProps().pitch);
    expect(custom[method]().getViewportProps().bearing).toBe(
      map[method]().getViewportProps().bearing
    );
  }
  const started = custom.rotateStart({pos: [400, 300]});
  expect(started.rotate({deltaAngleX: 15, deltaAngleY: 5}).getViewportProps()).toMatchObject({
    pitch: 45,
    bearing: 25
  });
  const ended = started.rotateEnd();
  expect(ended.rotate({pos: [400, 200]})).toBe(ended);
});

test('CustomProjectionState anchors pan and continuous zoom without an inverse projection', () => {
  const state = new CustomProjectionState({
    ...options,
    pitch: 45,
    bearing: 25,
    maxZoom: 1
  });
  const startPos: [number, number] = [300, 350];
  const pos: [number, number] = [450, 400];
  const anchor = makeViewport(state.getViewportProps()).unproject(startPos, {targetZ: 0});
  const panned = state.pan({startPos, pos});
  const zoomed = state.zoomStart({pos: startPos}).zoom({pos, scale: 4});
  for (const result of [panned, zoomed]) {
    const pixel = makeViewport(result.getViewportProps()).project(anchor);
    expect(pixel[0]).toBeCloseTo(pos[0]);
    expect(pixel[1]).toBeCloseTo(pos[1]);
    expect(result.getViewportProps().center[2]).toBe(0);
  }
  expect(zoomed.getViewportProps().zoom).toBe(1);
  const ended = zoomed.zoomEnd();
  expect(ended.getState().startZoomPosition).toBeUndefined();
  const panEnded = panned.panEnd();
  expect(panEnded.pan({pos})).toBe(panEnded);
});

test('CustomProjectionState constraints and keyboard navigation use a fixed ground plane', () => {
  const state = new CustomProjectionState({
    ...options,
    center: [1000, -1000, 100],
    pitch: -20,
    bearing: 370,
    zoom: 10,
    maxZoom: 3
  });
  expect(state.getViewportProps()).toMatchObject({
    center: [1000, -1000, 0],
    pitch: 0,
    bearing: 10,
    zoom: 3
  });
  const centered = new CustomProjectionState(options);
  expect(centered.moveLeft().getViewportProps().center[0]).toBeLessThan(256);
  expect(centered.moveRight().getViewportProps().center[0]).toBeGreaterThan(256);
  expect(centered.moveUp().getViewportProps().center[1]).toBeGreaterThan(256);
  expect(centered.moveDown().getViewportProps().center[1]).toBeLessThan(256);
  const bounded = new CustomProjectionState({
    ...options,
    center: [1000, 1000, 10],
    maxBounds: undefined
  });
  expect(bounded.getViewportProps().maxBounds).toEqual([
    [0, 0],
    [512, 512]
  ]);
  expect(bounded.getViewportProps().zoom).toBeCloseTo(Math.log2(800 / 512));
  expect(bounded.getViewportProps().center[0]).toBeCloseTo(256);
  expect(bounded.getViewportProps().center[2]).toBe(0);
  const from = new CustomProjectionState({...options, bearing: 170});
  const to = new CustomProjectionState({...options, bearing: -170});
  expect(to.shortestPathFrom(from).bearing).toBe(190);
});
