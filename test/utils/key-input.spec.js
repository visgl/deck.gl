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
import KeyInput from 'deck.gl/controllers/events/key-input';
import {createEventRegistrarMock} from './test-utils';

test('keyInput#constructor', t => {
  const eventRegistrar = createEventRegistrarMock();
  let keyInput = new KeyInput(eventRegistrar);
  t.ok(keyInput, 'KeyInput created without optional params');

  const events = ['foo', 'bar'];
  const numKeyEvents = 2;   // KEY_EVENTS.length
  const addELSpy = spy(eventRegistrar, 'addEventListener');
  keyInput = new KeyInput(eventRegistrar, () => {}, {events});
  t.equal(addELSpy.callCount, events.length + numKeyEvents,
    'should call addEventListener once for each passed event:handler pair');
  t.end();
});

test('keyInput#destroy', t => {
  const eventRegistrar = createEventRegistrarMock();
  const events = ['foo', 'bar'];
  const numKeyEvents = 2;   // KEY_EVENTS.length
  const removeELSpy = spy(eventRegistrar, 'removeEventListener');
  const keyInput = new KeyInput(eventRegistrar, () => {}, {events});
  keyInput.destroy();
  t.equal(removeELSpy.callCount, events.length + numKeyEvents,
    'should call removeEventListener once for each passed event:handler pair');
  t.end();
});

test('keyInput#enableEventType', t => {
  const eventRegistrar = createEventRegistrarMock();
  const keyDownMock = {
    type: 'keydown',
    key: 'a',
    target: eventRegistrar
  };
  const keyUpMock = {
    type: 'keyup',
    key: 'a',
    target: eventRegistrar
  };

  let callbackSpy = spy();
  let keyInput = new KeyInput(eventRegistrar, callbackSpy, {enable: true});

  keyInput.enableEventType('keydown', false);
  keyInput.handleEvent(keyDownMock);
  t.notOk(callbackSpy.called, 'callback should not be called when disabled');

  keyInput.enableEventType('keydown', true);
  keyInput.handleEvent(keyDownMock);
  t.ok(callbackSpy.called, 'callback should be called on key down when enabled...');

  callbackSpy = spy();
  keyInput = new KeyInput(eventRegistrar, callbackSpy, {enable: true});

  keyInput.enableEventType('keyup', false);
  keyInput.handleEvent(keyUpMock);
  t.notOk(callbackSpy.called, 'callback should not be called when disabled');

  keyInput.enableEventType('keyup', true);
  keyInput.handleEvent(keyUpMock);
  t.ok(callbackSpy.called, 'callback should be called on key up when enabled...');

  t.end();
});
