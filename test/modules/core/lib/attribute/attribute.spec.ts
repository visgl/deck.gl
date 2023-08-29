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

/* eslint-disable dot-notation, max-statements, no-unused-vars, no-console */
/* global console */
import test from 'tape-promise/tape';
import {device} from '@deck.gl/test-utils';
import {makeSpy} from '@probe.gl/test-utils';

import Attribute from '@deck.gl/core/lib/attribute/attribute';
import {Buffer} from '@luma.gl/core';
import {GL} from '@luma.gl/constants';

test('Attribute#imports', t => {
  t.equals(typeof Attribute, 'function', 'Attribute import successful');
  t.end();
});

test('Attribute#constructor', t => {
  const attribute = new Attribute(device, {size: 1, accessor: 'a'});

  t.ok(attribute, 'Attribute construction successful');
  t.ok(attribute.allocate, 'Attribute.allocate function available');
  t.ok(attribute.updateBuffer, 'Attribute.update function available');

  t.throws(() => new Attribute(device, {size: 1}), 'Attribute missing update option');

  t.end();
});

test('Attribute#delete', t => {
  const attribute = new Attribute(device, {size: 1, accessor: 'a'});
  attribute.setData(new Float32Array(4));

  t.ok(attribute._buffer, 'Attribute created Buffer object');

  attribute.delete();
  t.notOk(attribute._buffer, 'Attribute deleted Buffer object');

  t.end();
});

