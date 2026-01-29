// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable dot-notation, max-statements, no-unused-vars */
import AttributeManager from '@deck.gl/core/lib/attribute/attribute-manager';
import {test, expect} from 'vitest';
import {device} from '@deck.gl/test-utils';

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

test('AttributeManager imports', () => {
  expect(typeof AttributeManager, 'AttributeManager import successful').toBe('function');
});

test('AttributeManager constructor', () => {
  const attributeManager = new AttributeManager(device);

  expect(attributeManager, 'AttributeManager construction successful').toBeTruthy();
});

test('AttributeManager.add', () => {
  const attributeManager = new AttributeManager(device);

  // Now autodeduced from shader declarations
  // expect(//   () => attributeManager.add({positions: {update}}), //   'AttributeManager.add - throws on missing attribute size'
  //).toThrow();

  expect(
    () => attributeManager.add({positions: {size: 2}}),
    'AttributeManager.add - throws on missing attribute update'
  ).toThrow();

  attributeManager.add({positions: {size: 2, accessor: 'getPosition', update}});
  expect(
    attributeManager.getAttributes()['positions'],
    'AttributeManager.add - add attribute successful'
  ).toBeTruthy();
  expect(
    attributeManager.updateTriggers,
    'AttributeManager.add - build update triggers mapping'
  ).toEqual({positions: ['positions'], getPosition: ['positions']});
  attributeManager.addInstanced({instancePositions: {size: 2, accessor: 'getPosition', update}});
  expect(
    attributeManager.getAttributes()['instancePositions'].settings.stepMode,
    'AttributeManager.addInstanced creates attribute with stepMode:instance'
  ).toBe('instance');
});

test('AttributeManager.update', () => {
  const attributeManager = new AttributeManager(device);
  attributeManager.add({positions: {size: 2, update}});

  let attribute;

  // First update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attribute = attributeManager.getAttributes()['positions'];
  expect(ArrayBuffer.isView(attribute.value), 'attribute has typed array').toBeTruthy();
  expect(attribute.value[1], 'attribute value is correct').toBe(1);

  // Second update without invalidation, should not update
  attribute.value[1] = 2;

  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attribute = attributeManager.getAttributes()['positions'];
  expect(ArrayBuffer.isView(attribute.value), 'attribute has typed array').toBeTruthy();
  expect(attribute.value[1], 'Second update, attribute value was not changed').toBe(2);

  // Third update, with invalidation, should update
  attributeManager.invalidateAll();
  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attribute = attributeManager.getAttributes()['positions'];
  expect(ArrayBuffer.isView(attribute.value), 'attribute has typed array').toBeTruthy();
  expect(attribute.value[1], 'Third update, attribute value was updated').toBe(1);
});

test('AttributeManager.update - 0 numInstances', () => {
  const attributeManager = new AttributeManager(device);
  attributeManager.add({positions: {size: 2, update}});

  // First update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 0,
    data: []
  });

  const attribute = attributeManager.getAttributes()['positions'];
  expect(ArrayBuffer.isView(attribute.value), 'attribute has typed array').toBeTruthy();
});

test('AttributeManager.update - constant attribute', () => {
  const attributeManager = new AttributeManager(device);
  let updateCalled = 0;
  attributeManager.add({
    colors: {
      size: 3,
      update: (attr, {numInstances, data, props}) => {
        updateCalled++;
        if (Array.isArray(props.getColor)) {
          attr.constant = true;
          attr.value = props.getColor;
        } else {
          for (let i = 0, j = 0; i < numInstances; i++) {
            const color = props.getColor(data[i]);
            attr.value[j++] = color[0];
            attr.value[j++] = color[1];
            attr.value[j++] = color[2];
          }
        }
      }
    }
  });

  const attribute = attributeManager.getAttributes()['colors'];
  attribute.constant = true;
  attribute.value = [0, 1, 0];

  // First update, should set constant value
  attributeManager.update({
    numInstances: 2,
    props: {getColor: [0.5, 0.75, 0.125]},
    data: [1, 2]
  });

  expect(updateCalled, 'should not call updater for constant attribute').toBe(0);
  expect(attribute.state.allocatedValue, 'should not allocate for constant attribute').toBe(null);
  expect(attribute.state.constant, 'constant value is set').toBeTruthy();

  attribute.constant = false;
  attributeManager.invalidate('colors');

  // second update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 2,
    props: {getColor: [0.5, 0.75, 0.125]},
    data: [1, 2]
  });

  expect(updateCalled, 'updater is called').toBe(1);
  expect(attribute.state.allocatedValue, 'should allocate new value array').toBeTruthy();
  expect(attribute.value, 'correct attribute value').toEqual([0.5, 0.75, 0.125]);
  expect(attribute.state.constant, 'constant value is set').toBeTruthy();

  attributeManager.invalidate('colors');

  // third update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 2,
    props: {getColor: x => [x, x, x]},
    data: [1, 2]
  });

  expect(updateCalled, 'updater is called').toBe(2);
  expect(attribute.value.slice(0, 6), 'correct attribute value').toEqual([1, 1, 1, 2, 2, 2]);
  expect(attribute.state.constant, 'no longer a constant').toBeFalsy();
});

