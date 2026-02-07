// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable dot-notation, max-statements, no-unused-vars, no-console */
/* global console */
import {test, expect, describe, vi} from 'vitest';
import {device} from '@deck.gl/test-utils/vitest';

import Attribute from '@deck.gl/core/lib/attribute/attribute';
import {Buffer} from '@luma.gl/core';

test('Attribute#imports', () => {
  expect(typeof Attribute, 'Attribute import successful').toBe('function');
});

test('Attribute#constructor', () => {
  const attribute = new Attribute(device, {size: 1, accessor: 'a'});

  expect(attribute, 'Attribute construction successful').toBeTruthy();
  expect(attribute.allocate, 'Attribute.allocate function available').toBeTruthy();
  expect(attribute.updateBuffer, 'Attribute.update function available').toBeTruthy();

  expect(() => new Attribute(device, {size: 1}), 'Attribute missing update option').toThrow();
});

test('Attribute#delete', () => {
  const attribute = new Attribute(device, {size: 1, accessor: 'a'});
  attribute.setData(new Float32Array(4));

  expect(attribute._buffer, 'Attribute created Buffer object').toBeTruthy();

  attribute.delete();
  expect(attribute._buffer, 'Attribute deleted Buffer object').toBeFalsy();
});

test('Attribute#getUpdateTriggers', () => {
  const update = () => {};

  let attribute = new Attribute(device, {id: 'indices', isIndexed: true, size: 1, update});
  expect(attribute.getUpdateTriggers(), 'returns correct update triggers').toEqual(['indices']);

  attribute = new Attribute(device, {id: 'instanceSizes', size: 1, accessor: 'getSize', update});
  expect(attribute.getUpdateTriggers(), 'returns correct update triggers').toEqual([
    'instanceSizes',
    'getSize'
  ]);

  attribute = new Attribute(device, {
    id: 'instancePositions',
    size: 1,
    accessor: ['getPosition', 'getElevation'],
    update
  });
  expect(attribute.getUpdateTriggers(), 'returns correct update triggers').toEqual([
    'instancePositions',
    'getPosition',
    'getElevation'
  ]);
});

test('Attribute#allocate', () => {
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

  expect(attributeNoAlloc.allocate(2), 'Should not allocate if noAlloc is set').toBeFalsy();

  expect(attribute.allocate(2), 'allocate successful').toBeTruthy();
  const allocatedValue = attribute.value;
  expect(allocatedValue.length >= 4, 'allocated value is large enough').toBeTruthy();

  expect(attribute.allocate(4), 'allocate successful').toBeTruthy();
  expect(attribute.value, 'reused the same typed array').toBe(allocatedValue);

  attribute.setExternalBuffer(externalValue);
  expect(
    attributeNoAlloc.allocate(4),
    'Should not allocate if external buffer is used'
  ).toBeFalsy();

  attribute.setExternalBuffer(null);
  expect(attribute.allocate(4), 'allocate successful').toBeTruthy();
  expect(attribute.value, 'reused the same typed array').toBe(allocatedValue);

  attribute.setConstantValue(this, [1, 1]);
  expect(attribute.value, 'value overwritten by external constant').toEqual([1, 1]);

  attribute.setConstantValue(this, undefined);
  expect(attribute.allocate(4), 'allocate successful').toBeTruthy();
  expect(attribute.value, 'reused the same typed array').toBe(allocatedValue);

  expect(attribute.allocate(8), 'allocate successful').toBeTruthy();
  expect(attribute.value, 'created new typed array').not.toBe(allocatedValue);

  attribute.delete();
});

test('Attribute#setConstantValue', () => {
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
  expect(
    attribute.getValue().positions instanceof Buffer,
    'attribute is using packed buffer'
  ).toBeTruthy();
  attribute.needsRedraw({clearChangedFlags: true});

  attribute.setConstantValue(this, [0, 0, 0]);
  expect(attribute.getValue().positions, 'attribute set to constant value').toEqual([0, 0, 0]);
  expect(
    attribute.needsRedraw({clearChangedFlags: true}),
    'attribute marked needs redraw'
  ).toBeTruthy();

  attribute.setConstantValue(this, [0, 0, 0]);
  expect(
    attribute.needsRedraw({clearChangedFlags: true}),
    'attribute should not need redraw'
  ).toBeFalsy();

  attribute.setConstantValue(this, [0, 0, 1]);
  expect(attribute.getValue().positions, 'attribute set to constant value').toEqual([0, 0, 1]);
  expect(
    attribute.needsRedraw({clearChangedFlags: true}),
    'attribute marked needs redraw'
  ).toBeTruthy();

  attribute.delete();

  attribute = new Attribute(device, {
    id: 'colors',
    size: 3,
    type: 'unorm8',
    accessor: 'getColor'
  });

  attribute.setConstantValue(this, [255, 255, 0]);
  expect(attribute.getValue().colors, 'constant value is normalized').toEqual([1, 1, 0]);
});

