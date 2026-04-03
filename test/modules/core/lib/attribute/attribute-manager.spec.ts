// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable dot-notation, max-statements, no-unused-vars */
import AttributeManager from '@deck.gl/core/lib/attribute/attribute-manager';
import {test, expect, vi} from 'vitest';
import {device} from '@deck.gl/test-utils/vitest';

function createWebGPUDevice() {
  return Object.defineProperty(Object.create(device), 'type', {value: 'webgpu'});
}

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
  expect(
    attribute.state.constant,
    'webgl keeps managed constants as constant attributes'
  ).toBeTruthy();
  expect(attribute.value, 'constant value stays compact when not materialized').toEqual([0, 1, 0]);

  attribute.constant = false;
  attributeManager.invalidate('colors');

  // second update, should autoalloc and update the value array
  attributeManager.update({
    numInstances: 2,
    props: {getColor: [0.5, 0.75, 0.125]},
    data: [1, 2]
  });

  expect(updateCalled, 'updater is called').toBe(1);
  expect(
    attribute.state.allocatedValue,
    'constant updater reuses the allocated working array even when the resolved value is constant'
  ).toBeTruthy();
  expect(attribute.value, 'correct attribute value').toEqual([0.5, 0.75, 0.125]);
  expect(
    attribute.state.constant,
    'updater-backed constant still uses the constant flag'
  ).toBeTruthy();

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

test('AttributeManager.update - constant attribute on WebGPU remains buffer-backed', () => {
  const attributeManager = new AttributeManager(createWebGPUDevice(), {
    generateConstantAttributes: false
  });
  attributeManager.add({
    colors: {
      size: 3,
      accessor: 'getColor',
      update: (attr, {numInstances, props}) => {
        if (Array.isArray(props.getColor)) {
          attr.constant = true;
          attr.value = props.getColor;
        } else {
          for (let i = 0, j = 0; i < numInstances; i++) {
            const color = props.getColor(i);
            attr.value[j++] = color[0];
            attr.value[j++] = color[1];
            attr.value[j++] = color[2];
          }
        }
      }
    }
  });

  attributeManager.update({
    numInstances: 2,
    props: {getColor: [0.25, 0.5, 0.75]},
    data: [1, 2]
  });

  const attribute = attributeManager.getAttributes().colors;
  expect(
    attributeManager.generateConstantAttributes,
    'webgpu ignores generateConstantAttributes: false'
  ).toBe(true);
  expect(attribute.state.constant, 'managed constants stay buffer-backed on webgpu').toBeFalsy();
  expect(attribute.value, 'constant value is expanded for publication').toEqual([
    0.25, 0.5, 0.75, 0.25, 0.5, 0.75
  ]);
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

test('AttributeManager.getBufferLayouts - packed buffers', () => {
  const webgpuDevice = createWebGPUDevice();
  const attributeManager = new AttributeManager(webgpuDevice);

  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize',
      bufferGroup: 'group-a'
    },
    instanceAngles: {
      size: 1,
      accessor: 'getAngle',
      bufferGroup: 'group-a'
    },
    instanceColors: {
      size: 4,
      type: 'unorm8',
      accessor: 'getColor',
      bufferGroup: 'group-a'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {size: 1, angle: 10, color: [255, 0, 0, 255]},
      {size: 2, angle: 20, color: [0, 255, 0, 255]}
    ],
    props: {
      getSize: x => x.size,
      getAngle: x => x.angle,
      getColor: x => x.color
    }
  });

  expect(attributeManager.getBufferLayouts()).toEqual([
    {
      name: 'group-a',
      byteStride: 4,
      attributes: [
        {attribute: 'instanceAngles', format: 'float32', byteOffset: 0},
        {attribute: 'instanceColors', format: 'unorm8x4', byteOffset: 16},
        {attribute: 'instanceSizes', format: 'float32', byteOffset: 32}
      ],
      stepMode: 'instance'
    }
  ]);

  const packedAttributes = attributeManager.getPackedBufferAttributes(
    attributeManager.getAttributes()
  );
  expect(packedAttributes['group-a'], 'group publishes one shared buffer').toBeTruthy();
});

test('AttributeManager.getBufferLayouts - implicit single-attribute groups', () => {
  const attributeManager = new AttributeManager(device);

  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize'
    },
    instanceAngles: {
      size: 1,
      accessor: 'getAngle'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {size: 1, angle: 10},
      {size: 2, angle: 20}
    ],
    props: {
      getSize: x => x.size,
      getAngle: x => x.angle
    }
  });

  expect(attributeManager.getBufferLayouts()).toEqual([
    {
      name: 'instanceSizes',
      byteStride: 4,
      attributes: [{attribute: 'instanceSizes', format: 'float32', byteOffset: 0}],
      stepMode: 'instance'
    },
    {
      name: 'instanceAngles',
      byteStride: 4,
      attributes: [{attribute: 'instanceAngles', format: 'float32', byteOffset: 0}],
      stepMode: 'instance'
    }
  ]);

  const packedAttributes = attributeManager.getPackedBufferAttributes(
    attributeManager.getAttributes()
  );
  expect(
    packedAttributes.instanceAngles,
    'implicit single-attribute group publishes its buffer'
  ).toBeTruthy();
  expect(
    packedAttributes.instanceSizes,
    'implicit single-attribute group publishes its buffer'
  ).toBeTruthy();
});

