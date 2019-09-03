import test from 'tape-catch';
import Transition from '@deck.gl/core/transitions/transition';
import {Timeline} from '@luma.gl/addons';

test('Transition#constructor', t => {
  let transition = new Transition();
  t.ok(transition, 'Transition is constructed without props');

  transition = new Transition({customAttribute: 'custom value'});
  t.ok(transition, 'Transition is constructed with props');
  t.is(transition.customAttribute, 'custom value', 'Transition has customAttribute');

  t.end();
});

test('Transition#start', t => {
  let onStartCallCount = 0;

  const transition = new Transition({
    timeline: new Timeline(),
    onStart: () => {
      onStartCallCount++;
    }
  });
  t.notOk(transition.inProgress, 'Transition is not in progress');

  transition.start({customAttribute: 'custom value'});
  t.ok(transition.inProgress, 'Transition is in progress');
  t.is(transition.customAttribute, 'custom value', 'Transition has customAttribute');
  t.is(onStartCallCount, 0, 'onStart is not called');

  transition.update();
  t.is(onStartCallCount, 1, 'onStart is called once');

  t.end();
});

/* eslint-disable max-statements */
test('Transition#update', t => {
  let onUpdateCallCount = 0;
  let onEndCallCount = 0;
  const timeline = new Timeline();

  const transition = new Transition({
    timeline,
    onUpdate: () => {
      onUpdateCallCount++;
    },
    onEnd: () => {
      onEndCallCount++;
    }
  });

  transition.update();
  t.notOk(transition.inProgress, 'Transition is not in progress');

  transition.start({
    duration: 1,
    easing: time => time * time
  });

  transition.update();
  t.ok(transition.inProgress, 'Transition is in progress');
  t.is(transition.time, 0, 'time is correct');

  timeline.setTime(0.5);
  transition.update();
  t.ok(transition.inProgress, 'Transition is in progress');
  t.is(transition.time, 0.25, 'time is correct');

  timeline.setTime(1.5);
  transition.update();
  t.notOk(transition.inProgress, 'Transition has ended');
  t.is(transition.time, 1, 'time is correct');

  timeline.setTime(2);
  transition.update();
  t.notOk(transition.inProgress, 'Transition has ended');

  t.is(onUpdateCallCount, 3, 'onUpdate is called 3 times');
  t.is(onEndCallCount, 1, 'onEnd is called 3 times');

  t.end();
});

test('Transition#interrupt', t => {
  let onInterruptCallCount = 0;
  const timeline = new Timeline();

  const transition = new Transition({
    timeline,
    onInterrupt: () => {
      onInterruptCallCount++;
    }
  });

  transition.start({duration: 1});
  transition.start({duration: 1});
  t.is(onInterruptCallCount, 1, 'starting another transition - onInterrupt is called');

  timeline.setTime(0.5);
  transition.update();
  timeline.setTime(0.6);
  transition.update();
  transition.cancel();
  t.is(onInterruptCallCount, 2, 'cancelling transition - onInterrupt is called');

  transition.start({duration: 1});
  timeline.setTime(1);
  transition.update();
  timeline.setTime(2);
  transition.update();
  transition.cancel();
  t.is(onInterruptCallCount, 2, 'cancelling after transition ends - onInterrupt is not called');

  t.end();
});