test('Attribute#allocate - partial', async () => {
  let positions = new Attribute(device, {
    id: 'positions',
    update: attr => {
      attr.value[0] = 180;
      attr.value[1] = 90;
    },
    size: 2
  });

  const readDataFromBuffer = async () => {
    const bytes = await positions.buffer.readAsync();
    return new Float32Array(bytes.buffer);
  };

  positions.allocate(1);
  let value = positions.value;
  value[0] = 180;
  value[1] = 90;
  // make sure buffer is created
  positions.updateBuffer({});
  expect((await readDataFromBuffer()).slice(0, 2), 'value uploaded to buffer').toEqual([180, 90]);

  positions.setNeedsUpdate('test', {startRow: 1, endRow: 2});
  positions.allocate(value.length / 2 + 1); // array might be overallocated
  expect(positions.value, 'a new value array is allocated').not.toBe(value);
  expect(positions.value.slice(0, 2), 'old value is copied to new array').toEqual([180, 90]);
  expect((await readDataFromBuffer()).slice(0, 2), 'old value is copied to buffer').toEqual([
    180, 90
  ]);

  positions.delete();

  // double precision
  positions = new Attribute(device, {
    id: 'positions64',
    type: 'float64',
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
  expect((await readDataFromBuffer()).slice(0, 4), 'value uploaded to buffer').toEqual([
    179.89999389648438, 89.9000015258789, 0.00000610351571594947, -0.0000015258789289873675
  ]);

  positions.setNeedsUpdate('test', {startRow: 1, endRow: 2});
  positions.allocate(value.length / 2 + 1); // array might be overallocated
  expect(positions.value, 'a new value array is allocated').not.toBe(value);
  expect(positions.value.slice(0, 2), 'old value is copied to new array').toEqual([179.9, 89.9]);
  expect((await readDataFromBuffer()).slice(0, 4), 'old value is copied to buffer').toEqual([
    179.89999389648438, 89.9000015258789, 0.00000610351571594947, -0.0000015258789289873675
  ]);

  positions.delete();
});

test('Attribute#shaderAttributes', () => {
  const update = () => {};

  const buffer1 = device.createBuffer({byteLength: 10});

  const attribute = new Attribute(device, {
    id: 'positions',
    update,
    size: 3,
    stepMode: 'instance',
    shaderAttributes: {
      nextPositions: {
        vertexOffset: 1
      }
    }
  });
  attribute.setData({buffer: buffer1});

  const bufferLayout = attribute.getBufferLayout();
  expect(bufferLayout.byteStride, 'Buffer layout has correct stride').toBe(12);
  let attributeLayout = bufferLayout.attributes[0];
  expect(attributeLayout.format, 'Attribute position has correct format').toBe('float32x3');
  expect(attributeLayout.byteOffset, 'Attribute position has correct offset').toBe(0);
  attributeLayout = bufferLayout.attributes[1];
  expect(attributeLayout.format, 'Attribute nextPositions has correct format').toBe('float32x3');
  expect(attributeLayout.byteOffset, 'Attribute nextPositions has correct offset').toBe(12);

  expect(attribute.getValue(), 'Attribute has buffer').toEqual({
    positions: buffer1,
    nextPositions: buffer1
  });

  buffer1.delete();
  attribute.delete();
});

test('Attribute#updateBuffer', () => {
  const TEST_PROPS = {
    data: [
      {id: 'A', value: 10, color: [255, 0, 0]},
      {id: 'B', value: 20, color: [128, 128, 128, 128]},
      {id: 'C', value: 7, color: [255, 255, 255]},
      {id: 'D', value: 0, color: [0, 0, 0, 128]},
      {id: 'E', value: 0, color: undefined}
    ],
    getColor: d => d.color,
    getValue: d => d.value,
    getValueConstant: [20]
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
        type: 'float32',
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
        type: 'uint8',
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
        type: 'float32',
        size: 1,
        accessor: 'getValue',
        transform: x => x * 2
      }),
      standard: [20, 40, 14, 0],
      'variable size': [20, 20, 40, 14, 14, 14, 14, 0, 0, 0]
    },
    {
      title: 'constant accessor with transform',
      attribute: new Attribute(device, {
        id: 'values',
        type: 'float32',
        size: 1,
        accessor: 'getValueConstant',
        transform: x => x * 2
      }),
      standard: [40, 40, 40, 40],
      'variable size': [40, 40, 40, 40, 40, 40, 40, 40, 40, 40]
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

      expect(
        attribute.value.slice(0, result.length),
        `${testCase.title} updates attribute buffer`
      ).toEqual(result);

      attribute.delete();
    }
  }
});

