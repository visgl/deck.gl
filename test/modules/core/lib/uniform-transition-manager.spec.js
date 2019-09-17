/* eslint-disable max-statements */
import test from 'tape-catch';
import {Timeline} from '@luma.gl/addons';
import UniformTransitionManager from '@deck.gl/core/lib/uniform-transition-manager';

test('UniformTransitionManager#add, remove, clear', t => {
  const timeline = new Timeline();
  const manager = new UniformTransitionManager(timeline);

  // invalid duration
  manager.add('A', 0, 1, false);
  t.notOk(manager.active, 'no transitions added');
  manager.add('A', 0, 1, 1000);
  t.ok(manager.active, 'transition added');
  manager.add('B', 1, 2, 1000);
  t.ok(manager.active, 'another transition added');
  manager.remove('A');
  t.ok(manager.active, 'one transition left');
  manager.remove('B');
  t.notOk(manager.active, 'all transitions removed');

  t.doesNotThrow(() => manager.remove('B'), 'does not throw on removing non-existent key');

  manager.add('A', 0, 1, 1000);
  manager.add('B', 1, 2, 1000);
  t.ok(manager.active, 'transitions added');
  manager.clear();
  t.notOk(manager.active, 'all transitions removed');

  t.end();
});

test('UniformTransitionManager#interpolation#update', t => {
  const timeline = new Timeline();
  const manager1 = new UniformTransitionManager(timeline);
  const manager2 = new UniformTransitionManager(timeline);

  manager1.add('A', 0, 1, 1000);

  timeline.setTime(0);
  let values = manager1.update();
  t.deepEquals(values, {A: 0}, 'returned values in transition');
  t.ok(manager1.active, 'manager1 has transitions');
  t.notOk(manager2.active, 'manager2 does not have transitions');

  timeline.setTime(500);
  manager2.add('A', 1, 2, 500);
  manager2.add('B', [4, 4], [12, 12], {duration: 1000, easing: r => r * r});

  values = manager1.update();
  t.deepEquals(values, {A: 0.5}, 'returned values in transition');
  values = manager2.update();
  t.deepEquals(values, {A: 1, B: [4, 4]}, 'returned values in transition');

  timeline.setTime(1000);
  values = manager1.update();
  t.deepEquals(values, {A: 1}, 'returned values in transition');
  values = manager2.update();
  t.deepEquals(values, {A: 2, B: [6, 6]}, 'returned values in transition');

  t.notOk(manager1.active, 'manager1 does not have transitions');
  t.ok(manager2.active, 'manager2 has transitions');

  timeline.setTime(1250);
  manager2.add('B', [12, 12], [8, 8], 1000);
  values = manager2.update();
  t.deepEquals(values, {B: [6, 6]}, 'interrupted transition should start from last value');

  t.end();
});

test('UniformTransitionManager#interpolation#callbacks', t => {
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
  t.is(onStartCalled, 1, 'onStart is called');

  timeline.setTime(100);
  manager.update();

  manager.add('A', 1, 2, settings);
  manager.update();
  t.is(onInterruptCalled, 1, 'onInterrupt is called');
  t.is(onStartCalled, 2, 'onStart is called');

  timeline.setTime(1100);
  manager.update();
  t.is(onEndCalled, 1, 'onEnd is called');

  t.end();
});

test('UniformTransitionManager#spring#update', t => {
  const timeline = new Timeline();
  const manager = new UniformTransitionManager(timeline);

  timeline.setTime(0);
  manager.add('A', 1, 2, {type: 'spring', stiffness: 0.5});
  manager.add('B', [4, 4], [12, 12], {type: 'spring', stiffness: 0.25, damping: 0.5});

  timeline.setTime(100);
  let values = manager.update();
  t.deepEquals(values, {A: 1.5, B: [6, 6]}, 'returned values in transition');

  timeline.setTime(200);
  values = manager.update();
  t.deepEquals(values, {A: 2, B: [8.5, 8.5]}, 'returned values in transition');

  timeline.setTime(300);
  values = manager.update();
  t.deepEquals(values, {A: 2.25, B: [10.625, 10.625]}, 'returned values in transition');

  t.end();
});

test('UniformTransitionManager#spring#callbacks', t => {
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
  t.is(onStartCalled, 1, 'onStart is called');

  manager.add('A', 1, 2, settings);
  t.is(onInterruptCalled, 1, 'onInterrupt is called');
  t.is(onStartCalled, 2, 'onStart is called');

  // TODO - use timeline
  for (let i = 0; i < 40; i++) {
    manager.update();
  }
  t.is(onEndCalled, 1, 'onEnd is called');

  t.end();
});
