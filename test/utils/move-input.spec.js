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
import MoveInput from 'deck.gl/utils/events/move-input';
import {createEventRegistrarMock} from './test-utils';

test('moveInput#constructor', t => {
  const eventRegistrar = createEventRegistrarMock();
  let moveInput = new MoveInput(eventRegistrar);
  t.ok(moveInput, 'MoveInput created without optional params');

  const events = ['foo', 'bar'];
  const numMouseEvents = 3;   // MOUSE_EVENTS.length
  const addELSpy = spy(eventRegistrar, 'addEventListener');
  moveInput = new MoveInput(eventRegistrar, () => {}, {events});
  t.equal(addELSpy.callCount, events.length + numMouseEvents,
    'should call addEventListener once for each passed event:handler pair');
  t.end();
});

test('moveInput#destroy', t => {
  const eventRegistrar = createEventRegistrarMock();
  const events = ['foo', 'bar'];
  const numMouseEvents = 3;   // MOUSE_EVENTS.length
  const removeELSpy = spy(eventRegistrar, 'removeEventListener');
  const moveInput = new MoveInput(eventRegistrar, () => {}, {events});
  moveInput.destroy();
  t.equal(removeELSpy.callCount, events.length + numMouseEvents,
    'should call removeEventListener once for each passed event:handler pair');
  t.end();
});

test('moveInput#set', t => {
  const options = {
    foo: 1,
    bar: 'two',
    baz: () => {},
    qux: {}
  };
  const moveInput = new MoveInput(createEventRegistrarMock());
  moveInput.set(options);
  t.ok(Object.keys(options).every(k => moveInput.options[k] === options[k]),
    'should add all passed options onto internal options property');

  const newOptions = {
    foo: 2,
    bar: 'three'
  };
  moveInput.set(newOptions);
  t.ok(Object.keys(newOptions).every(k => moveInput.options[k] === newOptions[k]),
    'should merge all passed options onto internal options property');
  t.end();
});

test('moveInput#enableIfEventSupported', t => {
  const MOVE_EVENT_TYPES = ['mousemove', 'pointermove'];
  const moveInput = new MoveInput(createEventRegistrarMock(), null, {enable: false});
  moveInput.enableIfEventSupported('foo');
  t.notOk(moveInput.options.enable, 'should not enable for unsupported event');

  t.ok(MOVE_EVENT_TYPES.every(event => {
    moveInput.options.enable = false;
    moveInput.enableIfEventSupported(event);
    return moveInput.options.enable;
  }), 'should enable for all supported events');
  t.end();
});

test('moveInput#handleEvent', t => {
  const eventRegistrar = createEventRegistrarMock();
  const callbackSpy = spy();
  const mouseDownMock = {
    type: 'mousedown',
    button: 0,
    target: eventRegistrar
  };
  const mouseDragMock = {
    type: 'mousemove',
    which: 1,
    target: eventRegistrar
  };
  const mouseHoverMock = {
    type: 'mousemove',
    which: 0,
    target: eventRegistrar
  };
  const mouseUpMock = {
    type: 'mouseup',
    target: eventRegistrar
  };
  const moveInput = new MoveInput(eventRegistrar, callbackSpy, {enable: true});

  moveInput.handleEvent(mouseDownMock);
  t.notOk(callbackSpy.called, 'callback should not be called on mouse down');
  moveInput.handleEvent(mouseDragMock);
  t.notOk(callbackSpy.called, 'callback should not be called on mouse drag');
  moveInput.handleEvent(mouseUpMock);
  t.notOk(callbackSpy.called, 'callback should not be called on mouse up');

  moveInput.options.enable = false;
  moveInput.handleEvent(mouseHoverMock);
  t.notOk(callbackSpy.called, 'callback should not be called when disabled');

  moveInput.options.enable = true;
  moveInput.handleEvent(mouseHoverMock);
  t.ok(callbackSpy.called, 'callback should be called on mouse hover when enabled...');
  // TODO - fix spy
  // t.deepEqual(callbackSpy.calls[0].arguments[0], {
  //   type: mouseHoverMock.type,
  //   srcEvent: mouseHoverMock,
  //   pointerType: 'mouse',
  //   target: eventRegistrar
  // }, '...and should be called with correct params');
  t.end();
});
