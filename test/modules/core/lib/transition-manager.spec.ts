import test from 'tape-promise/tape';
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

test('TransitionManager#constructor', t => {
  const transitionManager = new TransitionManager({
    getControllerState: props => new MapState(props)
  });
  t.ok(transitionManager, 'TransitionManager constructor does not throw errors');
  t.ok(transitionManager.onViewStateChange, 'TransitionManager has callback');
  t.ok(transitionManager.transition, 'TransitionManager has transition');
  t.end();
});

test('TransitionManager#processViewStateChange', t => {
  const timeline = new Timeline();

  TEST_CASES.forEach(testCase => {
    const transitionManager = new TransitionManager({
      timeline,
      getControllerState: props => new MapState(props)
    });
    transitionManager.processViewStateChange(testCase.initialProps);

    testCase.input.forEach((props, i) => {
      t.is(transitionManager.processViewStateChange(props), testCase.expect[i], testCase.title);
    });
  });

  t.end();
});

test('TransitionManager#callbacks', t => {
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
      t.ok(
        transitionInterpolator.arePropsEqual(viewport, transitionProps),
        'viewport matches end props'
      );
      config.EPSILON = oldEpsilon;
      endCount++;
    }
  };

  const transitionManager = new TransitionManager({
    timeline,
    getControllerState: props => new MapState(props),
    onViewStateChange: ({viewState}) => {
      const newViewport = viewState;
      t.ok(!transitionInterpolator.arePropsEqual(viewport, newViewport), 'viewport has changed');
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

  t.is(startCount, 3, 'onTransitionStart() called twice');
  t.is(interruptCount, 2, 'onTransitionInterrupt() called once');
  t.is(endCount, 1, 'onTransitionEnd() called once');
  t.is(updateCount, 5, 'onViewStateChange() called');

  config.EPSILON = oldEpsilon;
  t.end();
});

test('TransitionManager#auto#duration', t => {
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
  t.ok(
    transitionManager.transition.inProgress && transitionManager.transition.settings.duration > 0,
    'should set duration when using "auto" mode' +
      ' ' +
      transitionManager.transition.settings.duration
  );
  t.end();
});
