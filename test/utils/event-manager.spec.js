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
import spy from 'spy';
import EventManager from 'deck.gl/utils/events/event-manager';
import {createEventRegistrarMock} from './test-utils';

test('eventManager#constructor', t => {
  const eventRegistrar = createEventRegistrarMock();
  let eventManager = new EventManager(eventRegistrar);
  const onSpy = spy();
  const origOn = EventManager.prototype.on;
  EventManager.prototype.on = onSpy;

  t.ok(eventManager, 'EventManager created');
  t.ok(eventManager.wheelInput, 'WheelInput created');
  t.ok(eventManager.moveInput, 'MoveInput created');
  t.notOk(onSpy.called, 'on() not called if options.events not passed');

  eventManager = new EventManager(eventRegistrar, {
    events: {foo: () => {}}
  });
  t.ok(onSpy.called, 'on() is called if options.events is passed');
  EventManager.prototype.on = origOn;
  t.end();
});

test('eventManager#destroy', t => {
  const eventManager = new EventManager(createEventRegistrarMock());
  spy(eventManager.manager, 'destroy');
  spy(eventManager.moveInput, 'destroy');
  spy(eventManager.wheelInput, 'destroy');
  eventManager.destroy();

  t.equal(eventManager.manager.destroy.callCount, 1,
    'Manager.destroy() should be called once');
  t.equal(eventManager.moveInput.destroy.callCount, 1,
    'MoveInput.destroy() should be called once');
  t.equal(eventManager.wheelInput.destroy.callCount, 1,
    'WheelInput.destroy() should be called once');
  t.end();
});

test('eventManager#on', t => {
  const eventManager = new EventManager(createEventRegistrarMock());
  const addEHSpy = spy(eventManager, '_addEventHandler');

  eventManager.on('foo', () => {});
  t.equal(addEHSpy.callCount, 1,
    '_addEventHandler should be called once when passing a single event and handler');

  addEHSpy.reset();
  eventManager.on({
    bar: () => {},
    baz: () => {}
  });
  t.equal(addEHSpy.callCount, 2,
    '_addEventHandler should be called once for each entry in an event:handler map');
  t.end();
});

test('eventManager#off', t => {
  const eventManager = new EventManager(createEventRegistrarMock());
  const removeEHSpy = spy(eventManager, '_removeEventHandler');

  eventManager.off('foo', () => {});
  t.equal(removeEHSpy.callCount, 1,
    '_removeEventHandler should be called once when passing a single event and handler');

  removeEHSpy.reset();
  eventManager.off({
    bar: () => {},
    baz: () => {}
  });
  t.equal(removeEHSpy.callCount, 2,
    '_removeEventHandler should be called once for each entry in an event:handler map');
  t.end();
});

test('eventManager#eventHandling', t => {
  const eventRegistrar = createEventRegistrarMock();
  const eventMock = {type: 'foo'};
  const eventManager = new EventManager(eventRegistrar);
  const emitSpy = spy(eventManager.manager, 'emit');

  eventManager._onOtherEvent(eventMock);
  t.ok(emitSpy.called, 'manager.emit() should be called from _onOtherEvent()...');
  t.ok(emitSpy.calledWith(eventMock.type, eventMock),
    '...and should be called with correct params');

  emitSpy.reset();
  const aliasedHandler = eventManager._aliasEventHandler('alias');
  aliasedHandler(eventMock);
  t.ok(emitSpy.called, 'manager.emit() should be called from aliased handler...');
  t.ok(emitSpy.calledWith('alias', eventMock), '...and should be called with correct params');
  t.end();
});
