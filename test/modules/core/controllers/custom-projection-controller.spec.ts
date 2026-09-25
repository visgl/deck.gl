// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_CustomProjectionView as CustomProjectionView, WebMercatorViewport} from '@deck.gl/core';
import {CustomProjectionState} from '@deck.gl/core/controllers/custom-projection-controller';
import {MapState} from '@deck.gl/core/controllers/map-controller';
import testController, {createTestController} from './test-controller';
import {Proj4Projection} from '@math.gl/proj4';
import {lngLatToWorld, worldToLngLat, pixelsToWorld, worldToPixels} from '@math.gl/web-mercator';

const view = new CustomProjectionView({
  projection: {forward: p => p.slice(), inverse: p => p.slice()}
});
const makeViewport = props => view.makeViewport({width: 800, height: 600, viewState: props})!;
const options = {width: 800, height: 600, makeViewport};

test('CustomProjectionState projects world maxBounds without changing stored bounds', () => {
  const converter = new Proj4Projection({from: 'EPSG:4326', to: 'EPSG:3857'});
  const mapView = new CustomProjectionView({
    projection: {forward: converter.project, inverse: converter.unproject}
  });
  const maxBounds: [[number, number], [number, number]] = [
    [-120, 30],
    [-60, 60]
  ];
  const createViewport = props =>
    mapView.makeViewport({width: 800, height: 600, viewState: props})!;
  const state = new CustomProjectionState({
    ...options,
    makeViewport: createViewport,
    maxBounds,
    center: [-20, 0, 0],
    zoom: -5
  });
  const min = lngLatToWorld(maxBounds[0]);
  const max = lngLatToWorld(maxBounds[1]);
  const zoom = Math.max(Math.log2(800 / (max[0] - min[0])), Math.log2(600 / (max[1] - min[1])));
  const props = state.getViewportProps();
  expect(props.zoom).toBeCloseTo(zoom, 8);
  const expectedCenter = worldToLngLat([max[0] - 400 / 2 ** zoom, min[1] + 300 / 2 ** zoom]);
  expect(props.center[0]).toBeCloseTo(expectedCenter[0], 8);
  expect(props.center[1]).toBeCloseTo(expectedCenter[1], 8);
  expect(props.maxBounds).toEqual([
    [-120, 30],
    [-60, 60]
  ]);
  const updated = state.zoomIn().zoomOut().getViewportProps();
  expect(updated.maxBounds).toEqual(maxBounds);
  expect(updated.zoom).toBeCloseTo(zoom, 8);
  const rotated = new CustomProjectionState({
    ...props,
    pitch: 60,
    bearing: 45,
    makeViewport: createViewport
  });
  rotated
    .getViewportProps()
    .center.forEach((value, i) => expect(value).toBeCloseTo(props.center[i], 10));
});

test('CustomProjectionState bounds include curved edges and reversed projected axes', () => {
  const curvedView = new CustomProjectionView({
    projection: {
      forward: ([x, y, z = 0]) => [-x * 1000000, (y + 1 - x * x) * 1000000, z],
      inverse: ([x, y, z = 0]) => [-x / 1000000, y / 1000000 - 1 + (x / 1000000) ** 2, z]
    },
    getDistanceScale: () => [1, 1, 1]
  });
  const state = new CustomProjectionState({
    ...options,
    width: 100,
    height: 600,
    maxBounds: [
      [-1, 0],
      [1, 1]
    ],
    zoom: -5,
    center: [0, 10, 0],
    makeViewport: props => curvedView.makeViewport({width: 100, height: 600, viewState: props})!
  });
  const normalizationScale = 512 / 40075016.6855;
  // Corners only span one million units in Y; the top edge reaches two million.
  expect(state.getViewportProps().zoom).toBeCloseTo(
    Math.log2(600 / (2000000 * normalizationScale)),
    8
  );
  expect(state.getViewportProps().center[0]).toBeCloseTo(0, 8);
  expect(state.getViewportProps().center[1]).toBeCloseTo(0, 8);
});

class TestProjectionView extends CustomProjectionView {
  constructor(props = {}) {
    super({
      projection: {forward: p => p.slice(), inverse: p => p.slice()},
      ...props
    });
  }
}

for (const inertia of [false, true]) {
  test(`CustomProjectionController shared gesture suite, inertia=${inertia}`, async () => {
    await testController(TestProjectionView, {
      center: [0, 0, 0],
      zoom: 2,
      pitch: 30,
      bearing: -45,
      inertia
    });
  });
}

