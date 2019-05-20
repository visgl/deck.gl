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

      t.deepEqual(
        attribute.value,
        testCase[param.title],
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

    t.deepEqual(attribute.value, testCase.value, `${testCase.title} yields correct result`);
  }

  t.end();
});

// t.ok(attribute.allocate(attributeName, allocCount), 'Attribute.allocate function available');
// t.ok(attribute._setExternalBuffer(attributeName, buffer, numInstances), 'Attribute._setExternalBuffer function available');
// t.ok(attribute._analyzeBuffer(attributeName, numInstances), 'Attribute._analyzeBuffer function available');
// t.ok(attribute._updateBuffer({attributeName, numInstances, data, props, context}), 'Attribute._updateBuffer function available');
// t.ok(attribute._updateBufferViaStandardAccessor(data, props), 'Attribute._updateBufferViaStandardAccessor function available');
// t.ok(attribute._validateAttributeDefinition(attributeName), 'Attribute._validateAttributeDefinition function available');
// t.ok(attribute._checkAttributeArray(attributeName, 'Attribute._checkAttributeArray function available');