test('AttributeManager.getBufferLayouts - packed buffers on WebGL', () => {
  const attributeManager = new AttributeManager(device);

  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize',
      bufferGroup: 'group-a'
    },
    instanceAngles: {
      size: 1,
      accessor: 'getAngle',
      bufferGroup: 'group-a'
    },
    instanceColors: {
      size: 4,
      type: 'unorm8',
      accessor: 'getColor',
      bufferGroup: 'group-a'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {size: 1, angle: 10, color: [255, 0, 0, 255]},
      {size: 2, angle: 20, color: [0, 255, 0, 255]}
    ],
    props: {
      getSize: x => x.size,
      getAngle: x => x.angle,
      getColor: x => x.color
    }
  });

  expect(attributeManager.getBufferLayouts()).toEqual([
    {
      name: 'group-a',
      byteStride: 4,
      attributes: [
        {attribute: 'instanceAngles', format: 'float32', byteOffset: 0},
        {attribute: 'instanceColors', format: 'unorm8x4', byteOffset: 16},
        {attribute: 'instanceSizes', format: 'float32', byteOffset: 32}
      ],
      stepMode: 'instance'
    }
  ]);

  const packedAttributes = attributeManager.getPackedBufferAttributes(
    attributeManager.getAttributes()
  );
  expect(packedAttributes['group-a'], 'webgl group publishes one shared buffer').toBeTruthy();
});

test('AttributeManager.getPackedBufferAttributes - only rewrites changed attributes when layout is stable', () => {
  const webgpuDevice = createWebGPUDevice();
  const attributeManager = new AttributeManager(webgpuDevice);

  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize',
      bufferGroup: 'group-a'
    },
    instanceAngles: {
      size: 1,
      accessor: 'getAngle',
      bufferGroup: 'group-a'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {size: 1, angle: 10},
      {size: 2, angle: 20}
    ],
    props: {
      getSize: x => x.size,
      getAngle: x => x.angle
    }
  });

  const packedAttributes = attributeManager.getPackedBufferAttributes(
    attributeManager.getAttributes()
  );
  const writeSpy = vi.spyOn(packedAttributes['group-a'], 'write');

  attributeManager.invalidate('getAngle');
  attributeManager.update({
    numInstances: 2,
    data: [
      {size: 1, angle: 30},
      {size: 2, angle: 40}
    ],
    props: {
      getSize: x => x.size,
      getAngle: x => x.angle
    }
  });

  const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});
  attributeManager.getPackedBufferAttributes({instanceAngles: changedAttributes.instanceAngles});

  expect(
    writeSpy,
    'stable packed layouts rewrite only the changed attribute'
  ).toHaveBeenCalledTimes(1);
});

test('AttributeManager.getPublishedAttributes - groups vertex, constant, and index bindings together', () => {
  const attributeManager = new AttributeManager(device);

  attributeManager.add({
    indices: {size: 1, isIndexed: true, accessor: 'getIndex'}
  });
  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize',
      bufferGroup: 'group-a'
    },
    instanceAngles: {
      size: 1,
      accessor: 'getAngle',
      bufferGroup: 'group-a'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {index: 0, angle: 10},
      {index: 1, angle: 20}
    ],
    props: {
      getIndex: x => x.index,
      getSize: 3,
      getAngle: x => x.angle
    }
  });

  const publishedAttributes = attributeManager.getPublishedAttributes(
    attributeManager.getAttributes()
  );

  expect(
    publishedAttributes.buffers['group-a'],
    'shared vertex group publishes one buffer'
  ).toBeTruthy();
  expect(
    Array.from(publishedAttributes.constants.instanceSizes),
    'grouped constants are published alongside shared buffers'
  ).toEqual([3]);
  expect(
    publishedAttributes.indexBuffers,
    'index buffers are returned from the same publication path'
  ).toHaveLength(1);
});

test('AttributeManager.getBufferLayouts - constant attributes reserve implicit group buffers on WebGL', () => {
  const attributeManager = new AttributeManager(device);

  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize'
    },
    instanceAngles: {
      size: 1,
      accessor: 'getAngle',
      bufferGroup: 'group-a'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [{angle: 10}, {angle: 20}],
    props: {
      getSize: 3,
      getAngle: x => x.angle
    }
  });

  expect(attributeManager.getAttributes().instanceSizes.isConstant).toBe(true);
  expect(attributeManager.getBufferLayouts()).toEqual([
    {
      name: 'instanceSizes',
      byteStride: 4,
      attributes: [{attribute: 'instanceSizes', format: 'float32', byteOffset: 0}],
      stepMode: 'instance'
    },
    {
      name: 'group-a',
      byteStride: 4,
      attributes: [{attribute: 'instanceAngles', format: 'float32', byteOffset: 0}],
      stepMode: 'instance'
    }
  ]);

  const packedAttributes = attributeManager.getPackedBufferAttributes(
    attributeManager.getAttributes()
  );
  expect(
    packedAttributes.instanceSizes,
    'single-attribute constant groups bind through WebGL constants instead of a dummy buffer'
  ).toBeUndefined();
});

