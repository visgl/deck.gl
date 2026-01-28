// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import Transition from '@deck.gl/core/transitions/transition';
import {Timeline} from '@luma.gl/engine';

test('Transition#constructor', () => {
  const transition = new Transition(new Timeline());
  expect(transition, 'Transition is constructed').toBeTruthy();
  expect(transition.settings, 'Transition settings is created').toBeTruthy();
});

test('Transition#start', () => {
  let onStartCallCount = 0;

  const transition = new Transition(new Timeline());
  transition.start({
    onStart: () => {
      onStartCallCount++;
    },
    customAttribute: 'custom value'
  });
  expect(transition.inProgress, 'Transition is in progress').toBeTruthy();
  expect(transition.settings.customAttribute, 'Transition has customAttribute in settings').toBe(
    'custom value'
  );
  expect(onStartCallCount, 'onStart is called once').toBe(1);
});

/* eslint-disable max-statements */
test('Transition#update', () => {
  let onUpdateCallCount = 0;
  let onEndCallCount = 0;
  const timeline = new Timeline();

  const transition = new Transition(timeline);

  transition.update();
  expect(transition.inProgress, 'Transition is not in progress').toBeFalsy();

  transition.start({
    onUpdate: () => {
      onUpdateCallCount++;
    },
    onEnd: () => {
      onEndCallCount++;
    },
    duration: 1,
    easing: time => time * time
  });
  expect(transition._handle, 'No timeline handle yet').toBeFalsy();

  expect(transition.update(), 'transition updated').toBeTruthy();
  expect(transition._handle, 'Timeline handle is created').toBeTruthy();
  expect(transition.inProgress, 'Transition is in progress').toBeTruthy();
  expect(transition.time, 'time is correct').toBe(0);

  timeline.setTime(0.5);
  expect(transition.update(), 'transition updated').toBeTruthy();
  expect(transition.inProgress, 'Transition is in progress').toBeTruthy();
  expect(transition.time, 'time is correct').toBe(0.5);

  timeline.setTime(1.5);
  expect(transition.update(), 'transition updated').toBeTruthy();
  expect(transition.inProgress, 'Transition has ended').toBeFalsy();
  expect(transition._handle, 'Timeline handle is cleared').toBeFalsy();
  expect(transition.time, 'time is correct').toBe(1);

  timeline.setTime(2);
  expect(transition.update(), 'transition is not updated').toBeFalsy();

  expect(onUpdateCallCount, 'onUpdate is called 3 times').toBe(3);
  expect(onEndCallCount, 'onEnd is called once').toBe(1);
});

test('Transition#interrupt', () => {
  let onInterruptCallCount = 0;
  const timeline = new Timeline();

  const transition = new Transition(timeline);
  const settings = {
    onInterrupt: () => {
      onInterruptCallCount++;
    },
    duration: 1
  };
  transition.start(settings);
  transition.start(settings);

  expect(onInterruptCallCount, 'starting another transition - onInterrupt is called').toBe(1);

  timeline.setTime(0.5);
  transition.update();
  timeline.setTime(0.6);
  transition.update();
  transition.cancel();
  expect(onInterruptCallCount, 'cancelling transition - onInterrupt is called').toBe(2);

  transition.start(settings);
  timeline.setTime(1);
  transition.update();
  timeline.setTime(2);
  transition.update();
  transition.cancel();
  expect(onInterruptCallCount, 'cancelling after transition ends - onInterrupt is not called').toBe(
    2
  );
});
