// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Controller} from '@deck.gl/core';
import ViewState from '@deck.gl/core/controllers/view-state';

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
    super(props);
    this.ControllerState = ViewState;
    this.events = ['press', 'wheel'];
  }
}

test('Custom Controller', () => {
  const eventManager = new MockEventManager();

  const controller = new TestController({
    eventManager
  });
  controller.setProps({
    scrollZoom: false
  });

  expect(controller, 'controller constructor does not throw').toBeTruthy();
  expect(eventManager.has('press'), 'custom event is registered').toBeTruthy();
  expect(!eventManager.has('wheel'), 'custom event should not override default ones').toBeTruthy();
});
