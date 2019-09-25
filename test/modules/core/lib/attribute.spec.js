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
import GL from '@luma.gl/constants';
import {Buffer} from '@luma.gl/core';
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
  t.ok(attribute.update, 'Attribute.update function available');

  t.throws(() => new Attribute(gl, {size: 1}), 'Attribute missing update option');

  t.end();
});

test('Attribute#delete', t => {
  const attribute = new Attribute(gl, {size: 1, accessor: 'a', value: new Float32Array(4)});
  t.ok(attribute.buffer, 'Attribute created Buffer object');

  attribute.delete();
  t.notOk(attribute.buffer, 'Attribute deleted Buffer object');

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

test('Attribute#shaderAttributes', t => {
  const update = () => {};

  const buffer1 = new Buffer(gl, 10);
  const buffer2 = new Buffer(gl, 10);

  const attribute = new Attribute(gl, {
    id: 'positions',
    update,
    size: 3,
    buffer: buffer1,
    shaderAttributes: {
      positions: {},
      instancePositions: {
        divisor: 1
      }
    }
  });
  t.ok(attribute.shaderAttributes.positions, 'Shader attribute created');
  t.equals(
    attribute.shaderAttributes.positions.size,
    3,
    'Shader attribute inherits pointer properties'
  );
  t.ok(attribute.shaderAttributes.instancePositions, 'Multiple shader attributes created');
  t.equals(
    attribute.shaderAttributes.instancePositions.size,
    3,
    'Multiple shader attributes inherit pointer properties'
  );
  t.equals(
    attribute.shaderAttributes.instancePositions.divisor,
    1,
    'Shader attribute defines pointer properties'
  );
  t.equals(attribute.getBuffer(), buffer1, 'Attribute has buffer');
  t.equals(
    attribute.getBuffer(),
    attribute.shaderAttributes.positions.getBuffer(),
    'Shader attribute shares parent buffer'
  );
  t.equals(
    attribute.getBuffer(),
    attribute.shaderAttributes.instancePositions.getBuffer(),
    'Shader attribute shares parent buffer'
  );

  attribute.update({buffer: buffer2});
  t.equals(attribute.getBuffer(), buffer2, 'Buffer was updated');
  t.equals(
    attribute.getBuffer(),
    attribute.shaderAttributes.positions.getBuffer(),
    'Shader attribute buffer was updated'
  );
  t.equals(
    attribute.getBuffer(),
    attribute.shaderAttributes.instancePositions.getBuffer(),
    'Shader attribute buffer was updated'
  );

  buffer1.delete();
  buffer2.delete();
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
      bufferLayout: [2, 1, 4, 3]
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
      attribute.allocate(param.numInstances);
      attribute.updateBuffer({
        numInstances: param.numInstances,
        bufferLayout: param.bufferLayout,
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
        bufferLayout: [2, 1, 4, 3, 1]
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
        bufferLayout: [2, 1, 4, 3]
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
        bufferLayout: [2, 1, 4, 3]
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
        bufferLayout: [2, 1, 4, 3, 1, 2]
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
  const attribute2 = new Attribute(gl, {
    id: 'test-attribute-with-shader-attributes',
    type: GL.UNSIGNED_BYTE,
    size: 4,
    normalized: true,
    update: () => {},
    shaderAttributes: {
      shaderAttribute: {offset: 4}
    }
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

  const spy = makeSpy(attribute, 'update');
  t.ok(
    attribute.setExternalBuffer(buffer),
    'should successfully set external buffer if setting external buffer to the same object'
  );
  t.notOk(spy.called, 'Should not call update if setting external buffer to the same object');

  t.ok(attribute.setExternalBuffer(value1), 'should set external buffer to typed array');
  t.is(attribute.value, value1, 'external value is set');
  t.is(attribute.type, GL.FLOAT, 'attribute type is set correctly');

  t.ok(attribute.setExternalBuffer(value2), 'should set external buffer to typed array');
  t.is(attribute.buffer.debugData.constructor.name, 'Uint8Array', 'external value is set');
  t.is(attribute.type, GL.UNSIGNED_BYTE, 'attribute type is set correctly');

  t.ok(attribute2.setExternalBuffer(value2), 'external value is set');
  t.throws(() => attribute2.setExternalBuffer(value1), 'should throw on invalid buffer type');

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
  t.is(attribute.offset, 4, 'attribute accessor is updated');
  t.is(attribute.stride, 8, 'attribute accessor is updated');
  t.is(attribute.value, value1, 'external value is set');
  t.is(attribute.type, GL.FLOAT, 'attribute type is set correctly');

  buffer.delete();
  attribute.delete();
  attribute2.delete();

  t.end();
});

test('Attribute#doublePrecision', t0 => {
  const validateShaderAttributes = (t, attribute, is64Bit) => {
    const shaderAttributes = attribute.getShaderAttributes();
    t.deepEqual(
      Object.keys(shaderAttributes),
      ['positions', 'positions64xyLow'],
      'shaderAttributes generated'
    );

    if (is64Bit) {
      t.is(
        shaderAttributes.positions.externalBuffer,
        attribute.getBuffer(),
        'shaderAttributes.positions buffer'
      );
      t.is(shaderAttributes.positions.offset, 0, 'shaderAttributes.positions offset');
      t.is(shaderAttributes.positions.stride, 24, 'shaderAttributes.positions stride');
      t.is(
        shaderAttributes.positions64xyLow.externalBuffer,
        attribute.getBuffer(),
        'shaderAttributes.positions64xyLow buffer'
      );
      t.is(
        shaderAttributes.positions64xyLow.offset,
        12,
        'shaderAttributes.positions64xyLow offset'
      );
      t.is(
        shaderAttributes.positions64xyLow.stride,
        24,
        'shaderAttributes.positions64xyLow stride'
      );
    } else {
      t.is(
        shaderAttributes.positions.externalBuffer,
        attribute.getBuffer(),
        'shaderAttributes.positions buffer'
      );
      t.is(shaderAttributes.positions.offset, 0, 'shaderAttributes.positions offset');
      t.is(shaderAttributes.positions.stride, 12, 'shaderAttributes.positions stride');
      t.deepEqual(
        shaderAttributes.positions64xyLow,
        [0, 0, 0],
        'shaderAttributes.positions64xyLow is constant'
      );
    }
  };

  test('Attribute#doublePrecision#fp64:true', t => {
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
    t.deepEqual(
      attribute.buffer.debugData.slice(0, 6),
      [3, 4, 5, 4, 4, 5],
      'Attribute value is set'
    );
    validateShaderAttributes(t, attribute, false);

    t.throws(
      () => attribute.setExternalBuffer(new Uint8Array([3, 4, 5, 4, 4, 5])),
      'should throw on invalid buffer'
    );

    attribute.setExternalBuffer(new Float64Array([3, 4, 5, 4, 4, 5]));
    t.ok(attribute.value instanceof Float64Array, 'Attribute is Float64Array');
    t.deepEqual(
      attribute.buffer.debugData.slice(0, 6),
      [3, 4, 5, 0, 0, 0],
      'Attribute value is set'
    );
    validateShaderAttributes(t, attribute, true);

    const buffer = new Buffer(gl, 12);
    attribute.setExternalBuffer(buffer);
    validateShaderAttributes(t, attribute, false);

    buffer.delete();
    attribute.delete();
    t.end();
  });

  test('Attribute#doublePrecision#fp64:false', t => {
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
    t.deepEqual(
      attribute.buffer.debugData.slice(0, 6),
      [3, 4, 5, 4, 4, 5],
      'Attribute value is set'
    );
    validateShaderAttributes(t, attribute, false);

    t.throws(
      () => attribute.setExternalBuffer(new Uint8Array([3, 4, 5, 4, 4, 5])),
      'should throw on invalid buffer'
    );

    attribute.setExternalBuffer(new Float64Array([3, 4, 5, 4, 4, 5]));
    t.ok(attribute.value instanceof Float64Array, 'Attribute is Float64Array');
    t.deepEqual(
      attribute.buffer.debugData.slice(0, 6),
      [3, 4, 5, 0, 0, 0],
      'Attribute value is set'
    );
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
