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

/* eslint-disable dot-notation, max-statements, no-unused-vars */
import Attribute from '@deck.gl/core/lib/attribute';
import GL from 'luma.gl/constants';
import {Buffer} from 'luma.gl';
import test from 'tape-catch';
import {gl} from '@deck.gl/test-utils';

test('Attribute#imports', t => {
  t.equals(typeof Attribute, 'function', 'Attribute import successful');
  t.end();
});

test('Attribute#constructor', t => {
  const attribute = new Attribute(gl, {size: 1, accessor: 'a'});

  t.ok(attribute, 'Attribute construction successful');
  t.is(typeof attribute.getBuffer, 'function', 'Attribute.getBuffer function available');
  t.ok(attribute.allocate, 'Attribute.allocate function available');
  t.ok(attribute.update, 'Attribute._updateBuffer function available');
  t.ok(attribute.setExternalBuffer, 'Attribute._setExternalBuffer function available');
  t.end();
});

test('Attribute#getUpdateTriggers', t => {
  const update = () => {};

  let attribute = new Attribute(gl, {id: 'indices', isIndexed: true, size: 1, update});
  t.deepEqual(attribute.getUpdateTriggers(), ['indices'], 'returns correct update triggers');

  attribute = new Attribute(gl, {id: 'instanceSizes', size: 1, accessor: 'getSize', update});
  t.deepEqual(
    attribute.getUpdateTriggers(),
    ['instanceSizes', 'getSize'],
    'returns correct update triggers'
  );

  attribute = new Attribute(gl, {
    id: 'instancePositions',
    size: 1,
    accessor: ['getPosition', 'getElevation'],
    update
  });
  t.deepEqual(
    attribute.getUpdateTriggers(),
    ['instancePositions', 'getPosition', 'getElevation'],
    'returns correct update triggers'
  );

  t.end();
});

// t.ok(attribute.allocate(attributeName, allocCount), 'Attribute.allocate function available');
// t.ok(attribute._setExternalBuffer(attributeName, buffer, numInstances), 'Attribute._setExternalBuffer function available');
// t.ok(attribute._analyzeBuffer(attributeName, numInstances), 'Attribute._analyzeBuffer function available');
// t.ok(attribute._updateBuffer({attributeName, numInstances, data, props, context}), 'Attribute._updateBuffer function available');
// t.ok(attribute._updateBufferViaStandardAccessor(data, props), 'Attribute._updateBufferViaStandardAccessor function available');
// t.ok(attribute._validateAttributeDefinition(attributeName), 'Attribute._validateAttributeDefinition function available');
// t.ok(attribute._checkAttributeArray(attributeName, 'Attribute._checkAttributeArray function available');
