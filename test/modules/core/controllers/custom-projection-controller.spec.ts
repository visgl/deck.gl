// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {CustomProjectionView, WebMercatorViewport} from '@deck.gl/core';
import {CustomProjectionState} from '@deck.gl/core/controllers/custom-projection-controller';
import {MapState} from '@deck.gl/core/controllers/map-controller';

const view = new CustomProjectionView({
  projection: {forward: p => p.slice(), inverse: () => null},
  outputBounds: [0, 0, 512, 512]
});
const makeViewport = props => view.makeViewport({width: 800, height: 600, viewState: props})!;
const options = {width: 800, height: 600, makeViewport, maxBounds: null};

test('CustomProjectionState rotation matches MapState', () => {
  const custom = new CustomProjectionState({...options, rotationX: 40, rotationOrbit: 10});
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
      expect(actual.rotationX).toBeCloseTo(expected.pitch);
      expect(actual.rotationOrbit).toBeCloseTo(expected.bearing);
    }
  }
  for (const method of ['rotateUp', 'rotateDown', 'rotateLeft', 'rotateRight'] as const) {
    expect(custom[method]().getViewportProps().rotationX).toBe(
      map[method]().getViewportProps().pitch
    );
    expect(custom[method]().getViewportProps().rotationOrbit).toBe(
      map[method]().getViewportProps().bearing
    );
  }
  const started = custom.rotateStart({pos: [400, 300]});
  expect(started.rotate({deltaAngleX: 15, deltaAngleY: 5}).getViewportProps()).toMatchObject({
    rotationX: 45,
    rotationOrbit: 25
  });
  const ended = started.rotateEnd();
  expect(ended.rotate({pos: [400, 200]})).toBe(ended);
});

test('CustomProjectionState anchors pan and continuous zoom without an inverse projection', () => {
  const state = new CustomProjectionState({
    ...options,
    rotationX: 45,
    rotationOrbit: 25,
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
    expect(result.getViewportProps().target[2]).toBe(0);
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
    target: [1000, -1000, 100],
    rotationX: -20,
    rotationOrbit: 370,
    zoom: 10,
    maxZoom: 3
  });
  expect(state.getViewportProps()).toMatchObject({
    target: [1000, -1000, 0],
    rotationX: 0,
    rotationOrbit: 10,
    zoom: 3
  });
  const centered = new CustomProjectionState(options);
  expect(centered.moveLeft().getViewportProps().target[0]).toBeLessThan(256);
  expect(centered.moveRight().getViewportProps().target[0]).toBeGreaterThan(256);
  expect(centered.moveUp().getViewportProps().target[1]).toBeGreaterThan(256);
  expect(centered.moveDown().getViewportProps().target[1]).toBeLessThan(256);
  const bounded = new CustomProjectionState({
    ...options,
    target: [1000, 1000, 10],
    maxBounds: undefined
  });
  expect(bounded.getViewportProps().maxBounds).toEqual([
    [0, 0],
    [512, 512]
  ]);
  expect(bounded.getViewportProps().zoom).toBeCloseTo(Math.log2(800 / 512));
  expect(bounded.getViewportProps().target[0]).toBeCloseTo(256);
  expect(bounded.getViewportProps().target[2]).toBe(0);
  const from = new CustomProjectionState({...options, rotationOrbit: 170});
  const to = new CustomProjectionState({...options, rotationOrbit: -170});
  expect(to.shortestPathFrom(from).rotationOrbit).toBe(190);
});
