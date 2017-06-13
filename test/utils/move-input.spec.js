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
import MoveInput from 'deck.gl/utils/events/move-input';
import {createEventRegistrarMock} from './test-utils';

test('moveInput#constructor', t => {
  const eventRegistrar = createEventRegistrarMock();
  let moveInput = new MoveInput(eventRegistrar);
  t.ok(moveInput, 'MoveInput created without optional params');

  const events = ['foo', 'bar'];
  const addELSpy = spy(eventRegistrar, 'addEventListener');
  moveInput = new MoveInput(eventRegistrar, () => {}, {events});
  t.equal(addELSpy.callCount, events.length,
    'should call addEventListener once for each passed event:handler pair');
  t.end();
});

test('moveInput#destroy', t => {
  const eventRegistrar = createEventRegistrarMock();
  const events = ['foo', 'bar'];
  const removeELSpy = spy(eventRegistrar, 'removeEventListener');
  const moveInput = new MoveInput(eventRegistrar, () => {}, {events});
  moveInput.destroy();
  t.equal(removeELSpy.callCount, events.length,
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

test('moveInput#handleEvent', t => {
  t.pass('TODO: moveInput#handleEvent');
  // TODO TUES:
  // finish this test,
  // write similar tests for wheel-input,
  // push and check off "unit tests" subtask,
  // move on to city-lens,
  // also keep trying to fix flow/ava/monochrome.
  t.end();
});
