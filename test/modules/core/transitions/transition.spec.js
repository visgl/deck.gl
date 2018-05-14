import test from 'tape-catch';
import Transition, {TRANSITION_STATE} from '@deck.gl/core/transitions/transition';

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
    onStart: () => {
      onStartCallCount++;
    }
  });
  t.is(transition.state, TRANSITION_STATE.NONE, 'Transition has initial state');
  t.notOk(transition.inProgress, 'inProgress returns correct result');
  
  transition.start({customAttribute: 'custom value'});
  t.is(transition.state, TRANSITION_STATE.PENDING, 'Transition has started');
  t.ok(transition.inProgress, 'inProgress returns correct result');
  t.is(transition.customAttribute, 'custom value', 'Transition has customAttribute');
  t.is(onStartCallCount, 1, 'onStart is called once');

  t.end();
});

test('Transition#update', t => {
  let onUpdateCallCount = 0;
  let onEndCallCount = 0;

  const transition = new Transition({
    onUpdate: () => {
      onUpdateCallCount++;
    },
    onEnd: () => {
      onEndCallCount++;
    }
  });

  transition.update(0);
  t.is(transition.state, TRANSITION_STATE.NONE, 'Transition is not in progress');

  transition.start({
    duration: 1,
    easing: t => t * t
  });

  transition.update(0);
  t.is(transition.state, TRANSITION_STATE.IN_PROGRESS, 'Transition is in progress');
  t.ok(transition.inProgress, 'inProgress returns correct result');
  t.is(transition.time, 0, 'time is correct');

  transition.update(0.5);
  t.is(transition.state, TRANSITION_STATE.IN_PROGRESS, 'Transition is in progress');
  t.is(transition.time, 0.25, 'time is correct');

  transition.update(1.5);
  t.is(transition.state, TRANSITION_STATE.ENDED, 'Transition has ended');
  t.notOk(transition.inProgress, 'inProgress returns correct result');
  t.is(transition.time, 1, 'time is correct');

  transition.update(2);
  t.is(transition.state, TRANSITION_STATE.ENDED, 'Transition has ended');

  t.is(onUpdateCallCount, 3, 'onUpdate is called 3 times');
  t.is(onEndCallCount, 1, 'onEnd is called 3 times');

  t.end();
});

test('Transition#interrupt', t => {
  let onInterruptCallCount = 0;

  const transition = new Transition({
    onInterrupt: () => {
      onInterruptCallCount++;
    }
  });

  transition.start({duration: 1});
  transition.start({duration: 1});
  t.is(onInterruptCallCount, 1, 'starting another transition - onInterrupt is called');

  transition.update(0.5);
  transition.update(0.6);
  transition.cancel();
  t.is(onInterruptCallCount, 2, 'cancelling transition - onInterrupt is called');

  transition.start({duration: 1});
  transition.update(1);
  transition.update(2);
  transition.cancel();
  t.is(onInterruptCallCount, 2, 'cancelling after transition ends - onInterrupt is not called');

  t.end();
});
