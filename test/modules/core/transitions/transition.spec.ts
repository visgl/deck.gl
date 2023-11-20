import test from 'tape-promise/tape';
import Transition from '@deck.gl/core/transitions/transition';
import {Timeline} from '@luma.gl/engine';

test('Transition#constructor', t => {
  const transition = new Transition(new Timeline());
  t.ok(transition, 'Transition is constructed');
  t.ok(transition.settings, 'Transition settings is created');

  t.end();
});

test('Transition#start', t => {
  let onStartCallCount = 0;

  const transition = new Transition(new Timeline());
  transition.start({
    onStart: () => {
      onStartCallCount++;
    },
    customAttribute: 'custom value'
  });
  t.ok(transition.inProgress, 'Transition is in progress');
  t.is(
    transition.settings.customAttribute,
    'custom value',
    'Transition has customAttribute in settings'
  );
  t.is(onStartCallCount, 1, 'onStart is called once');

  t.end();
});

/* eslint-disable max-statements */
test('Transition#update', t => {
  let onUpdateCallCount = 0;
  let onEndCallCount = 0;
  const timeline = new Timeline();

  const transition = new Transition(timeline);

  transition.update();
  t.notOk(transition.inProgress, 'Transition is not in progress');

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
  t.notOk(transition._handle, 'No timeline handle yet');

  t.ok(transition.update(), 'transition updated');
  t.ok(transition._handle, 'Timeline handle is created');
  t.ok(transition.inProgress, 'Transition is in progress');
  t.is(transition.time, 0, 'time is correct');

  timeline.setTime(0.5);
  t.ok(transition.update(), 'transition updated');
  t.ok(transition.inProgress, 'Transition is in progress');
  t.is(transition.time, 0.5, 'time is correct');

  timeline.setTime(1.5);
  t.ok(transition.update(), 'transition updated');
  t.notOk(transition.inProgress, 'Transition has ended');
  t.notOk(transition._handle, 'Timeline handle is cleared');
  t.is(transition.time, 1, 'time is correct');

  timeline.setTime(2);
  t.notOk(transition.update(), 'transition is not updated');

  t.is(onUpdateCallCount, 3, 'onUpdate is called 3 times');
  t.is(onEndCallCount, 1, 'onEnd is called once');

  t.end();
});

test('Transition#interrupt', t => {
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

  t.is(onInterruptCallCount, 1, 'starting another transition - onInterrupt is called');

  timeline.setTime(0.5);
  transition.update();
  timeline.setTime(0.6);
  transition.update();
  transition.cancel();
  t.is(onInterruptCallCount, 2, 'cancelling transition - onInterrupt is called');

  transition.start(settings);
  timeline.setTime(1);
  transition.update();
  timeline.setTime(2);
  transition.update();
  transition.cancel();
  t.is(onInterruptCallCount, 2, 'cancelling after transition ends - onInterrupt is not called');

  t.end();
});