test('CustomProjectionController honors pointer and center zoom anchors', () => {
  for (const zoomAround of ['pointer', 'center'] as const) {
    const controller = createTestController({
      view: new TestProjectionView({controller: {zoomAround}}),
      initialViewState: {center: [0, 0, 0], zoom: 2, pitch: 30, bearing: 20}
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
        expect(controller.props.center[0]).toBeCloseTo(0);
        expect(controller.props.center[1]).toBeCloseTo(0);
      } else {
        expect(controller.props.center).not.toEqual([0, 0, 0]);
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
    makeViewport: () => ({pixelUnprojectionMatrix: new Array(16).fill(NaN)}) as any
  });
  expect(state.pan({pos: [1, 2], startPos: [3, 4]})).toBe(state);
  expect(state.zoom({pos: [1, 2], scale: 2})).toBe(state);
  expect(state.rotate({pos: [1, 2]})).toBe(state);
});

test('CustomProjectionController transitions pitch and bearing using the shortest path', () => {
  const from = new CustomProjectionState({...options, pitch: 20, bearing: 170});
  const to = new CustomProjectionState({...options, pitch: 60, bearing: -170});
  const controller = createTestController({
    view: new TestProjectionView({controller: true}),
    initialViewState: from.getViewportProps()
  });
  try {
    const {transitionInterpolator} = controller.transition;
    const {start, end} = transitionInterpolator.initializeProps(
      from.getViewportProps(),
      to.shortestPathFrom(from)
    );
    expect(transitionInterpolator.interpolateProps(start, end, 0.5)).toEqual({
      center: [0, 0, 0],
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

test('CustomProjectionState returns world centers while anchoring pan and continuous zoom', () => {
  const state = new CustomProjectionState({
    ...options,
    pitch: 45,
    bearing: 25,
    maxZoom: 1
  });
  const startPos: [number, number] = [300, 350];
  const pos: [number, number] = [450, 400];
  const anchor = pixelsToWorld(
    startPos,
    makeViewport(state.getViewportProps()).pixelUnprojectionMatrix,
    0
  );
  const panned = state.pan({startPos, pos});
  const zoomed = state.zoomStart({pos: startPos}).zoom({pos, scale: 4});
  for (const result of [panned, zoomed]) {
    const pixel = worldToPixels(
      [anchor[0], anchor[1], 0],
      makeViewport(result.getViewportProps()).pixelProjectionMatrix
    );
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

test('CustomProjectionState retains the world center when navigation cannot be inverted', () => {
  const invalidInverseView = new CustomProjectionView({
    projection: {forward: p => p.slice(), inverse: () => null}
  });
  const state = new CustomProjectionState({
    ...options,
    center: [10, 20, 0],
    makeViewport: props =>
      invalidInverseView.makeViewport({width: 800, height: 600, viewState: props})!
  });
  const startPos: [number, number] = [300, 350];
  const pos: [number, number] = [450, 400];
  expect(state.pan({startPos, pos}).getViewportProps().center).toEqual([10, 20, 0]);
  expect(state.zoom({pos, scale: 2}).getViewportProps().center).toEqual([10, 20, 0]);
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
  expect(centered.moveLeft().getViewportProps().center[0]).toBeLessThan(0);
  expect(centered.moveRight().getViewportProps().center[0]).toBeGreaterThan(0);
  expect(centered.moveUp().getViewportProps().center[1]).toBeGreaterThan(0);
  expect(centered.moveDown().getViewportProps().center[1]).toBeLessThan(0);
  const unbounded = new CustomProjectionState({
    ...options,
    center: [1000, 1000, 10],
    zoom: -2
  });
  expect(unbounded.getViewportProps()).toMatchObject({
    maxBounds: null,
    center: [1000, 1000, 0],
    zoom: -2
  });
  const bounded = new CustomProjectionState({
    ...options,
    center: [1000, 1000, 10],
    maxBounds: [
      [0, 0],
      [512, 512]
    ]
  });
  expect(bounded.getViewportProps().maxBounds).toEqual([
    [0, 0],
    [512, 512]
  ]);
  const normalizationScale = 512 / 40075016.6855;
  expect(bounded.getViewportProps().zoom).toBeCloseTo(Math.log2(800 / (512 * normalizationScale)));
  expect(bounded.getViewportProps().center[0]).toBeCloseTo(256, 6);
  expect(bounded.getViewportProps().center[2]).toBe(0);
  const from = new CustomProjectionState({...options, bearing: 170});
  const to = new CustomProjectionState({...options, bearing: -170});
  expect(to.shortestPathFrom(from).bearing).toBe(190);
});