test('AttributeManager.getPackedBufferAttributes - webgl constants reserve space but skip uploads', () => {
  const attributeManager = new AttributeManager(device);

  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize',
      bufferGroup: 'group-a'
    },
    instanceAngles: {
      size: 1,
      accessor: 'getAngle',
      bufferGroup: 'group-a'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [{angle: 10}, {angle: 20}],
    props: {
      getSize: 3,
      getAngle: x => x.angle
    }
  });

  const packedAttributes = attributeManager.getPackedBufferAttributes(
    attributeManager.getAttributes()
  );
  const writeSpy = vi.spyOn(packedAttributes['group-a'], 'write');

  attributeManager.invalidate('instanceSizes');
  attributeManager.update({
    numInstances: 2,
    data: [{angle: 30}, {angle: 40}],
    props: {
      getSize: 4,
      getAngle: x => x.angle
    }
  });

  const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});
  attributeManager.getPackedBufferAttributes({instanceSizes: changedAttributes.instanceSizes});

  expect(
    writeSpy,
    'constant webgl attributes do not upload into reserved group space'
  ).not.toHaveBeenCalled();
});

test('AttributeManager.update - generateConstantAttributes true materializes constants on WebGL', () => {
  const attributeManager = new AttributeManager(device, {generateConstantAttributes: true});
  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [{}, {}],
    props: {
      getSize: 3
    }
  });

  const attribute = attributeManager.getAttributes().instanceSizes;
  expect(attribute.isConstant, 'webgl override materializes constant values').toBe(false);
  expect(attribute.value, 'materialized constant expands to the instance count').toEqual([3, 3]);
});

test('AttributeManager.getBufferLayouts - shared group layout is stable across accessor and constant updates', () => {
  const attributeManager = new AttributeManager(device);

  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize',
      bufferGroup: 'group-a'
    },
    instanceAngles: {
      size: 1,
      accessor: 'getAngle',
      bufferGroup: 'group-a'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {size: 1, angle: 10},
      {size: 2, angle: 20}
    ],
    props: {
      getSize: x => x.size,
      getAngle: x => x.angle
    }
  });

  const accessorLayout = attributeManager.getBufferLayouts();

  attributeManager.invalidate('instanceAngles');
  attributeManager.update({
    numInstances: 2,
    data: [
      {size: 1, angle: 10},
      {size: 2, angle: 20}
    ],
    props: {
      getSize: x => x.size,
      getAngle: 30
    }
  });

  const constantLayout = attributeManager.getBufferLayouts();
  expect(constantLayout, 'layout is stable when a grouped attribute becomes constant').toEqual(
    accessorLayout
  );
  expect(
    attributeManager.getPackedBufferAttributes(attributeManager.getAttributes())['group-a'],
    'shared group still publishes under the same buffer-layout name'
  ).toBeTruthy();

  attributeManager.invalidate('instanceAngles');
  attributeManager.update({
    numInstances: 2,
    data: [
      {size: 1, angle: 40},
      {size: 2, angle: 50}
    ],
    props: {
      getSize: x => x.size,
      getAngle: x => x.angle
    }
  });

  expect(
    attributeManager.getBufferLayouts(),
    'layout stays stable when a grouped attribute switches back to accessor-driven values'
  ).toEqual(accessorLayout);
});

test('AttributeManager.getBufferLayouts - implicit group layout is stable across accessor and constant updates', () => {
  const attributeManager = new AttributeManager(device);

  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [{size: 1}, {size: 2}],
    props: {
      getSize: x => x.size
    }
  });

  const accessorLayout = attributeManager.getBufferLayouts();

  attributeManager.invalidate('instanceSizes');
  attributeManager.update({
    numInstances: 2,
    data: [{size: 1}, {size: 2}],
    props: {
      getSize: 3
    }
  });

  expect(
    attributeManager.getBufferLayouts(),
    'implicit single-attribute group keeps the same layout when becoming constant'
  ).toEqual(accessorLayout);
  expect(
    attributeManager.getPublishedAttributes(attributeManager.getAttributes()).constants
      .instanceSizes,
    'implicit single-attribute group keeps the same published attribute name when becoming constant'
  ).toBeTruthy();

  attributeManager.invalidate('instanceSizes');
  attributeManager.update({
    numInstances: 2,
    data: [{size: 4}, {size: 5}],
    props: {
      getSize: x => x.size
    }
  });

  expect(
    attributeManager.getBufferLayouts(),
    'implicit single-attribute group keeps the same layout when switching back to accessor values'
  ).toEqual(accessorLayout);
});
