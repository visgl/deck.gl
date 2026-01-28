// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-statements */
import {test, expect, describe} from 'vitest';
import {Timeline} from '@luma.gl/engine';
import UniformTransitionManager from '@deck.gl/core/lib/uniform-transition-manager';

test('UniformTransitionManager#add, remove, clear', () => {
  const timeline = new Timeline();
  const manager = new UniformTransitionManager(timeline);

  // invalid duration
  manager.add('A', 0, 1, false);
  expect(manager.active, 'no transitions added').toBeFalsy();
  manager.add('A', 0, 1, 1000);
  expect(manager.active, 'transition added').toBeTruthy();
  manager.add('B', 1, 2, 1000);
  expect(manager.active, 'another transition added').toBeTruthy();
  manager.remove('A');
  expect(manager.active, 'one transition left').toBeTruthy();
  manager.remove('B');
  expect(manager.active, 'all transitions removed').toBeFalsy();

  expect(() => manager.remove('B'), 'does not throw on removing non-existent key').not.toThrow();

  manager.add('A', 0, 1, 1000);
  manager.add('B', 1, 2, 1000);
  expect(manager.active, 'transitions added').toBeTruthy();
  manager.clear();
  expect(manager.active, 'all transitions removed').toBeFalsy();
});

test('UniformTransitionManager#interpolation#update', () => {
  const timeline = new Timeline();
  const manager1 = new UniformTransitionManager(timeline);
  const manager2 = new UniformTransitionManager(timeline);

  manager1.add('A', 0, 2, 1000);
  // Tests that calling `add` consecutively does not crash the transition
  manager1.add('A', 0, 1, 1000);

  timeline.setTime(0);
  let values = manager1.update();
  expect(values, 'returned values in transition').toEqual({A: 0});
  expect(manager1.active, 'manager1 has transitions').toBeTruthy();
  expect(manager2.active, 'manager2 does not have transitions').toBeFalsy();

  timeline.setTime(500);
  manager2.add('A', 1, 2, 500);
  manager2.add('B', [4, 4], [12, 12], {duration: 1000, easing: r => r * r});

  values = manager1.update();
  expect(values, 'returned values in transition').toEqual({A: 0.5});
  values = manager2.update();
  expect(values, 'returned values in transition').toEqual({A: 1, B: [4, 4]});

  timeline.setTime(1000);
  values = manager1.update();
  expect(values, 'returned values in transition').toEqual({A: 1});
  values = manager2.update();
  expect(values, 'returned values in transition').toEqual({A: 2, B: [6, 6]});

  expect(manager1.active, 'manager1 does not have transitions').toBeFalsy();
  expect(manager2.active, 'manager2 has transitions').toBeTruthy();

  timeline.setTime(1250);
  manager2.add('B', [12, 12], [8, 8], 1000);
  values = manager2.update();
  expect(values, 'interrupted transition should start from last value').toEqual({B: [6, 6]});
});

test('UniformTransitionManager#interpolation#callbacks', () => {
  const timeline = new Timeline();
  const manager = new UniformTransitionManager(timeline);

  let onStartCalled = 0;
  let onEndCalled = 0;
  let onInterruptCalled = 0;

  const settings = {
    duration: 1000,
    onStart: () => onStartCalled++,
    onEnd: () => onEndCalled++,
    onInterrupt: () => onInterruptCalled++
  };

  manager.add('A', 0, 1, settings);

  timeline.setTime(0);
  manager.update();
  expect(onStartCalled, 'onStart is called').toBe(1);

  timeline.setTime(100);
  manager.update();

  manager.add('A', 1, 2, settings);
  manager.update();
  expect(onInterruptCalled, 'onInterrupt is called').toBe(1);
  expect(onStartCalled, 'onStart is called').toBe(2);

  timeline.setTime(1100);
  manager.update();
  expect(onEndCalled, 'onEnd is called').toBe(1);
});

test('UniformTransitionManager#spring#update', () => {
  const timeline = new Timeline();
  const manager = new UniformTransitionManager(timeline);

  timeline.setTime(0);
  manager.add('A', 1, 3, {type: 'spring', stiffness: 0.5});
  // Tests that calling `add` consecutively does not crash the transition
  manager.add('A', 1, 2, {type: 'spring', stiffness: 0.5});
  manager.add('B', [4, 4], [12, 12], {type: 'spring', stiffness: 0.25, damping: 0.5});

  timeline.setTime(100);
  let values = manager.update();
  expect(values, 'returned values in transition').toEqual({A: 1.5, B: [6, 6]});

  timeline.setTime(200);
  values = manager.update();
  expect(values, 'returned values in transition').toEqual({A: 2, B: [8.5, 8.5]});

  timeline.setTime(300);
  values = manager.update();
  expect(values, 'returned values in transition').toEqual({A: 2.25, B: [10.625, 10.625]});
});

test('UniformTransitionManager#spring#callbacks', () => {
  const timeline = new Timeline();
  const manager = new UniformTransitionManager(timeline);

  let onStartCalled = 0;
  let onEndCalled = 0;
  let onInterruptCalled = 0;

  const settings = {
    type: 'spring',
    stiffness: 0.5,
    damping: 0.5,
    onStart: () => onStartCalled++,
    onEnd: () => onEndCalled++,
    onInterrupt: () => onInterruptCalled++
  };

  manager.add('A', 0, 1, settings);

  manager.update();
  expect(onStartCalled, 'onStart is called').toBe(1);

  manager.add('A', 1, 2, settings);
  expect(onInterruptCalled, 'onInterrupt is called').toBe(1);
  expect(onStartCalled, 'onStart is called').toBe(2);

  // TODO - use timeline
  for (let i = 0; i < 40; i++) {
    manager.update();
  }
  expect(onEndCalled, 'onEnd is called').toBe(1);
});
