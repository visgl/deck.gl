// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  MapController,
  _GlobeController as GlobeController,
  WebMercatorViewport,
  LinearInterpolator,
  FlyToInterpolator
} from '@deck.gl/core';
import GlobeViewport from '@deck.gl/core/viewports/globe-viewport';

for (const ControllerClass of [MapController, GlobeController]) {
  const State = new ControllerClass({} as any).ControllerState;
  const ViewportClass = ControllerClass === MapController ? WebMercatorViewport : GlobeViewport;
  const props = {
    width: 800,
    height: 600,
    longitude: 8.5,
    latitude: 47.3,
    zoom: 6,
    bearing: 25,
    pitch: 35,
    makeViewport: (options: any) => new ViewportClass(options)
  };

  test(`${ControllerClass.name} preserves roll during camera updates`, () => {
    const state = new State({...props, roll: 28});
    const updates = [
      state
        .panStart({pos: [400, 300]})
        .pan({pos: [430, 315]})
        .panEnd(),
      state
        .zoomStart({pos: [400, 300]})
        .zoom({pos: [400, 300], scale: 2})
        .zoomEnd(),
      state.rotateLeft(),
      state.rotateUp(),
      state.zoomIn(),
      state.moveLeft()
    ];
    for (const updated of updates) {
      expect(updated.getViewportProps().roll).toBe(28);
    }
    expect(new State(props).getViewportProps().roll).toBe(0);
    expect(new State({...props, roll: 390}).getViewportProps().roll).toBe(30);
  });

  test(`${ControllerClass.name} transitions take the shortest roll path`, () => {
    for (const [from, to, middle] of [
      [170, -170, 180],
      [-170, 170, -180]
    ]) {
      const start = new State({...props, roll: from});
      const end = new State({...props, roll: to});
      for (const interpolator of [new LinearInterpolator(), new FlyToInterpolator()]) {
        const transition = interpolator.initializeProps(
          start.getViewportProps(),
          end.shortestPathFrom(start)
        );
        expect(interpolator.interpolateProps(transition.start, transition.end, 0.5).roll).toBe(
          middle
        );
      }
    }
  });
}

for (const interpolator of [new LinearInterpolator(), new FlyToInterpolator()]) {
  test(`${interpolator.constructor.name} compares and interpolates optional roll`, () => {
    const props = {
      width: 800,
      height: 600,
      longitude: 8.5,
      latitude: 47.3,
      zoom: 6,
      bearing: 25,
      pitch: 35,
      position: [0, 0, 0]
    };
    expect(interpolator.arePropsEqual(props, {...props})).toBe(true);
    expect(interpolator.arePropsEqual(props, {...props, roll: 0})).toBe(true);
    expect(interpolator.arePropsEqual(props, {...props, roll: 28})).toBe(false);
    const transition = interpolator.initializeProps(props, {...props, roll: 28});
    expect(interpolator.interpolateProps(transition.start, transition.end, 0.5).roll).toBe(14);
  });
}

test('GlobeController pans along the rolled screen axes', () => {
  const State = new GlobeController({} as any).ControllerState;
  const props = {
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 0,
    zoom: 3,
    bearing: 0,
    pitch: 0,
    makeViewport: (options: any) => new GlobeViewport(options)
  };
  const level = new State(props).panStart({pos: [400, 300]}).pan({pos: [400, 330]});
  const rolled = new State({...props, roll: 90}).panStart({pos: [400, 300]}).pan({pos: [430, 300]});
  expect(rolled.getViewportProps().longitude).toBeCloseTo(level.getViewportProps().longitude, 6);
  expect(rolled.getViewportProps().latitude).toBeCloseTo(level.getViewportProps().latitude, 6);
  expect(rolled.getViewportProps().roll).toBe(90);
});
