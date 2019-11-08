import test from 'tape-catch';
import {Controller} from '@deck.gl/core';

class MockEventManager {
  constructor() {
    this.listeners = new Set();
  }

  on(eventName) {
    this.listeners.add(eventName);
  }

  off(eventName) {
    this.listeners.delete(eventName);
  }

  has(eventName) {
    return this.listeners.has(eventName);
  }
}

class TestController extends Controller {
  constructor(props) {
    super({}, props);
    this.events = ['press', 'wheel'];
  }
}

test('Custom Controller', t => {
  const eventManager = new MockEventManager();

  const controller = new TestController({
    eventManager,
    scrollZoom: false
  });

  t.ok(controller, 'controller constructor does not throw');
  t.ok(eventManager.has('press'), 'custom event is registered');
  t.ok(!eventManager.has('wheel'), 'custom event should not override default ones');

  t.end();
});