test('Attribute#updateBuffer _checkAttributeArray', () => {
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

    expect(
      attribute.value.slice(0, result.length),
      `Attribute with size ${size} passed _checkAttributeArray after update`
    ).toEqual(result);

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
    expect(() => attribute.updateBuffer({numInstances: 1})).toThrow();

    attribute.delete();
  }
});

test('Attribute#updateBuffer#noAlloc', () => {
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
  expect(attribute.buffer.byteLength, `overallocated buffer for ${value.byteLength} bytes`).toBe(
    32
  );

  value = new Float32Array([1, 2]);
  attribute.setNeedsUpdate(true);
  attribute.updateBuffer({data: value});
  expect(attribute.buffer.byteLength, `buffer is big enough ${value.byteLength} bytes`).toBe(32);

  // 4 vertices + 1 vertexOffset => 5 vertices * 2 floats => 40 bytes
  value = new Float32Array([1, 1, 2, 2, 3, 3, 4, 4]);
  attribute.setNeedsUpdate(true);
  attribute.updateBuffer({data: value});
  expect(attribute.buffer.byteLength, `re-allocated buffer for ${value.byteLength} bytes`).toBe(56);

  attribute.delete();
});

test('Attribute#standard accessor - variable width', () => {
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
        type: 'float32',
        size: 1,
        accessor: 'getValue'
      }),
      result: [10, 11, 20, 30, 31, 32]
    },
    {
      attribute: new Attribute(device, {
        id: 'colors',
        type: 'uint8',
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

    expect(attribute.value.slice(0, result.length), 'attribute buffer is updated').toEqual(result);
  }
});