test('AttributeManager.update - external virtual buffers', () => {
  const attributeManager = new AttributeManager(device);

  const dummyUpdate = () => {
    throw new Error('updater should not be called when external buffer is present');
  };

  attributeManager.add({
    positions: {size: 2, update: dummyUpdate},
    colors: {size: 3, type: 'uint8', update: dummyUpdate}
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
  expect(ArrayBuffer.isView(attribute.value), 'positions attribute has typed array').toBeTruthy();
  attribute = attributeManager.getAttributes()['colors'];
  expect(ArrayBuffer.isView(attribute.value), 'colors attribute has typed array').toBeTruthy();

  attributeManager.update({
    numInstances: 1,
    buffers: {
      positions: new Float32Array([0, 0]),
      colors: new Float32Array([0, 0, 0])
    }
  });

  expect(attribute.getBufferLayout().attributes[0].format, 'colors is set to correct format').toBe(
    'float32x3'
  );

  attributeManager.update({
    numInstances: 1,
    buffers: {
      positions: new Float32Array([0, 0]),
      colors: new Uint32Array([0, 0, 0])
    }
  });
  expect(attribute.getBufferLayout().attributes[0].format, 'colors is set to correct format').toBe(
    'uint32x3'
  );
});

test('AttributeManager.update - external logical buffers', () => {
  const attributeManager = new AttributeManager(device);

  const dummyAccessor = () => {
    throw new Error('accessor should not be called when external buffer is present');
  };

  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'},
    colors: {size: 4, type: 'uint8', accessor: 'getColor', defaultValue: [0, 0, 0, 255]},
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
  expect(attribute.value, 'positions attribute has value').toEqual([1, 1, 2, 2]);

  expect(attribute.getVertexOffset(0), 'getVertexOffset returns correct result').toBe(0);
  expect(attribute.getVertexOffset(1), 'getVertexOffset returns correct result').toBe(2);
  expect(attribute.getVertexOffset(2), 'getVertexOffset returns correct result').toBe(4);

  attribute = attributeManager.getAttributes()['colors'];
  expect(attribute.value, 'colors attribute has value').toEqual([255, 0, 0, 0, 255, 0]);
  expect(attribute.getAccessor().size, 'colors attribute has correct size').toBe(3);

  attribute = attributeManager.getAttributes()['types'];
  expect(attribute.value.slice(0, 2), 'types attribute has value').toEqual([0, 3]);
});

test('AttributeManager.update - external logical buffers - variable width', () => {
  const attributeManager = new AttributeManager(device);

  const dummyAccessor = () => {
    throw new Error('accessor should not be called when external buffer is present');
  };

  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'},
    colors: {size: 4, type: 'uint8', accessor: 'getColor', defaultValue: [0, 0, 0, 255]}
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
  expect(attribute.value.slice(0, 6), 'positions attribute has value').toEqual([1, 1, 1, 1, 2, 2]);

  expect(attribute.getVertexOffset(0), 'getVertexOffset returns correct result').toBe(0);
  expect(attribute.getVertexOffset(1), 'getVertexOffset returns correct result').toBe(4);
  expect(attribute.getVertexOffset(2), 'getVertexOffset returns correct result').toBe(6);

  attribute = attributeManager.getAttributes()['colors'];
  expect(attribute.value.slice(0, 12), 'colors attribute has value').toEqual([
    255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255
  ]);
});

test('AttributeManager.invalidate', () => {
  const attributeManager = new AttributeManager(device);
  attributeManager.add({positions: {size: 2, update}});
  attributeManager.add({colors: {size: 2, accessor: 'getColor', update}});
  attributeManager.update({
    numInstances: 1,
    data: [{}]
  });

  attributeManager.invalidate('positions');
  expect(
    attributeManager.getAttributes()['positions'].needsUpdate,
    'invalidated attribute by name'
  ).toBeTruthy();

  attributeManager.invalidate('getColor');
  expect(
    attributeManager.getAttributes()['colors'].needsUpdate,
    'invalidated attribute by accessor name'
  ).toBeTruthy();
});

test('AttributeManager.getBufferLayouts', () => {
  const attributeManager = new AttributeManager(device);
  attributeManager.add({
    // indexed attribute
    indices: {size: 1, isIndexed: true, update},
    // non-instanced attribute
    colors: {size: 4, type: 'unorm8', stepMode: 'vertex', accessor: 'getColor'},
    // instanced attribute
    instanceColors: {size: 4, type: 'unorm8', stepMode: 'instance', accessor: 'getColor'},
    // dynamically assigned stepMode
    positions: {size: 3, type: 'float64', fp64: true, stepMode: 'dynamic', accessor: 'getPosition'}
  });

  expect(attributeManager.getBufferLayouts(), 'getBufferLayouts()').toEqual([
    {
      name: 'indices',
      byteStride: 4,
      attributes: [
        {
          attribute: 'indices',
          format: 'uint32',
          byteOffset: 0
        }
      ],
      stepMode: 'vertex'
    },
    {
      name: 'colors',
      byteStride: 4,
      attributes: [
        {
          attribute: 'colors',
          format: 'unorm8x4',
          byteOffset: 0
        }
      ],
      stepMode: 'vertex'
    },
    {
      name: 'instanceColors',
      byteStride: 4,
      attributes: [
        {
          attribute: 'instanceColors',
          format: 'unorm8x4',
          byteOffset: 0
        }
      ],
      stepMode: 'instance'
    },
    {
      name: 'positions',
      byteStride: 24,
      attributes: [
        {
          attribute: 'positions',
          format: 'float32x3',
          byteOffset: 0
        },
        {
          attribute: 'positions64Low',
          format: 'float32x3',
          byteOffset: 12
        }
      ],
      stepMode: 'instance'
    }
  ]);

  expect(
    attributeManager.getBufferLayouts({isInstanced: false})[3].stepMode,
    'dynamic attribute.stepMode in nonInstancedModel'
  ).toBe('vertex');
  expect(
    attributeManager.getBufferLayouts({isInstanced: true})[3].stepMode,
    'dynamic attribute.stepMode in instancedModel'
  ).toBe('instance');
});
