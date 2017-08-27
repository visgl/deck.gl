// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape-catch';
import spy from '../test-utils/spy';
import WheelInput from 'deck.gl/controllers/events/wheel-input';
import {createEventRegistrarMock} from './test-utils';

test('wheelInput#constructor', t => {
  const eventRegistrar = createEventRegistrarMock();
  let wheelInput = new WheelInput(eventRegistrar);
  t.ok(wheelInput, 'WheelInput created without optional params');

  const events = ['foo', 'bar'];
  const numWheelEvents = 3;   // WHEEL_EVENTS.length
  const addELSpy = spy(eventRegistrar, 'addEventListener');
  wheelInput = new WheelInput(eventRegistrar, () => {}, {events});
  t.equal(addELSpy.callCount, events.length + numWheelEvents,
    'should call addEventListener once for each passed event:handler pair');
  t.end();
});

test('wheelInput#destroy', t => {
  const eventRegistrar = createEventRegistrarMock();
  const events = ['foo', 'bar'];
  const numWheelEvents = 3;   // WHEEL_EVENTS.length
  const removeELSpy = spy(eventRegistrar, 'removeEventListener');
  const wheelInput = new WheelInput(eventRegistrar, () => {}, {events});
  wheelInput.destroy();
  t.equal(removeELSpy.callCount, events.length + numWheelEvents,
    'should call removeEventListener once for each passed event:handler pair');
  t.end();
});

test('moveInput#enableEventType', t => {
  const WHEEL_EVENT_TYPES = ['wheel'];	// wheel-input.EVENT_TYPE
  const wheelInput = new WheelInput(createEventRegistrarMock(), null, {enable: false});
  wheelInput.enableEventType('foo', true);
  t.notOk(wheelInput.options.enable, 'should not enable for unsupported event');

  t.ok(WHEEL_EVENT_TYPES.every(event => {
    wheelInput.options.enable = false;
    wheelInput.enableEventType(event, true);
    return wheelInput.options.enable;
  }), 'should enable for all supported events');
  t.end();
});

test('wheelInput#handleEvent', t => {
  const eventRegistrar = createEventRegistrarMock();
  const callbackSpy = spy();
  const wheelEventMock = {
    type: 'foo',
    preventDefault: () => {},
    deltaY: 1,
    clientX: 123,
    clientY: 456,
    target: eventRegistrar
  };
  const wheelInput = new WheelInput(eventRegistrar, callbackSpy, {enable: false});
  t.notOk(callbackSpy.called, 'callback should not be called when disabled');
  wheelInput.options.enable = true;
  wheelInput.handleEvent(wheelEventMock);

  t.ok(callbackSpy.called, 'callback should be called on wheel event when enabled...');
  // TODO fix spy
  // const EVENT_TYPE = 'wheel';  // wheel-input.EVENT_TYPE
  // t.deepEqual(callbackSpy.calls[0].arguments[0], {
  //   type: EVENT_TYPE,
  //   center: {
  //     x: wheelEventMock.clientX,
  //     y: wheelEventMock.clientY
  //   },
  //   delta: -wheelEventMock.deltaY,
  //   pointerType: 'mouse',
  //   srcEvent: wheelEventMock,
  //   target: eventRegistrar
  // }, '...and should be called with correct params');
  t.end();
});
