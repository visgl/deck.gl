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
  const eventManager = new EventManager(createEventRegistrarMock());
  t.ok(eventManager, 'EventManager created');
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
