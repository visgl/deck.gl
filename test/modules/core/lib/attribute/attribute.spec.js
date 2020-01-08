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
import Attribute from '@deck.gl/core/lib/attribute/attribute';
import GL from '@luma.gl/constants';
import {Buffer, isWebGL2} from '@luma.gl/core';
import test from 'tape-catch';
import {gl} from '@deck.gl/test-utils';
import {makeSpy} from '@probe.gl/test-utils';

test('Attribute#imports', t => {
  t.equals(typeof Attribute, 'function', 'Attribute import successful');
  t.end();
});

test('Attribute#constructor', t => {
  const attribute = new Attribute(gl, {size: 1, accessor: 'a'});

  t.ok(attribute, 'Attribute construction successful');
  t.is(typeof attribute.getBuffer, 'function', 'Attribute.getBuffer function available');
  t.ok(attribute.allocate, 'Attribute.allocate function available');
  t.ok(attribute.updateBuffer, 'Attribute.update function available');

  t.throws(() => new Attribute(gl, {size: 1}), 'Attribute missing update option');

  t.end();
});

test('Attribute#delete', t => {
  const attribute = new Attribute(gl, {size: 1, accessor: 'a', value: new Float32Array(4)});
  t.ok(attribute._buffer, 'Attribute created Buffer object');

  attribute.delete();
  t.notOk(attribute._buffer, 'Attribute deleted Buffer object');

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

test('Attribute#allocate', t => {
  const attributeNoAlloc = new Attribute(gl, {
    id: 'positions',
    size: 3,
    accessor: 'a',
    noAlloc: true
  });

  const attribute = new Attribute(gl, {
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
  t.notOk(attributeNoAlloc.allocate(4), 'Should not allocate if constant value is used');

  attribute.setConstantValue(undefined);
  t.ok(attribute.allocate(4), 'allocate successful');
  t.is(attribute.value, allocatedValue, 'reused the same typed array');

  t.ok(attribute.allocate(8), 'allocate successful');
  t.not(attribute.value, allocatedValue, 'created new typed array');

  attribute.delete();
  t.end();
});

test('Attribute#setConstantValue', t => {
  let attribute = new Attribute(gl, {
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
  t.ok(attribute.getValue()[0] instanceof Buffer, 'attribute is using packed buffer');
  attribute.needsRedraw({clearChangedFlags: true});

  attribute.setConstantValue([0, 0, 0]);
  t.deepEqual(attribute.getValue(), [0, 0, 0], 'attribute set to constant value');
  t.ok(attribute.needsRedraw({clearChangedFlags: true}), 'attribute marked needs redraw');

  attribute.setConstantValue([0, 0, 0]);
  t.notOk(attribute.needsRedraw({clearChangedFlags: true}), 'attribute should not need redraw');

  attribute.setConstantValue([0, 0, 1]);
  t.deepEqual(attribute.getValue(), [0, 0, 1], 'attribute set to constant value');
  t.ok(attribute.needsRedraw({clearChangedFlags: true}), 'attribute marked needs redraw');

  attribute.delete();

  attribute = new Attribute(gl, {
    id: 'colors',
    size: 3,
    type: GL.UNSIGNED_BYTE,
    accessor: 'getColor',
    normalized: true
  });

  attribute.setConstantValue([255, 255, 0]);
  t.deepEqual(attribute.getValue(), [1, 1, 0], 'constant value is normalized');

  t.end();
});

test('Attribute#allocate - partial', t => {
  if (!isWebGL2(gl)) {
    // buffer.getData() is WebGL2 only
    t.comment('This test requires WebGL2');
    t.end();
    return;
  }

  let positions = new Attribute(gl, {
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
  positions = new Attribute(gl, {
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

  const buffer1 = new Buffer(gl, 10);

  const attribute = new Attribute(gl, {
    id: 'positions',
    update,
    size: 3,
    buffer: buffer1,
    shaderAttributes: {
      positions: {},
      instancePositions: {
        divisor: 1
      },
      instanceNextPositions: {
        vertexOffset: 1,
        divisor: 1
      }
    }
  });
  const shaderAttributes = attribute.getShaderAttributes();
  t.ok(shaderAttributes.positions, 'Shader attribute created');
  let accessor = shaderAttributes.positions.getAccessor();
  t.equals(accessor.size, 3, 'Shader attribute inherits pointer properties');
  t.ok(shaderAttributes.instancePositions, 'Multiple shader attributes created');
  accessor = shaderAttributes.instancePositions.getAccessor();
  t.equals(accessor.size, 3, 'Multiple shader attributes inherit pointer properties');
  t.equals(accessor.divisor, 1, 'Shader attribute defines pointer properties');
  accessor = shaderAttributes.instanceNextPositions.getAccessor();
  t.equals(accessor.stride, 12, 'Shader attribute defines explicit stride');
  t.equals(accessor.offset, 12, 'Shader attribute defines offset');

  t.equals(attribute.getBuffer(), buffer1, 'Attribute has buffer');
  t.equals(
    attribute.getBuffer(),
    shaderAttributes.positions.getValue()[0],
    'Shader attribute shares parent buffer'
  );
  t.equals(
    attribute.getBuffer(),
    shaderAttributes.instancePositions.getValue()[0],
    'Shader attribute shares parent buffer'
  );

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
      {id: 'D', value: 0, color: [0, 0, 0, 128]}
    ],
    getColor: d => d.color,
    getValue: d => d.value
  };

  const TEST_PARAMS = [
    {
      title: 'standard',
      numInstances: 4
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
      attribute: new Attribute(gl, {
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
      attribute: new Attribute(gl, {
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
        0, 0, 0, 128
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
      attribute: new Attribute(gl, {
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
      attribute: new Attribute(gl, {
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
      attribute: new Attribute(gl, {
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
    }
  }

  t.end();
});

test('Attribute#standard accessor - variable width', t => {
  const TEST_PROPS = {
    data: [
      {id: 'A', value: [10, 11], color: [[255, 0, 0], [255, 255, 0]]},
      {id: 'B', value: [20], color: [[128, 128, 128], [128, 128, 128]]},
      {id: 'C', value: [30, 31, 32], color: [255, 255, 255]}
    ],
    getColor: d => d.color,
    getValue: d => d.value
  };

  const TEST_CASES = [
    {
      attribute: new Attribute(gl, {
        id: 'values',
        type: GL.FLOAT,
        size: 1,
        accessor: 'getValue'
      }),
      result: [10, 11, 20, 30, 31, 32]
    },
    {
      attribute: new Attribute(gl, {
        id: 'colors',
        type: GL.UNSIGNED_BYTE,
        size: 4,
        defaultValue: [0, 0, 0, 255],
        accessor: 'getColor'
      }),
      result: [
        255,
        0,
        0,
        255,
        255,
        255,
        0,
        255,
        128,
        128,
        128,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255,
        255
      ]
    }
  ];

  for (const testCase of TEST_CASES) {
    const {attribute, result} = testCase;
    attribute.setNeedsUpdate(true);
    attribute.startIndices = [0, 2, 3];
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

  const ATTRIBUTE_1 = new Attribute(gl, {
    id: 'values-1',
    type: GL.FLOAT,
    size: 1,
    accessor: 'getValue'
  });

  const ATTRIBUTE_2 = new Attribute(gl, {
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
  const attribute = new Attribute(gl, {
    id: 'test-attribute',
    type: GL.FLOAT,
    size: 3,
    update: () => {}
  });
  const buffer = new Buffer(gl, 12);
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
  const attribute = new Attribute(gl, {
    id: 'test-attribute-with-shader-attributes',
    type: GL.UNSIGNED_BYTE,
    size: 4,
    normalized: true,
    update: () => {},
    shaderAttributes: {
      a: {size: 1, elementOffset: 1}
    }
  });
  const attribute2 = new Attribute(gl, {
    id: 'test-attribute-with-shader-attributes',
    type: GL.DOUBLE,
    size: 4,
    vertexOffset: 1,
    update: () => {},
    shaderAttributes: {
      a: {vertexOffset: 0}
    }
  });

  const buffer = new Buffer(gl, 16);
  const value8 = new Uint8Array(16);
  const value32 = new Float32Array(16);
  const value64 = new Float64Array(16);

  attribute.setExternalBuffer(value8);
  let shaderAttributes = attribute.getShaderAttributes();
  t.is(shaderAttributes.a.getAccessor().stride, 4, 'shaderAttribute has correct stride');
  t.is(shaderAttributes.a.getAccessor().offset, 1, 'shaderAttribute has correct offset');

  attribute.setExternalBuffer({value: value8, stride: 8, offset: 2});
  shaderAttributes = attribute.getShaderAttributes();
  t.is(shaderAttributes.a.getAccessor().stride, 8, 'shaderAttribute has correct stride');
  t.is(shaderAttributes.a.getAccessor().offset, 3, 'shaderAttribute has correct offset');

  attribute.setExternalBuffer({value: value32, offset: 2});
  shaderAttributes = attribute.getShaderAttributes();
  t.is(shaderAttributes.a.getAccessor().stride, 16, 'shaderAttribute has correct stride');
  t.is(shaderAttributes.a.getAccessor().offset, 6, 'shaderAttribute has correct offset');

  attribute2.setExternalBuffer(value32);
  shaderAttributes = attribute2.getShaderAttributes();
  t.is(shaderAttributes.a.getAccessor().stride, 16, 'shaderAttribute has correct stride');
  t.is(shaderAttributes.a.getAccessor().offset, 0, 'shaderAttribute has correct offset');
  t.deepEqual(shaderAttributes.a64Low, [0, 0, 0, 0], 'shaderAttribute low part is constant');

  attribute2.setExternalBuffer({value: value64, stride: 48, offset: 8});
  shaderAttributes = attribute2.getShaderAttributes();
  t.is(shaderAttributes.a.getAccessor().stride, 48, 'shaderAttribute has correct stride');
  t.is(shaderAttributes.a.getAccessor().offset, 8, 'shaderAttribute has correct offset');
  t.is(
    shaderAttributes.a64Low.getAccessor().stride,
    48,
    'shaderAttribute low part has correct stride'
  );
  t.is(
    shaderAttributes.a64Low.getAccessor().offset,
    24,
    'shaderAttribute low part has correct offset'
  );

  buffer.delete();
  attribute.delete();
  attribute2.delete();

  t.end();
});

test('Attribute#setBinaryValue', t => {
  let attribute = new Attribute(gl, {
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

  attribute = new Attribute(gl, {
    id: 'test-attribute',
    type: GL.FLOAT,
    size: 3,
    noAlloc: true,
    update: () => {}
  });
  attribute.setNeedsUpdate();
  t.notOk(attribute.setBinaryValue(value), 'should do nothing if noAlloc');
  t.ok(attribute.needsUpdate(), 'attribute still needs update');

  attribute = new Attribute(gl, {
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
    const shaderAttributes = attribute.getShaderAttributes();
    t.deepEqual(
      Object.keys(shaderAttributes),
      ['positions', 'positions64Low'],
      'shaderAttributes generated'
    );

    if (is64Bit) {
      const [buffer, accessor] = shaderAttributes.positions.getValue();
      t.is(buffer, attribute.getBuffer(), 'shaderAttributes.positions buffer');
      t.is(accessor.offset, 0, 'shaderAttributes.positions offset');
      t.is(accessor.stride, 24, 'shaderAttributes.positions stride');

      const [buffer64Low, accessor64Low] = shaderAttributes.positions64Low.getValue();
      t.is(buffer64Low, attribute.getBuffer(), 'shaderAttributes.positions64Low buffer');
      t.is(accessor64Low.offset, 12, 'shaderAttributes.positions64Low offset');
      t.is(accessor64Low.stride, 24, 'shaderAttributes.positions64Low stride');
    } else {
      const [buffer, accessor] = shaderAttributes.positions.getValue();
      t.is(buffer, attribute.getBuffer(), 'shaderAttributes.positions buffer');
      t.is(accessor.offset, 0, 'shaderAttributes.positions offset');
      t.is(accessor.stride, 12, 'shaderAttributes.positions stride');
      t.deepEqual(
        shaderAttributes.positions64Low,
        [0, 0, 0],
        'shaderAttributes.positions64Low is constant'
      );
    }
  };

  t0.test('Attribute#doublePrecision#fp64:true', t => {
    const attribute = new Attribute(gl, {
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

    const buffer = new Buffer(gl, 12);
    attribute.setExternalBuffer(buffer);
    validateShaderAttributes(t, attribute, false);

    buffer.delete();
    attribute.delete();
    t.end();
  });

  t0.test('Attribute#doublePrecision#fp64:false', t => {
    const attribute = new Attribute(gl, {
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

    const buffer = new Buffer(gl, 12);
    attribute.setExternalBuffer(buffer);
    validateShaderAttributes(t, attribute, false);

    buffer.delete();
    attribute.delete();
    t.end();
  });

  t0.end();
});