test('Attribute#updateBuffer - partial', () => {
  let accessorCalled = 0;

  const TEST_PROPS = {
    data: [{id: 'A'}, {id: 'B'}, {id: 'C'}, {id: 'D'}, {id: 'E'}, {id: 'F'}],
    // This accessor checks two things: how many times an accessor is called,
    // and whether `index` is consistently populated for each object
    getValue: (d, {index}) => accessorCalled++ + index * 10
  };

  const ATTRIBUTE_1 = new Attribute(device, {
    id: 'values-1',
    type: 'float32',
    size: 1,
    accessor: 'getValue'
  });

  const ATTRIBUTE_2 = new Attribute(device, {
    id: 'values-2',
    type: 'float32',
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

    expect(
      attribute.value.slice(0, testCase.value.length),
      `${testCase.title} yields correct result`
    ).toEqual(testCase.value);
  }

  ATTRIBUTE_1.delete();
  ATTRIBUTE_2.delete();
});

test('Attribute#setExternalBuffer', () => {
  const attribute = new Attribute(device, {
    id: 'test-attribute',
    type: 'float32',
    size: 3,
    update: () => {}
  });
  const buffer = device.createBuffer({byteLength: 12});
  const value1 = new Float32Array(4);
  const value2 = new Uint8Array(4);

  attribute.setNeedsUpdate();
  expect(
    attribute.setExternalBuffer(null),
    'should do nothing if setting external buffer to null'
  ).toBeFalsy();
  expect(attribute.needsUpdate(), 'attribute still needs update').toBeTruthy();

  expect(
    attribute.setExternalBuffer(buffer),
    'should set external buffer to Buffer object'
  ).toBeTruthy();
  expect(attribute.getBuffer(), 'external buffer is set').toBe(buffer);
  expect(attribute.needsUpdate(), 'attribute is updated').toBeFalsy();

  const spy = vi.spyOn(attribute, 'setData');
  expect(
    attribute.setExternalBuffer(buffer),
    'should successfully set external buffer if setting external buffer to the same object'
  ).toBeTruthy();
  expect(
    spy,
    'Should not call update if setting external buffer to the same object'
  ).not.toHaveBeenCalled();

  expect(
    attribute.setExternalBuffer(value1),
    'should set external buffer to typed array'
  ).toBeTruthy();
  expect(attribute.value, 'external value is set').toBe(value1);
  expect(attribute.getAccessor().type, 'attribute type is set correctly').toBe('float32');

  expect(
    attribute.setExternalBuffer(value2),
    'should set external buffer to typed array'
  ).toBeTruthy();
  expect(attribute.getAccessor().type, 'attribute type is set correctly').toBe('uint8');

  spy.mockClear();
  expect(
    attribute.setExternalBuffer(value2),
    'should successfully set external buffer if setting external buffer to the same object'
  ).toBeTruthy();
  expect(
    spy,
    'Should not call update if setting external buffer to the same object'
  ).not.toHaveBeenCalled();

  expect(
    attribute.setExternalBuffer({
      offset: 4,
      stride: 8,
      value: value1
    }),
    'should set external buffer to attribute descriptor'
  ).toBeTruthy();
  let attributeAccessor = attribute.getAccessor();
  expect(attributeAccessor.offset, 'attribute accessor is updated').toBe(4);
  expect(attributeAccessor.stride, 'attribute accessor is updated').toBe(8);
  expect(attribute.value, 'external value is set').toBe(value1);
  expect(attributeAccessor.type, 'attribute type is set correctly').toBe('float32');

  expect(
    attribute.setExternalBuffer({
      offset: 4,
      stride: 8,
      value: value1,
      type: 'uint8'
    }),
    'should set external buffer to attribute descriptor'
  ).toBeTruthy();
  attributeAccessor = attribute.getAccessor();
  expect(attributeAccessor.type, 'attribute type is set correctly').toBe('uint8');

  buffer.delete();
  attribute.delete();
});

test('Attribute#setExternalBuffer#shaderAttributes', () => {
  const attribute = new Attribute(device, {
    id: 'test-attribute-with-shader-attributes',
    type: 'unorm8',
    size: 4,
    update: () => {},
    shaderAttributes: {
      a: {size: 1, elementOffset: 1}
    }
  });
  const attribute2 = new Attribute(device, {
    id: 'test-attribute-with-shader-attributes',
    type: 'float64',
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
  expect(bufferLayout.byteStride, 'Buffer layout has correct stride').toBe(4);
  expect(bufferLayout.attributes[1].format, 'Attribute a has correct format').toBe('unorm8');
  expect(bufferLayout.attributes[1].byteOffset, 'Attribute a has correct offset').toBe(1);

  attribute.setExternalBuffer({value: value8, stride: 8, offset: 2});
  bufferLayout = attribute.getBufferLayout();
  expect(bufferLayout.byteStride, 'Buffer layout has correct stride').toBe(8);
  expect(bufferLayout.attributes[1].format, 'Attribute a has correct format').toBe('unorm8');
  expect(bufferLayout.attributes[1].byteOffset, 'Attribute a has correct offset').toBe(3);

  attribute.setExternalBuffer({value: value32, offset: 2});
  bufferLayout = attribute.getBufferLayout();
  expect(bufferLayout.byteStride, 'Buffer layout has correct stride').toBe(16);
  expect(bufferLayout.attributes[1].format, 'Attribute a has correct format').toBe('float32');
  expect(bufferLayout.attributes[1].byteOffset, 'Attribute a has correct offset').toBe(6);

  attribute2.setExternalBuffer(value32);
  bufferLayout = attribute2.getBufferLayout();
  expect(bufferLayout.byteStride, 'Buffer layout has correct stride').toBe(16);
  expect(bufferLayout.attributes[2].format, 'Attribute a has correct format').toBe('float32x4');
  expect(bufferLayout.attributes[2].byteOffset, 'Attribute a has correct offset').toBe(0);
  expect(bufferLayout.attributes[3].format, 'Attribute a64Low has correct format').toBe(
    'float32x4'
  );
  expect(bufferLayout.attributes[3].byteOffset, 'Attribute a64Low has correct offset').toBe(16);
  expect(attribute2.getValue().a64Low, 'shaderAttribute low part is constant').toEqual([
    0, 0, 0, 0
  ]);

  attribute2.setExternalBuffer({value: value64, stride: 48, offset: 8});
  bufferLayout = attribute2.getBufferLayout();
  expect(bufferLayout.byteStride, 'Buffer layout has correct stride').toBe(48);
  expect(bufferLayout.attributes[2].format, 'Attribute a has correct format').toBe('float32x4');
  expect(bufferLayout.attributes[2].byteOffset, 'Attribute a has correct offset').toBe(8);
  expect(bufferLayout.attributes[3].format, 'Attribute a64Low has correct format').toBe(
    'float32x4'
  );
  expect(bufferLayout.attributes[3].byteOffset, 'Attribute a64Low has correct offset').toBe(24);
  expect(
    attribute2.getValue().a64Low instanceof Buffer,
    'shaderAttribute low part is buffer'
  ).toBeTruthy();

  attribute.delete();
  attribute2.delete();
});

test('Attribute#setBinaryValue', () => {
  let attribute = new Attribute(device, {
    id: 'test-attribute',
    type: 'float32',
    size: 3,
    update: () => {}
  });
  let value = new Float32Array(12);

  attribute.setNeedsUpdate();
  expect(
    attribute.setBinaryValue(null),
    'should do nothing if setting external buffer to null'
  ).toBeFalsy();
  expect(attribute.needsUpdate(), 'attribute still needs update').toBeTruthy();

  const spy = vi.spyOn(attribute, 'setData');
  expect(attribute.setBinaryValue(value), 'should use external binary value').toBeTruthy();
  expect(spy, 'setData is called').toHaveBeenCalledTimes(1);
  expect(attribute.needsUpdate(), 'attribute is updated').toBeFalsy();

  attribute.setNeedsUpdate();
  expect(attribute.setBinaryValue(value), 'should use external binary value').toBeTruthy();
  expect(spy, 'setData is called only once on the same data').toHaveBeenCalledTimes(1);
  expect(attribute.needsUpdate(), 'attribute is updated').toBeFalsy();

  spy.mockClear();
  attribute.delete();

  attribute = new Attribute(device, {
    id: 'test-attribute',
    type: 'float32',
    size: 3,
    noAlloc: true,
    update: () => {}
  });
  attribute.setNeedsUpdate();
  expect(attribute.setBinaryValue(value), 'should do nothing if noAlloc').toBeFalsy();
  expect(attribute.needsUpdate(), 'attribute still needs update').toBeTruthy();

  attribute = new Attribute(device, {
    id: 'test-attribute-with-transform',
    type: 'uint8',
    size: 4,
    defaultValue: [0, 0, 0, 255],
    transform: x => x + 1,
    update: () => {}
  });
  value = {value: new Uint8Array(12), size: 3};

  attribute.setNeedsUpdate();
  expect(attribute.setBinaryValue(value), 'should require update').toBeFalsy();
  expect(attribute.state.binaryAccessor, 'binaryAccessor is assigned').toBeTruthy();
  expect(attribute.needsUpdate(), 'attribute still needs update').toBeTruthy();

  expect(
    () => attribute.setBinaryValue([0, 1, 2, 3]),
    'should throw if external value is invalid'
  ).toThrow();

  attribute.delete();
});

describe('Attribute#doublePrecision', () => {
  const validateShaderAttributes = (attribute, is64Bit) => {
    const bufferLayout = attribute.getBufferLayout();
    expect(
      bufferLayout.attributes.map(a => a.attribute),
      'buffer layout generated'
    ).toEqual(['positions', 'positions64Low']);

    if (is64Bit) {
      expect(bufferLayout.byteStride, 'Buffer layout has correct stride').toBe(24);
      expect(bufferLayout.attributes[0].byteOffset, 'Attribute positions has correct offset').toBe(
        0
      );
      expect(
        bufferLayout.attributes[1].byteOffset,
        'Attribute positions64Low has correct offset'
      ).toBe(12);

      const values = attribute.getValue();
      expect(values.positions, 'positions value is buffer').toBe(attribute.getBuffer());
      expect(values.positions64Low, 'positions64Low value is buffer').toBe(attribute.getBuffer());
    } else {
      expect(bufferLayout.byteStride, 'Buffer layout has correct stride').toBe(12);
      expect(bufferLayout.attributes[0].byteOffset, 'Attribute positions has correct offset').toBe(
        0
      );

      const values = attribute.getValue();
      expect(values.positions, 'positions value is buffer').toBe(attribute.getBuffer());
      expect(values.positions64Low, 'positions64Low value is buffer').toEqual([0, 0, 0]);
    }
  };

  test('Attribute#doublePrecision#fp64:true', () => {
    const attribute = new Attribute(device, {
      id: 'positions',
      type: 'float64',
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
    expect(attribute.value instanceof Float64Array, 'Attribute is Float64Array').toBeTruthy();
    expect(attribute.value.slice(0, 6), 'Attribute value is populated').toEqual([0, 1, 2, 1, 1, 2]);
    validateShaderAttributes(attribute, true);

    attribute.setExternalBuffer(new Uint32Array([3, 4, 5, 4, 4, 5]));
    expect(attribute.value instanceof Uint32Array, 'Attribute is Uint32Array').toBeTruthy();
    validateShaderAttributes(attribute, false);

    expect(
      () => attribute.setExternalBuffer(new Uint8Array([3, 4, 5, 4, 4, 5])),
      'should throw on invalid buffer'
    ).toThrow();

    attribute.setExternalBuffer(new Float64Array([3, 4, 5, 4, 4, 5]));
    expect(attribute.value instanceof Float64Array, 'Attribute is Float64Array').toBeTruthy();
    validateShaderAttributes(attribute, true);

    attribute.delete();
  });

  test('Attribute#doublePrecision#fp64:false', () => {
    const attribute = new Attribute(device, {
      id: 'positions',
      type: 'float64',
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
    expect(attribute.value instanceof Float32Array, 'Attribute is Float32Array').toBeTruthy();
    expect(attribute.value.slice(0, 6), 'Attribute value is populated').toEqual([0, 1, 2, 1, 1, 2]);
    validateShaderAttributes(attribute, false);

    attribute.setExternalBuffer(new Uint32Array([3, 4, 5, 4, 4, 5]));
    expect(attribute.value instanceof Uint32Array, 'Attribute is Uint32Array').toBeTruthy();
    validateShaderAttributes(attribute, false);

    expect(
      () => attribute.setExternalBuffer(new Uint8Array([3, 4, 5, 4, 4, 5])),
      'should throw on invalid buffer'
    ).toThrow();

    attribute.setExternalBuffer(new Float64Array([3, 4, 5, 4, 4, 5]));
    expect(attribute.value instanceof Float64Array, 'Attribute is Float64Array').toBeTruthy();
    validateShaderAttributes(attribute, true);

    const buffer = device.createBuffer({byteLength: 12});
    attribute.setExternalBuffer(buffer);
    validateShaderAttributes(attribute, false);

    buffer.delete();
    attribute.delete();
  });
});

test('Attribute#updateBuffer', () => {
  const attribute = new Attribute(device, {
    id: 'positions',
    type: 'float64',
    fp64: false,
    size: 3,
    accessor: 'getPosition'
  });

  expect(attribute.getBounds(), 'Empty attribute does not have bounds').toBe(null);

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
  expect(bounds, 'Calculated attribute bounds').toEqual([
    [0, 1, -1],
    [2, 1, -1]
  ]);
  expect(bounds, 'bounds is cached').toBe(attribute.getBounds());

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
  expect(bounds, 'Calculated attribute bounds').toEqual([
    [0, 1, 2],
    [1, 1, 2]
  ]);
  expect(bounds, 'bounds is cached').toBe(attribute.getBounds());

  attribute.setNeedsUpdate();
  attribute.setConstantValue(this, [-1, 0, 1]);

  bounds = attribute.getBounds();
  expect(bounds, 'Calculated attribute bounds').toEqual([
    [-1, 0, 1],
    [-1, 0, 1]
  ]);
  expect(bounds, 'bounds is cached').toBe(attribute.getBounds());

  attribute.delete();
});