test('Attribute#getUpdateTriggers', t => {
  const update = () => {};

  let attribute = new Attribute(device, {id: 'indices', isIndexed: true, size: 1, update});
  t.deepEqual(attribute.getUpdateTriggers(), ['indices'], 'returns correct update triggers');

  attribute = new Attribute(device, {id: 'instanceSizes', size: 1, accessor: 'getSize', update});
  t.deepEqual(
    attribute.getUpdateTriggers(),
    ['instanceSizes', 'getSize'],
    'returns correct update triggers'
  );

  attribute = new Attribute(device, {
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

test('Attribute#allocate', t => {
  const attributeNoAlloc = new Attribute(device, {
    id: 'positions',
    size: 3,
    accessor: 'a',
    noAlloc: true
  });

  const attribute = new Attribute(device, {
    id: 'sizes',
    update: attr => {
      attr.constant = true;
      attr.value = new Float32Array(2);
    },
    size: 2
  });

  const externalValue = new Float32Array(20).fill(1);

  t.notOk(attributeNoAlloc.allocate(2), 'Should not allocate if noAlloc is set');

  t.ok(attribute.allocate(2), 'allocate successful');
  const allocatedValue = attribute.value;
  t.ok(allocatedValue.length >= 4, 'allocated value is large enough');

  t.ok(attribute.allocate(4), 'allocate successful');
  t.is(attribute.value, allocatedValue, 'reused the same typed array');

  attribute.setExternalBuffer(externalValue);
  t.notOk(attributeNoAlloc.allocate(4), 'Should not allocate if external buffer is used');

  attribute.setExternalBuffer(null);
  t.ok(attribute.allocate(4), 'allocate successful');
  t.is(attribute.value, allocatedValue, 'reused the same typed array');

  attribute.setConstantValue([1, 1]);
  t.deepEquals(attribute.value, [1, 1], 'value overwritten by external constant');

  attribute.setConstantValue(undefined);
  t.ok(attribute.allocate(4), 'allocate successful');
  t.is(attribute.value, allocatedValue, 'reused the same typed array');

  t.ok(attribute.allocate(8), 'allocate successful');
  t.not(attribute.value, allocatedValue, 'created new typed array');

  attribute.delete();
  t.end();
});

test('Attribute#setConstantValue', t => {
  let attribute = new Attribute(device, {
    id: 'positions',
    size: 3,
    accessor: 'getPosition'
  });

  attribute.allocate(4);
  attribute.updateBuffer({
    numInstances: 4,
    data: new Array(4),
    props: {
      getPosition: () => [0, 0, 0]
    }
  });
  // clear redraw flag
  t.ok(attribute.getValue().positions instanceof Buffer, 'attribute is using packed buffer');
  attribute.needsRedraw({clearChangedFlags: true});

  attribute.setConstantValue([0, 0, 0]);
  t.deepEqual(attribute.getValue().positions, [0, 0, 0], 'attribute set to constant value');
  t.ok(attribute.needsRedraw({clearChangedFlags: true}), 'attribute marked needs redraw');

  attribute.setConstantValue([0, 0, 0]);
  t.notOk(attribute.needsRedraw({clearChangedFlags: true}), 'attribute should not need redraw');

  attribute.setConstantValue([0, 0, 1]);
  t.deepEqual(attribute.getValue().positions, [0, 0, 1], 'attribute set to constant value');
  t.ok(attribute.needsRedraw({clearChangedFlags: true}), 'attribute marked needs redraw');

  attribute.delete();

  attribute = new Attribute(device, {
    id: 'colors',
    size: 3,
    type: GL.UNSIGNED_BYTE,
    accessor: 'getColor',
    normalized: true
  });

  attribute.setConstantValue([255, 255, 0]);
  t.deepEqual(attribute.getValue().colors, [1, 1, 0], 'constant value is normalized');

  t.end();
});

test('Attribute#allocate - partial', t => {
  if (device.info.type !== 'webgl2') {
    // buffer.getData() is WebGL2 only
    t.comment('This test requires WebGL2');
    t.end();
    return;
  }

  let positions = new Attribute(device, {
    id: 'positions',
    update: attr => {
      attr.value[0] = 180;
      attr.value[1] = 90;
    },
    size: 2
  });

  positions.allocate(1);
  let value = positions.value;
  value[0] = 180;
  value[1] = 90;
  // make sure buffer is created
  positions.updateBuffer({});
  t.deepEqual(positions.buffer.getData().slice(0, 2), [180, 90], 'value uploaded to buffer');

  positions.setNeedsUpdate('test', {startRow: 1, endRow: 2});
  positions.allocate(value.length / 2 + 1); // array might be overallocated
  t.notEqual(positions.value, value, 'a new value array is allocated');
  t.deepEqual(positions.value.slice(0, 2), [180, 90], 'old value is copied to new array');
  t.deepEqual(positions.buffer.getData().slice(0, 2), [180, 90], 'old value is copied to buffer');

  positions.delete();

  // double precision
  positions = new Attribute(device, {
    id: 'positions64',
    type: GL.DOUBLE,
    update: attr => {
      attr.value[0] = 179.9;
      attr.value[1] = 89.9;
    },
    size: 2
  });

  positions.allocate(1);
  value = positions.value;
  // make sure buffer is created
  positions.updateBuffer({});
  t.deepEqual(
    positions.buffer.getData().slice(0, 4),
    [179.89999389648438, 89.9000015258789, 0.00000610351571594947, -0.0000015258789289873675],
    'value uploaded to buffer'
  );

  positions.setNeedsUpdate('test', {startRow: 1, endRow: 2});
  positions.allocate(value.length / 2 + 1); // array might be overallocated
  t.notEqual(positions.value, value, 'a new value array is allocated');
  t.deepEqual(positions.value.slice(0, 2), [179.9, 89.9], 'old value is copied to new array');
  t.deepEqual(
    positions.buffer.getData().slice(0, 4),
    [179.89999389648438, 89.9000015258789, 0.00000610351571594947, -0.0000015258789289873675],
    'old value is copied to buffer'
  );

  positions.delete();
  t.end();
});

test('Attribute#shaderAttributes', t => {
  const update = () => {};

  const buffer1 = device.createBuffer({byteLength: 10});

  const attribute = new Attribute(device, {
    id: 'positions',
    update,
    size: 3,
    shaderAttributes: {
      instancePositions: {
        divisor: 1
      },
      instanceNextPositions: {
        vertexOffset: 1,
        divisor: 1
      }
    }
  });
  attribute.setData({buffer: buffer1});

  const bufferLayout = attribute.getBufferLayout();
  t.is(bufferLayout.byteStride, 12, 'Buffer layout has correct stride');
  let attributeLayout = bufferLayout.attributes[0];
  t.is(attributeLayout.format, 'float32x3', 'Attribute position has correct format');
  t.is(attributeLayout.byteOffset, 0, 'Attribute position has correct offset');
  attributeLayout = bufferLayout.attributes[1];
  t.is(attributeLayout.format, 'float32x3', 'Attribute instancePositions has correct format');
  t.is(attributeLayout.byteOffset, 0, 'Attribute instancePositions has correct offset');
  attributeLayout = bufferLayout.attributes[2];
  t.is(attributeLayout.format, 'float32x3', 'Attribute instanceNextPositions has correct format');
  t.is(attributeLayout.byteOffset, 12, 'Attribute instanceNextPositions has correct offset');

  t.deepEquals(attribute.getValue(), {positions: buffer1}, 'Attribute has buffer');

  buffer1.delete();
  attribute.delete();

  t.end();
});

test('Attribute#updateBuffer', t => {
  const TEST_PROPS = {
    data: [
      {id: 'A', value: 10, color: [255, 0, 0]},
      {id: 'B', value: 20, color: [128, 128, 128, 128]},
      {id: 'C', value: 7, color: [255, 255, 255]},
      {id: 'D', value: 0, color: [0, 0, 0, 128]},
      {id: 'E', value: 0, color: undefined}
    ],
    getColor: d => d.color,
    getValue: d => d.value
  };

  const TEST_PARAMS = [
    {
      title: 'standard',
      numInstances: 5
    },
    {
      title: 'variable size',
      numInstances: 10,
      startIndices: [0, 2, 3, 7]
    }
  ];

  const TEST_CASES = [
    {
      title: 'standard accessor',
      attribute: new Attribute(device, {
        id: 'values',
        type: GL.FLOAT,
        size: 1,
        accessor: 'getValue'
      }),
      standard: [10, 20, 7, 0],
      'variable size': [10, 10, 20, 7, 7, 7, 7, 0, 0, 0]
    },
    {
      title: 'standard accessor with default value',
      attribute: new Attribute(device, {
        id: 'colors',
        type: GL.UNSIGNED_BYTE,
        size: 4,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255]
      }),
      // prettier-ignore
      standard: [
        255, 0, 0, 255,
        128, 128, 128, 128,
        255, 255, 255, 255,
        0, 0, 0, 128, 
        0, 0, 0, 255
      ],
      // prettier-ignore
      'variable size': [
        255, 0, 0, 255, 255, 0, 0, 255,
        128, 128, 128, 128,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        0, 0, 0, 128, 0, 0, 0, 128, 0, 0, 0, 128
      ]
    },
    {
      title: 'standard accessor with transform',
      attribute: new Attribute(device, {
        id: 'values',
        type: GL.FLOAT,
        size: 1,
        accessor: 'getValue',
        transform: x => x * 2
      }),
      standard: [20, 40, 14, 0],
      'variable size': [20, 20, 40, 14, 14, 14, 14, 0, 0, 0]
    },
    {
      title: 'custom accessor',
      attribute: new Attribute(device, {
        id: 'values',
        size: 3,
        accessor: (_, {index}) => [index, 0, 0]
      }),
      // prettier-ignore
      standard: [
        0, 0, 0,
        1, 0, 0,
        2, 0, 0,
        3, 0, 0
      ],
      // prettier-ignore
      'variable size': [
        0, 0, 0, 0, 0, 0,
        1, 0, 0,
        2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0,
        3, 0, 0, 3, 0, 0, 3, 0, 0
      ]
    },
    {
      title: 'custom update',
      attribute: new Attribute(device, {
        id: 'values',
        size: 3,
        update: attribute => {
          attribute.constant = true;
          attribute.value = new Float32Array([1, 0, 0]);
        }
      }),
      standard: [1, 0, 0],
      'variable size': [1, 0, 0]
    }
  ];

  for (const testCase of TEST_CASES) {
    for (const param of TEST_PARAMS) {
      const {attribute} = testCase;
      attribute.setNeedsUpdate(true);
      attribute.startIndices = param.startIndices;
      attribute.allocate(param.numInstances);
      attribute.updateBuffer({
        numInstances: param.numInstances,
        data: TEST_PROPS.data,
        props: TEST_PROPS
      });

      const result = testCase[param.title];

      t.deepEqual(
        attribute.value.slice(0, result.length),
        result,
        `${testCase.title} updates attribute buffer`
      );

      attribute.delete();
    }
  }

  t.end();
});

test('Attribute#updateBuffer _checkAttributeArray', t => {
  // the _checkAttributeArray() is a cheap validation performed after update
  // This test verifies that we only validate the first entry appropriately based
  // on attribute size, rather than the length of the 'value' which could have come from
  // the TypeArrayManager pool

  for (let size = 1; size <= 4; size++) {
    // Expect the result to be an array with length 'size', each has value 'size'
    // e.g. [2, 2]
    const result = new Float32Array(Array(size).fill(size));

    // Attribute.value must be >= Math.min(4, size) to trigger check
    // Setup attribute value to have length 5, with NaN elements for entries > attribute.size
    // e.g [2, 2, NaN, NaN, NaN]
    const attribute = new Attribute(device, {
      id: 'values',
      size,
      update: attr => {
        attr.value = new Float32Array(Array(4).fill(NaN).fill(size, 0, size));
      }
    });

    attribute.setNeedsUpdate(true);
    attribute.allocate(1);
    attribute.updateBuffer({
      numInstances: 1
    });

    t.deepEqual(
      attribute.value.slice(0, result.length),
      result,
      `Attribute with size ${size} passed _checkAttributeArray after update`
    );

    attribute.delete();
  }

  // Verify it fails appropriately
  for (let size = 1; size <= 4; size++) {
    // Attribute.value must be >= Math.min(4, size) to trigger check
    //
    // Setup attribute value with NaN elements that trigger an exception
    const attribute = new Attribute(device, {
      id: 'values',
      size,
      update: attr => {
        attr.value = new Float32Array(Array(4).fill(NaN));
      }
    });

    attribute.setNeedsUpdate(true);
    attribute.allocate(1);
    t.throws(() => attribute.updateBuffer({numInstances: 1}));

    attribute.delete();
  }

  t.end();
});

test('Attribute#updateBuffer#noAlloc', t => {
  let value;
  const attribute = new Attribute(device, {
    id: 'values',
    vertexOffset: 1,
    size: 2,
    update: (attr, {data}) => {
      attr.value = data;
    },
    noAlloc: true
  });

  // 1 vertex + 1 vertexOffset => 2 vertices * 2 floats => 16 bytes
  // overallocation: 2 floats * 2 = 16 bytes
  value = new Float32Array([1, 1]);
  attribute.setNeedsUpdate(true);
  attribute.updateBuffer({data: value});
  t.is(attribute.buffer.byteLength, 32, `overallocated buffer for ${value.byteLength} bytes`);

  value = new Float32Array([1, 2]);
  attribute.setNeedsUpdate(true);
  attribute.updateBuffer({data: value});
  t.is(attribute.buffer.byteLength, 32, `buffer is big enough ${value.byteLength} bytes`);

  // 4 vertices + 1 vertexOffset => 5 vertices * 2 floats => 40 bytes
  value = new Float32Array([1, 1, 2, 2, 3, 3, 4, 4]);
  attribute.setNeedsUpdate(true);
  attribute.updateBuffer({data: value});
  t.is(attribute.buffer.byteLength, 56, `re-allocated buffer for ${value.byteLength} bytes`);

  attribute.delete();
  t.end();
});

test('Attribute#standard accessor - variable width', t => {
  const TEST_PROPS = {
    data: [
      {id: 'Empty', value: [], color: [0, 255, 0]},
      {
        id: 'A',
        value: [10, 11],
        color: [
          [255, 0, 0],
          [255, 255, 0]
        ]
      },
      {
        id: 'B',
        value: [20],
        color: [
          [128, 128, 128],
          [128, 128, 128]
        ]
      },
      {id: 'C', value: [30, 31, 32], color: [255, 255, 255]}
    ],
    getColor: d => d.color,
    getValue: d => d.value
  };

  const TEST_CASES = [
    {
      attribute: new Attribute(device, {
        id: 'values',
        type: GL.FLOAT,
        size: 1,
        accessor: 'getValue'
      }),
      result: [10, 11, 20, 30, 31, 32]
    },
    {
      attribute: new Attribute(device, {
        id: 'colors',
        type: GL.UNSIGNED_BYTE,
        size: 4,
        defaultValue: [0, 0, 0, 255],
        accessor: 'getColor'
      }),
      // prettier-ignore
      result: [
        255, 0, 0, 255,
        255, 255, 0, 255,
        128, 128, 128, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255
      ]
    }
  ];

  for (const testCase of TEST_CASES) {
    const {attribute, result} = testCase;
    attribute.setNeedsUpdate(true);
    attribute.startIndices = [0, 0, 2, 3];
    attribute.allocate(10);
    attribute.updateBuffer({
      numInstances: 6,
      data: TEST_PROPS.data,
      props: TEST_PROPS
    });

    t.deepEqual(attribute.value.slice(0, result.length), result, 'attribute buffer is updated');
  }

  t.end();
});

test('Attribute#updateBuffer - partial', t => {
  let accessorCalled = 0;

  const TEST_PROPS = {
    data: [{id: 'A'}, {id: 'B'}, {id: 'C'}, {id: 'D'}, {id: 'E'}, {id: 'F'}],
    // This accessor checks two things: how many times an accessor is called,
    // and whether `index` is consistently populated for each object
    getValue: (d, {index}) => accessorCalled++ + index * 10
  };

  const ATTRIBUTE_1 = new Attribute(device, {
    id: 'values-1',
    type: GL.FLOAT,
    size: 1,
    accessor: 'getValue'
  });

  const ATTRIBUTE_2 = new Attribute(device, {
    id: 'values-2',
    type: GL.FLOAT,
    size: 1,
    accessor: 'getValue'
  });

  const TEST_CASES = [
    {
      title: 'full update',
      attribute: ATTRIBUTE_1,
      params: {
        numInstances: 4
      },
      value: [0, 11, 22, 33]
    },
    {
      title: 'update with startRow only',
      attribute: ATTRIBUTE_1,
      dataRanges: [
        {
          startRow: 3
        }
      ],
      params: {
        numInstances: 4
      },
      value: [0, 11, 22, 30]
    },
    {
      title: 'update with partial range',
      attribute: ATTRIBUTE_1,
      dataRanges: [
        {
          startRow: 1,
          endRow: 3
        }
      ],
      params: {
        numInstances: 4
      },
      value: [0, 10, 21, 30]
    },
    {
      title: 'multiple partial updates with reallocation',
      attribute: ATTRIBUTE_1,
      dataRanges: [
        {
          startRow: 2,
          endRow: 3
        },
        {
          startRow: 4
        }
      ],
      params: {
        numInstances: 6
      },
      value: [0, 10, 20, 30, 41, 52]
    },
    {
      title: 'full update - variable size',
      attribute: ATTRIBUTE_2,
      params: {
        numInstances: 10,
        startIndices: [0, 2, 3, 7]
      },
      value: [0, 0, 11, 22, 22, 22, 22, 33, 33, 33]
    },
    {
      title: 'update with startRow only - variable size',
      attribute: ATTRIBUTE_2,
      dataRanges: [
        {
          startRow: 3
        }
      ],
      params: {
        numInstances: 10,
        startIndices: [0, 2, 3, 7]
      },
      value: [0, 0, 11, 22, 22, 22, 22, 30, 30, 30]
    },
    {
      title: 'update with partial range - variable size',
      attribute: ATTRIBUTE_2,
      dataRanges: [
        {
          startRow: 1,
          endRow: 3
        }
      ],
      params: {
        numInstances: 10,
        startIndices: [0, 2, 3, 7]
      },
      value: [0, 0, 10, 21, 21, 21, 21, 30, 30, 30]
    },
    {
      title: 'multiple partial updates with reallocation - variable size',
      attribute: ATTRIBUTE_2,
      dataRanges: [
        {
          startRow: 2,
          endRow: 3
        },
        {
          startRow: 4
        }
      ],
      params: {
        numInstances: 13,
        startIndices: [0, 2, 3, 7, 10, 11]
      },
      value: [0, 0, 10, 20, 20, 20, 20, 30, 30, 30, 41, 52, 52]
    }
  ];

  for (const testCase of TEST_CASES) {
    const {attribute, dataRanges} = testCase;

    if (dataRanges) {
      for (const range of dataRanges) {
        attribute.setNeedsUpdate(true, range);
      }
    } else {
      // full update
      attribute.setNeedsUpdate(true);
    }

    // reset stats
    accessorCalled = 0;

    attribute.startIndices = testCase.params.startIndices;
    attribute.allocate(testCase.params.numInstances);
    attribute.updateBuffer({
      ...testCase.params,
      data: TEST_PROPS.data,
      props: TEST_PROPS
    });

    t.deepEqual(
      attribute.value.slice(0, testCase.value.length),
      testCase.value,
      `${testCase.title} yields correct result`
    );
  }

  ATTRIBUTE_1.delete();
  ATTRIBUTE_2.delete();
  t.end();
});

test('Attribute#setExternalBuffer', t => {
  const attribute = new Attribute(device, {
    id: 'test-attribute',
    type: GL.FLOAT,
    size: 3,
    update: () => {}
  });
  const buffer = device.createBuffer({byteLength: 12});
  const value1 = new Float32Array(4);
  const value2 = new Uint8Array(4);

  attribute.setNeedsUpdate();
  t.notOk(
    attribute.setExternalBuffer(null),
    'should do nothing if setting external buffer to null'
  );
  t.ok(attribute.needsUpdate(), 'attribute still needs update');

  t.ok(attribute.setExternalBuffer(buffer), 'should set external buffer to Buffer object');
  t.is(attribute.getBuffer(), buffer, 'external buffer is set');
  t.notOk(attribute.needsUpdate(), 'attribute is updated');

  const spy = makeSpy(attribute, 'setData');
  t.ok(
    attribute.setExternalBuffer(buffer),
    'should successfully set external buffer if setting external buffer to the same object'
  );
  t.notOk(spy.called, 'Should not call update if setting external buffer to the same object');

  t.ok(attribute.setExternalBuffer(value1), 'should set external buffer to typed array');
  t.is(attribute.value, value1, 'external value is set');
  t.is(attribute.getAccessor().type, GL.FLOAT, 'attribute type is set correctly');

  t.ok(attribute.setExternalBuffer(value2), 'should set external buffer to typed array');
  t.is(attribute.getAccessor().type, GL.UNSIGNED_BYTE, 'attribute type is set correctly');

  spy.reset();
  t.ok(
    attribute.setExternalBuffer(value2),
    'should successfully set external buffer if setting external buffer to the same object'
  );
  t.notOk(spy.called, 'Should not call update if setting external buffer to the same object');

  t.ok(
    attribute.setExternalBuffer({
      offset: 4,
      stride: 8,
      value: value1
    }),
    'should set external buffer to attribute descriptor'
  );
  let attributeAccessor = attribute.getAccessor();
  t.is(attributeAccessor.offset, 4, 'attribute accessor is updated');
  t.is(attributeAccessor.stride, 8, 'attribute accessor is updated');
  t.is(attribute.value, value1, 'external value is set');
  t.is(attributeAccessor.type, GL.FLOAT, 'attribute type is set correctly');

  t.ok(
    attribute.setExternalBuffer({
      offset: 4,
      stride: 8,
      value: value1,
      type: GL.UNSIGNED_BYTE
    }),
    'should set external buffer to attribute descriptor'
  );
  attributeAccessor = attribute.getAccessor();
  t.is(attributeAccessor.type, GL.UNSIGNED_BYTE, 'attribute type is set correctly');

  buffer.delete();
  attribute.delete();

  t.end();
});

test('Attribute#setExternalBuffer#shaderAttributes', t => {
  const attribute = new Attribute(device, {
    id: 'test-attribute-with-shader-attributes',
    type: GL.UNSIGNED_BYTE,
    size: 4,
    normalized: true,
    update: () => {},
    shaderAttributes: {
      a: {size: 1, elementOffset: 1}
    }
  });
  const attribute2 = new Attribute(device, {
    id: 'test-attribute-with-shader-attributes',
    type: GL.DOUBLE,
    size: 4,
    vertexOffset: 1,
    update: () => {},
    shaderAttributes: {
      a: {vertexOffset: 0}
    }
  });

  const value8 = new Uint8Array(16);
  const value32 = new Float32Array(16);
  const value64 = new Float64Array(16);

  attribute.setExternalBuffer(value8);
  let bufferLayout = attribute.getBufferLayout();
  t.is(bufferLayout.byteStride, 4, 'Buffer layout has correct stride');
  t.is(bufferLayout.attributes[1].format, 'unorm8', 'Attribute a has correct format');
  t.is(bufferLayout.attributes[1].byteOffset, 1, 'Attribute a has correct offset');

  attribute.setExternalBuffer({value: value8, stride: 8, offset: 2});
  bufferLayout = attribute.getBufferLayout();
  t.is(bufferLayout.byteStride, 8, 'Buffer layout has correct stride');
  t.is(bufferLayout.attributes[1].format, 'unorm8', 'Attribute a has correct format');
  t.is(bufferLayout.attributes[1].byteOffset, 3, 'Attribute a has correct offset');

  attribute.setExternalBuffer({value: value32, offset: 2});
  bufferLayout = attribute.getBufferLayout();
  t.is(bufferLayout.byteStride, 16, 'Buffer layout has correct stride');
  t.is(bufferLayout.attributes[1].format, 'float32', 'Attribute a has correct format');
  t.is(bufferLayout.attributes[1].byteOffset, 6, 'Attribute a has correct offset');

  attribute2.setExternalBuffer(value32);
  bufferLayout = attribute2.getBufferLayout();
  t.is(bufferLayout.byteStride, 16, 'Buffer layout has correct stride');
  t.is(bufferLayout.attributes[2].format, 'float32x4', 'Attribute a has correct format');
  t.is(bufferLayout.attributes[2].byteOffset, 0, 'Attribute a has correct offset');
  t.is(bufferLayout.attributes[3].format, 'float32x4', 'Attribute a64Low has correct format');
  t.is(bufferLayout.attributes[3].byteOffset, 16, 'Attribute a64Low has correct offset');
  t.deepEqual(attribute2.getValue().a64Low, [0, 0, 0, 0], 'shaderAttribute low part is constant');

  attribute2.setExternalBuffer({value: value64, stride: 48, offset: 8});
  bufferLayout = attribute2.getBufferLayout();
  t.is(bufferLayout.byteStride, 48, 'Buffer layout has correct stride');
  t.is(bufferLayout.attributes[2].format, 'float32x4', 'Attribute a has correct format');
  t.is(bufferLayout.attributes[2].byteOffset, 8, 'Attribute a has correct offset');
  t.is(bufferLayout.attributes[3].format, 'float32x4', 'Attribute a64Low has correct format');
  t.is(bufferLayout.attributes[3].byteOffset, 24, 'Attribute a64Low has correct offset');
  t.ok(attribute2.getValue().a64Low instanceof Buffer, 'shaderAttribute low part is buffer');

  attribute.delete();
  attribute2.delete();

  t.end();
});

test('Attribute#setBinaryValue', t => {
  let attribute = new Attribute(device, {
    id: 'test-attribute',
    type: GL.FLOAT,
    size: 3,
    update: () => {}
  });
  let value = new Float32Array(12);

  attribute.setNeedsUpdate();
  t.notOk(attribute.setBinaryValue(null), 'should do nothing if setting external buffer to null');
  t.ok(attribute.needsUpdate(), 'attribute still needs update');

  const spy = makeSpy(attribute, 'setData');
  t.ok(attribute.setBinaryValue(value), 'should use external binary value');
  t.is(spy.callCount, 1, 'setData is called');
  t.notOk(attribute.needsUpdate(), 'attribute is updated');

  attribute.setNeedsUpdate();
  t.ok(attribute.setBinaryValue(value), 'should use external binary value');
  t.is(spy.callCount, 1, 'setData is called only once on the same data');
  t.notOk(attribute.needsUpdate(), 'attribute is updated');

  spy.reset();
  attribute.delete();

  attribute = new Attribute(device, {
    id: 'test-attribute',
    type: GL.FLOAT,
    size: 3,
    noAlloc: true,
    update: () => {}
  });
  attribute.setNeedsUpdate();
  t.notOk(attribute.setBinaryValue(value), 'should do nothing if noAlloc');
  t.ok(attribute.needsUpdate(), 'attribute still needs update');

  attribute = new Attribute(device, {
    id: 'test-attribute-with-transform',
    type: GL.UNSIGNED_BYTE,
    size: 4,
    defaultValue: [0, 0, 0, 255],
    transform: x => x + 1,
    update: () => {}
  });
  value = {value: new Uint8Array(12), size: 3};

  attribute.setNeedsUpdate();
  t.notOk(attribute.setBinaryValue(value), 'should require update');
  t.ok(attribute.state.binaryAccessor, 'binaryAccessor is assigned');
  t.ok(attribute.needsUpdate(), 'attribute still needs update');

  t.throws(
    () => attribute.setBinaryValue([0, 1, 2, 3]),
    'should throw if external value is invalid'
  );

  attribute.delete();
  t.end();
});

test('Attribute#doublePrecision', t0 => {
  const validateShaderAttributes = (t, attribute, is64Bit) => {
    const bufferLayout = attribute.getBufferLayout();
    t.deepEqual(
      bufferLayout.attributes.map(a => a.attribute),
      ['positions', 'positions64Low'],
      'buffer layout generated'
    );

    if (is64Bit) {
      t.is(bufferLayout.byteStride, 24, 'Buffer layout has correct stride');
      t.is(bufferLayout.attributes[0].byteOffset, 0, 'Attribute positions has correct offset');
      t.is(
        bufferLayout.attributes[1].byteOffset,
        12,
        'Attribute positions64Low has correct offset'
      );

      const values = attribute.getValue();
      t.is(values.positions, attribute.getBuffer(), 'positions value is buffer');
      t.is(values.positions64Low, attribute.getBuffer(), 'positions64Low value is buffer');
    } else {
      t.is(bufferLayout.byteStride, 12, 'Buffer layout has correct stride');
      t.is(bufferLayout.attributes[0].byteOffset, 0, 'Attribute positions has correct offset');

      const values = attribute.getValue();
      t.is(values.positions, attribute.getBuffer(), 'positions value is buffer');
      t.deepEqual(values.positions64Low, [0, 0, 0], 'positions64Low value is buffer');
    }
  };

  t0.test('Attribute#doublePrecision#fp64:true', t => {
    const attribute = new Attribute(device, {
      id: 'positions',
      type: GL.DOUBLE,
      size: 3,
      accessor: 'getPosition'
    });

    attribute.allocate(2);
    attribute.updateBuffer({
      numInstances: 2,
      data: [0, 1],
      props: {
        getPosition: d => [d, 1, 2]
      }
    });
    t.ok(attribute.value instanceof Float64Array, 'Attribute is Float64Array');
    t.deepEqual(attribute.value.slice(0, 6), [0, 1, 2, 1, 1, 2], 'Attribute value is populated');
    validateShaderAttributes(t, attribute, true);

    attribute.setExternalBuffer(new Uint32Array([3, 4, 5, 4, 4, 5]));
    t.ok(attribute.value instanceof Uint32Array, 'Attribute is Uint32Array');
    validateShaderAttributes(t, attribute, false);

    t.throws(
      () => attribute.setExternalBuffer(new Uint8Array([3, 4, 5, 4, 4, 5])),
      'should throw on invalid buffer'
    );

    attribute.setExternalBuffer(new Float64Array([3, 4, 5, 4, 4, 5]));
    t.ok(attribute.value instanceof Float64Array, 'Attribute is Float64Array');
    validateShaderAttributes(t, attribute, true);

    const buffer = device.createBuffer({byteLength: 12});
    attribute.setExternalBuffer(buffer);
    validateShaderAttributes(t, attribute, false);

    buffer.delete();
    attribute.delete();
    t.end();
  });

  t0.test('Attribute#doublePrecision#fp64:false', t => {
    const attribute = new Attribute(device, {
      id: 'positions',
      type: GL.DOUBLE,
      fp64: false,
      size: 3,
      accessor: 'getPosition'
    });

    attribute.allocate(2);
    attribute.updateBuffer({
      numInstances: 2,
      data: [0, 1],
      props: {
        getPosition: d => [d, 1, 2]
      }
    });
    t.ok(attribute.value instanceof Float32Array, 'Attribute is Float32Array');
    t.deepEqual(attribute.value.slice(0, 6), [0, 1, 2, 1, 1, 2], 'Attribute value is populated');
    validateShaderAttributes(t, attribute, false);

    attribute.setExternalBuffer(new Uint32Array([3, 4, 5, 4, 4, 5]));
    t.ok(attribute.value instanceof Uint32Array, 'Attribute is Uint32Array');
    validateShaderAttributes(t, attribute, false);

    t.throws(
      () => attribute.setExternalBuffer(new Uint8Array([3, 4, 5, 4, 4, 5])),
      'should throw on invalid buffer'
    );

    attribute.setExternalBuffer(new Float64Array([3, 4, 5, 4, 4, 5]));
    t.ok(attribute.value instanceof Float64Array, 'Attribute is Float64Array');
    validateShaderAttributes(t, attribute, true);

    const buffer = device.createBuffer({byteLength: 12});
    attribute.setExternalBuffer(buffer);
    validateShaderAttributes(t, attribute, false);

    buffer.delete();
    attribute.delete();
    t.end();
  });

  t0.end();
});

test('Attribute#updateBuffer', t => {
  const attribute = new Attribute(device, {
    id: 'positions',
    type: GL.DOUBLE,
    fp64: false,
    size: 3,
    accessor: 'getPosition'
  });

  t.is(attribute.getBounds(), null, 'Empty attribute does not have bounds');

  attribute.numInstances = 3;
  attribute.allocate(3);
  attribute.updateBuffer({
    numInstances: 3,
    data: [0, 1, 2],
    props: {
      getPosition: d => [d, 1, -1]
    }
  });

  let bounds = attribute.getBounds();
  t.deepEqual(
    bounds,
    [
      [0, 1, -1],
      [2, 1, -1]
    ],
    'Calculated attribute bounds'
  );
  t.is(bounds, attribute.getBounds(), 'bounds is cached');

  attribute.setNeedsUpdate();
  attribute.numInstances = 2;
  attribute.allocate(2);
  attribute.updateBuffer({
    numInstances: 2,
    data: [0, 1],
    props: {
      getPosition: d => [d, 1, 2]
    }
  });

  bounds = attribute.getBounds();
  t.deepEqual(
    bounds,
    [
      [0, 1, 2],
      [1, 1, 2]
    ],
    'Calculated attribute bounds'
  );
  t.is(bounds, attribute.getBounds(), 'bounds is cached');

  attribute.setNeedsUpdate();
  attribute.setConstantValue([-1, 0, 1]);

  bounds = attribute.getBounds();
  t.deepEqual(
    bounds,
    [
      [-1, 0, 1],
      [-1, 0, 1]
    ],
    'Calculated attribute bounds'
  );
  t.is(bounds, attribute.getBounds(), 'bounds is cached');

  attribute.delete();

  t.end();
});
