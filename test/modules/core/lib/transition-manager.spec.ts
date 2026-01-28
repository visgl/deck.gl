// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import TransitionManager from '@deck.gl/core/controllers/transition-manager';
import {MapState} from '@deck.gl/core/controllers/map-controller';
import {Timeline} from '@luma.gl/engine';
import {config} from '@math.gl/core';
import {LinearInterpolator, FlyToInterpolator} from '@deck.gl/core';

/* global setTimeout, clearTimeout */
// backfill requestAnimationFrame on Node
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = callback => setTimeout(callback, 100);
  globalThis.cancelAnimationFrame = frameId => clearTimeout(frameId);
}

/* eslint-disable */
const TEST_CASES = [
  {
    title: 'No transition-able viewport change',
    initialProps: {
      width: 100,
      height: 100,
      longitude: -122.45,
      latitude: 37.78,
      zoom: 12,
      pitch: 0,
      bearing: 0,
      transitionInterpolator: new LinearInterpolator(),
      transitionDuration: 200
    },
    input: [
      // no change
      {
        width: 100,
        height: 100,
        longitude: -122.45,
        latitude: 37.78,
        zoom: 12,
        pitch: 0,
        bearing: 0,
        transitionInterpolator: new LinearInterpolator(),
        transitionDuration: 200
      },
      // no valid prop change
      {
        width: 200,
        height: 100,
        longitude: -122.45,
        latitude: 37.78,
        zoom: 12,
        pitch: 0,
        bearing: 0,
        transitionInterpolator: new LinearInterpolator(),
        transitionDuration: 'auto'
      },
      // transitionDuration is 0
      {width: 100, height: 100, longitude: -70.9, latitude: 41, zoom: 12, pitch: 60, bearing: 0},
      // transitionInterpolator is empty
      {
        width: 100,
        height: 100,
        longitude: -70.9,
        latitude: 41,
        zoom: 12,
        pitch: 60,
        bearing: 0,
        transitionDuration: 200,
        transitionInterpolator: null
      }
    ],
    expect: [false, false, false, false]
  },
  {
    title: 'Trigger viewport transition',
    initialProps: {
      width: 100,
      height: 100,
      longitude: -70.9,
      latitude: 41,
      zoom: 12,
      pitch: 60,
      bearing: 0,
      transitionInterpolator: new LinearInterpolator(),
      transitionDuration: 200
    },
    input: [
      // viewport change
      {
        width: 100,
        height: 100,
        longitude: -122.45,
        latitude: 37.78,
        zoom: 12,
        pitch: 0,
        bearing: 0,
        transitionInterpolator: new LinearInterpolator(),
        transitionDuration: 200
      },
      // viewport change interrupting transition
      {
        width: 100,
        height: 100,
        longitude: -122.45,
        latitude: 37.78,
        zoom: 12,
        pitch: 0,
        bearing: 0,
        transitionInterpolator: new LinearInterpolator(),
        transitionDuration: 200
      },
      // viewport change interrupting transition - 'auto'
      {
        width: 100,
        height: 100,
        longitude: -122.45,
        latitude: 37.78,
        zoom: 12,
        pitch: 0,
        bearing: 0,
        transitionInterpolator: new FlyToInterpolator({speed: 50}),
        transitionDuration: 'auto'
      }
    ],
    expect: [true, true, true]
  }
];

test('TransitionManager#constructor', () => {
  const transitionManager = new TransitionManager({
    getControllerState: props => new MapState(props)
  });
  expect(transitionManager, 'TransitionManager constructor does not throw errors').toBeTruthy();
  expect(transitionManager.onViewStateChange, 'TransitionManager has callback').toBeTruthy();
  expect(transitionManager.transition, 'TransitionManager has transition').toBeTruthy();
});

test('TransitionManager#processViewStateChange', () => {
  const timeline = new Timeline();

  TEST_CASES.forEach(testCase => {
    const transitionManager = new TransitionManager({
      timeline,
      getControllerState: props => new MapState(props)
    });
    transitionManager.processViewStateChange(testCase.initialProps);

    testCase.input.forEach((props, i) => {
      expect(transitionManager.processViewStateChange(props), testCase.title).toBe(
        testCase.expect[i]
      );
    });
  });
});

test('TransitionManager#callbacks', () => {
  const oldEpsilon = config.EPSILON;
  config.EPSILON = 1e-7;
  const timeline = new Timeline();
  const testCase = TEST_CASES[1];

  let startCount = 0;
  let interruptCount = 0;
  let endCount = 0;
  let updateCount = 0;
  let viewport;
  let transitionProps;

  const transitionInterpolator = new LinearInterpolator();

  const callbacks = {
    onTransitionStart: () => {
      viewport = {};
      startCount++;
    },
    onTransitionInterrupt: () => interruptCount++,
    onTransitionEnd: () => {
      config.EPSILON = 1e-7;
      expect(
        transitionInterpolator.arePropsEqual(viewport, transitionProps),
        'viewport matches end props'
      ).toBeTruthy();
      config.EPSILON = oldEpsilon;
      endCount++;
    }
  };

  const transitionManager = new TransitionManager({
    timeline,
    getControllerState: props => new MapState(props),
    onViewStateChange: ({viewState}) => {
      const newViewport = viewState;
      expect(
        !transitionInterpolator.arePropsEqual(viewport, newViewport),
        'viewport has changed'
      ).toBeTruthy();
      viewport = newViewport;
      // update props in transition, should not trigger interruption
      transitionManager.processViewStateChange(Object.assign({}, transitionProps, viewport));
      updateCount++;
    }
  });
  transitionManager.processViewStateChange(testCase.initialProps);

  testCase.input.forEach((props, i) => {
    transitionProps = {...callbacks, ...props};
    transitionManager.processViewStateChange(transitionProps);
  });

  timeline.setTime(200);
  transitionManager.updateTransition();
  timeline.setTime(400);
  transitionManager.updateTransition();
  timeline.setTime(600);
  transitionManager.updateTransition();
  timeline.setTime(800);
  transitionManager.updateTransition();

  expect(startCount, 'onTransitionStart() called twice').toBe(3);
  expect(interruptCount, 'onTransitionInterrupt() called once').toBe(2);
  expect(endCount, 'onTransitionEnd() called once').toBe(1);
  expect(updateCount, 'onViewStateChange() called').toBe(5);

  config.EPSILON = oldEpsilon;
});

test('TransitionManager#auto#duration', () => {
  const timeline = new Timeline();
  const initialProps = {
    width: 100,
    height: 100,
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12,
    pitch: 0,
    bearing: 0
  };
  const transitionManager = new TransitionManager({
    timeline,
    getControllerState: props => new MapState(props)
  });
  transitionManager.processViewStateChange(initialProps);
  transitionManager.processViewStateChange({
    width: 100,
    height: 100,
    longitude: -100.45, // changed
    latitude: 37.78,
    zoom: 12,
    pitch: 0,
    bearing: 0,
    transitionInterpolator: new FlyToInterpolator({speed: 50}),
    transitionDuration: 'auto'
  });
  expect(
    transitionManager.transition.inProgress && transitionManager.transition.settings.duration > 0,
    'should set duration when using "auto" mode' +
      ' ' +
      transitionManager.transition.settings.duration
  ).toBeTruthy();
});
