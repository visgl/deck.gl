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
import AttributeManager from '@deck.gl/core/lib/attribute/attribute-manager';
import GL from '@luma.gl/constants';
import test from 'tape-catch';
import {gl} from '@deck.gl/test-utils';

function update(attribute, {data}) {
  const {value, size} = attribute;
  let i = 0;
  for (const object of data) {
    for (let n = 0; n < size; ++n) {
      value[i + n] = i + n;
    }
    i += size;
  }
}

function enable() {
  return this.enabled; // eslint-disable-line
}

const fixture = {
  positions: new Float32Array([0, 1, 0, -1, -1, 0, 1, -1, 0])
};

test('AttributeManager imports', t => {
  t.equals(typeof AttributeManager, 'function', 'AttributeManager import successful');
  t.end();
});

test('AttributeManager constructor', t => {
  const attributeManager = new AttributeManager(gl);

  t.ok(attributeManager, 'AttributeManager construction successful');
  t.end();
});

test('AttributeManager.add', t => {
  const attributeManager = new AttributeManager(gl);

  // Now autodeduced from shader declarations
  // t.throws(
  //   () => attributeManager.add({positions: {update}}),
  //   'AttributeManager.add - throws on missing attribute size'
  // );

  t.throws(
    () => attributeManager.add({positions: {size: 2}}),
    'AttributeManager.add - throws on missing attribute update'
  );

  attributeManager.add({positions: {size: 2, accessor: 'getPosition', update}});
  t.ok(
    attributeManager.getAttributes()['positions'],
    'AttributeManager.add - add attribute successful'
  );
  t.deepEquals(
    attributeManager.updateTriggers,
    {positions: ['positions'], getPosition: ['positions']},
    'AttributeManager.add - build update triggers mapping'
  );
  t.end();
});

test('AttributeManager.update', t => {
  const attributeManager = new AttributeManager(gl);
  attributeManager.add({positions: {size: 2, update}});

  let attribute;

  // First update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attribute = attributeManager.getAttributes()['positions'];
  t.ok(ArrayBuffer.isView(attribute.value), 'attribute has typed array');
  t.equals(attribute.value[1], 1, 'attribute value is correct');

  // Second update without invalidation, should not update
  attribute.value[1] = 2;

  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attribute = attributeManager.getAttributes()['positions'];
  t.ok(ArrayBuffer.isView(attribute.value), 'attribute has typed array');
  t.equals(attribute.value[1], 2, 'Second update, attribute value was not changed');

  // Third update, with invalidation, should update
  attributeManager.invalidateAll();
  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attribute = attributeManager.getAttributes()['positions'];
  t.ok(ArrayBuffer.isView(attribute.value), 'attribute has typed array');
  t.equals(attribute.value[1], 1, 'Third update, attribute value was updated');

  t.end();
});

test('AttributeManager.update - 0 numInstances', t => {
  const attributeManager = new AttributeManager(gl);
  attributeManager.add({positions: {size: 2, update}});

  // First update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 0,
    data: []
  });

  const attribute = attributeManager.getAttributes()['positions'];
  t.ok(ArrayBuffer.isView(attribute.value), 'attribute has typed array');

  t.end();
});

test('AttributeManager.update - external virtual buffers', t => {
  const attributeManager = new AttributeManager(gl);

  const dummyUpdate = () => t.fail('updater should not be called when external buffer is present');

  attributeManager.add({
    positions: {size: 2, update: dummyUpdate},
    colors: {size: 3, type: GL.UNSIGNED_BYTE, update: dummyUpdate}
  });

  // First update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 1,
    buffers: {
      positions: new Float32Array([0, 0]),
      colors: new Uint8ClampedArray([0, 0, 0])
    }
  });

  let attribute = attributeManager.getAttributes()['positions'];
  t.ok(ArrayBuffer.isView(attribute.value), 'positions attribute has typed array');
  attribute = attributeManager.getAttributes()['colors'];
  t.ok(ArrayBuffer.isView(attribute.value), 'colors attribute has typed array');

  const colors = attribute.getShaderAttributes().colors;

  attributeManager.update({
    numInstances: 1,
    buffers: {
      positions: new Float32Array([0, 0]),
      colors: new Float32Array([0, 0, 0])
    }
  });

  t.is(colors.getAccessor().type, gl.FLOAT, 'colors accessor is set to correct type');

  attributeManager.update({
    numInstances: 1,
    buffers: {
      positions: new Float32Array([0, 0]),
      colors: new Uint32Array([0, 0, 0])
    }
  });
  t.is(colors.getAccessor().type, gl.UNSIGNED_INT, 'colors accessor is set to correct type');

  t.end();
});

test('AttributeManager.update - external logical buffers', t => {
  const attributeManager = new AttributeManager(gl);

  const dummyAccessor = () =>
    t.fail('accessor should not be called when external buffer is present');

  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'},
    colors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', defaultValue: [0, 0, 0, 255]},
    types: {size: 1, accessor: 'getType', transform: x => x - 65}
  });

  // First update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 2,
    data: {length: 2},
    props: {
      getPosition: dummyAccessor,
      getColor: dummyAccessor,
      getType: dummyAccessor
    },
    buffers: {
      getPosition: new Float32Array([1, 1, 2, 2]),
      getColor: {value: new Uint8ClampedArray([255, 0, 0, 0, 255, 0]), size: 3},
      getType: new Uint8Array([65, 68])
    }
  });

  let attribute = attributeManager.getAttributes()['positions'];
  t.deepEqual(attribute.value, [1, 1, 2, 2], 'positions attribute has value');

  attribute = attributeManager.getAttributes()['colors'];
  t.deepEqual(attribute.value, [255, 0, 0, 0, 255, 0], 'colors attribute has value');
  t.is(attribute.getAccessor().size, 3, 'colors attribute has correct size');

  attribute = attributeManager.getAttributes()['types'];
  t.deepEqual(attribute.value.slice(0, 2), [0, 3], 'types attribute has value');

  t.end();
});

test('AttributeManager.update - external logical buffers - variable width', t => {
  const attributeManager = new AttributeManager(gl);

  const dummyAccessor = () =>
    t.fail('accessor should not be called when external buffer is present');

  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'},
    colors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', defaultValue: [0, 0, 0, 255]}
  });

  // First update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 3,
    startIndices: [0, 2],
    data: {
      length: 2,
      vertexStarts: [0, 1]
    },
    props: {
      getPosition: dummyAccessor,
      getColor: dummyAccessor
    },
    buffers: {
      getPosition: new Float32Array([1, 1, 2, 2]),
      getColor: {value: new Uint8ClampedArray([255, 0, 0, 0, 255, 0]), size: 3}
    }
  });

  let attribute = attributeManager.getAttributes()['positions'];
  t.deepEqual(attribute.value.slice(0, 6), [1, 1, 1, 1, 2, 2], 'positions attribute has value');

  attribute = attributeManager.getAttributes()['colors'];
  t.deepEqual(
    attribute.value.slice(0, 12),
    [255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255],
    'colors attribute has value'
  );

  t.end();
});

test('AttributeManager.invalidate', t => {
  const attributeManager = new AttributeManager(gl);
  attributeManager.add({positions: {size: 2, update}});
  attributeManager.add({colors: {size: 2, accessor: 'getColor', update}});
  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attributeManager.invalidate('positions');
  t.ok(attributeManager.getAttributes()['positions'].needsUpdate, 'invalidated attribute by name');

  attributeManager.invalidate('getColor');
  t.ok(
    attributeManager.getAttributes()['colors'].needsUpdate,
    'invalidated attribute by accessor name'
  );

  t.end();
});
