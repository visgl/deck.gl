// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import GroupedAttributeManager from '@deck.gl/core/lib/attribute/grouped-attribute-manager';
import TableBufferPlanner from '@deck.gl/core/lib/attribute/table-buffer-planner';
import {test, expect, vi} from 'vitest';
import {device} from '@deck.gl/test-utils/vitest';

function createDevice({
  type = 'webgpu',
  maxVertexBuffers = device.limits.maxVertexBuffers,
  maxVertexBufferArrayStride = device.limits.maxVertexBufferArrayStride,
  maxStorageBuffersPerShaderStage = device.limits.maxStorageBuffersPerShaderStage,
  maxStorageBufferBindingSize = device.limits.maxStorageBufferBindingSize
}: {
  type?: 'webgl' | 'webgpu';
  maxVertexBuffers?: number;
  maxVertexBufferArrayStride?: number;
  maxStorageBuffersPerShaderStage?: number;
  maxStorageBufferBindingSize?: number;
} = {}) {
  const limits = Object.create(device.limits);
  Object.defineProperty(limits, 'maxVertexBuffers', {value: maxVertexBuffers});
  Object.defineProperty(limits, 'maxVertexBufferArrayStride', {
    value: maxVertexBufferArrayStride
  });
  Object.defineProperty(limits, 'maxStorageBuffersPerShaderStage', {
    value: maxStorageBuffersPerShaderStage
  });
  Object.defineProperty(limits, 'maxStorageBufferBindingSize', {
    value: maxStorageBufferBindingSize
  });

  const testDevice = Object.create(device);
  Object.defineProperty(testDevice, 'type', {value: type});
  Object.defineProperty(testDevice, 'limits', {value: limits});
  return testDevice;
}

test('GroupedAttributeManager imports', () => {
  expect(typeof GroupedAttributeManager).toBe('function');
});

test('GroupedAttributeManager.getBufferLayouts - builds semantic allocation groups', () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.add({
    positions: {size: 2, accessor: 'getVertex'}
  });
  attributeManager.addInstanced({
    instanceSizes: {size: 1, accessor: 'getSize'},
    instanceAngles: {size: 1, accessor: 'getAngle'},
    instancePositions: {size: 3, accessor: 'getPosition'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {angle: 10, position: [0, 0, 0]},
      {angle: 20, position: [1, 1, 1]}
    ],
    props: {
      getVertex: (x: {position: number[]}) => x.position.slice(0, 2),
      getSize: 3,
      getAngle: (x: {angle: number}) => x.angle,
      getPosition: (x: {position: number[]}) => x.position
    },
    transitions: {}
  });

  const layouts = attributeManager.getBufferLayouts({isInstanced: true});
  expect(layouts.map(layout => layout.name)).toEqual([
    'interleaved-shared-geometry-columns',
    'interleaved-constant-attribute-columns',
    'position-attribute-columns',
    'instanceAngles'
  ]);
  expect(layouts[1].stepMode).toBe('vertex');
});

test('GroupedAttributeManager.getBufferLayouts - table-with-inline-row-geometry packs constants with instance step mode', async () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'},
    angles: {size: 1, accessor: 'getAngle'},
    sizes: {size: 1, accessor: 'getSize'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {angle: 10, position: [0, 0], size: 1},
      {angle: 20, position: [1, 1], size: 2}
    ],
    props: {
      getPosition: (x: {position: number[]}) => x.position,
      getAngle: 10,
      getSize: 1
    },
    transitions: {}
  });

  const layouts = attributeManager.getBufferLayouts({isInstanced: false});
  expect(layouts.map(layout => layout.name)).toEqual([
    'interleaved-constant-attribute-columns',
    'position-attribute-columns',
    'pickingColors',
    'rowIndex'
  ]);
  expect(layouts[0].stepMode).toBe('instance');
  expect(layouts[0].byteStride).toBe(8);
  expect(layouts[0].attributes.map(attribute => attribute.attribute)).toEqual(['angles', 'sizes']);

  const published = attributeManager.getPublishedAttributes(attributeManager.getAttributes(), {
    isInstanced: false
  });
  const packedBytes = await published.buffers['interleaved-constant-attribute-columns'].readAsync(
    0,
    8
  );

  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 2))).toEqual([
    10, 1
  ]);
});

test('TableBufferPlanner.getAllocationPlan - table-with-inline-row-geometry can opt data columns into storage buffers', () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'},
    fillColors: {size: 4, type: 'uint8', accessor: 'getFillColor'},
    elevations: {size: 1, accessor: 'getElevation'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {position: [0, 0], color: [255, 0, 0, 255], elevation: 1},
      {position: [1, 1], color: [0, 255, 0, 255], elevation: 2}
    ],
    props: {
      getPosition: (x: {position: number[]}) => x.position,
      getFillColor: (x: {color: number[]}) => x.color,
      getElevation: (x: {elevation: number}) => x.elevation
    },
    transitions: {}
  });

  const plan = TableBufferPlanner.getAllocationPlan({
    device: createDevice({
      maxStorageBuffersPerShaderStage: 4,
      maxStorageBufferBindingSize: 1024
    }),
    attributes: Object.values(attributeManager.getAttributes()),
    modelInfo: {isInstanced: false},
    useStorageBuffers: true,
    generateConstantAttributes: true,
    isTransitionAttribute: () => false
  });

  expect(
    plan.groups
      .filter(group => group.kind === 'separate-storage-column')
      .map(group => group.id)
      .sort()
  ).toEqual(['elevations', 'fillColors']);
  expect(plan.storageAttributeIds).toEqual(new Set(['elevations', 'fillColors']));
  expect(plan.packedAttributeIds.has('fillColors')).toBe(false);
});

test('TableBufferPlanner.getAllocationPlan - storage buffers are WebGPU table-with-inline-row-geometry only', () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'},
    elevations: {size: 1, accessor: 'getElevation'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {position: [0, 0], elevation: 1},
      {position: [1, 1], elevation: 2}
    ],
    props: {
      getPosition: (x: {position: number[]}) => x.position,
      getElevation: (x: {elevation: number}) => x.elevation
    },
    transitions: {}
  });

  const webglPlan = TableBufferPlanner.getAllocationPlan({
    device: createDevice({type: 'webgl'}),
    attributes: Object.values(attributeManager.getAttributes()),
    modelInfo: {isInstanced: false},
    useStorageBuffers: true,
    generateConstantAttributes: true,
    isTransitionAttribute: () => false
  });
  const sharedGeometryPlan = TableBufferPlanner.getAllocationPlan({
    device: createDevice(),
    attributes: Object.values(attributeManager.getAttributes()),
    modelInfo: {isInstanced: true},
    useStorageBuffers: true,
    generateConstantAttributes: true,
    isTransitionAttribute: () => false
  });

  expect(webglPlan.groups.some(group => group.kind === 'separate-storage-column')).toBe(false);
  expect(
    sharedGeometryPlan.groups.some(group => group.kind === 'separate-storage-column')
  ).toBe(false);
});

test('TableBufferPlanner.getAllocationPlan - storage buffer limits fall back to vertex buffers', () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'},
    fillColors: {size: 4, type: 'uint8', accessor: 'getFillColor'},
    elevations: {size: 1, accessor: 'getElevation'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {position: [0, 0], color: [255, 0, 0, 255], elevation: 1},
      {position: [1, 1], color: [0, 255, 0, 255], elevation: 2}
    ],
    props: {
      getPosition: (x: {position: number[]}) => x.position,
      getFillColor: (x: {color: number[]}) => x.color,
      getElevation: (x: {elevation: number}) => x.elevation
    },
    transitions: {}
  });

  const countLimitedPlan = TableBufferPlanner.getAllocationPlan({
    device: createDevice({
      maxStorageBuffersPerShaderStage: 1,
      maxStorageBufferBindingSize: 1024
    }),
    attributes: Object.values(attributeManager.getAttributes()),
    modelInfo: {isInstanced: false},
    useStorageBuffers: true,
    generateConstantAttributes: true,
    isTransitionAttribute: () => false
  });
  const sizeLimitedPlan = TableBufferPlanner.getAllocationPlan({
    device: createDevice({
      maxStorageBuffersPerShaderStage: 4,
      maxStorageBufferBindingSize: 4
    }),
    attributes: Object.values(attributeManager.getAttributes()),
    modelInfo: {isInstanced: false},
    useStorageBuffers: true,
    generateConstantAttributes: true,
    isTransitionAttribute: () => false
  });

  expect(
    countLimitedPlan.groups
      .filter(
        group =>
          group.kind === 'separate-storage-column' || group.kind === 'stacked-storage-columns'
      )
      .map(group => [group.id, group.kind, group.attributes.map(({attribute}) => attribute.id)])
  ).toEqual([
    ['stacked-storage-columns', 'stacked-storage-columns', ['fillColors', 'elevations']]
  ]);
  expect(
    countLimitedPlan.groups.find(group => group.kind === 'stacked-storage-columns')?.byteOffsets
  ).toEqual({fillColors: 0, elevations: 256});
  expect(countLimitedPlan.mappingsByAttributeId.fillColors[0].byteOffset).toBe(0);
  expect(countLimitedPlan.mappingsByAttributeId.elevations[0].byteOffset).toBe(256);
  expect(countLimitedPlan.storageAttributeIds).toEqual(new Set(['fillColors', 'elevations']));
  expect(
    sizeLimitedPlan.groups.some(
      group =>
        group.kind === 'separate-storage-column' || group.kind === 'stacked-storage-columns'
    )
  ).toBe(false);
});

test('GroupedAttributeManager.getPublishedAttributes - table-with-inline-row-geometry generates rowIndex and pickingColors', async () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'}
  });

  attributeManager.update({
    numInstances: 5,
    startIndices: [0, 2, 5],
    data: [{}, {}],
    props: {
      getPosition: () => [0, 0]
    },
    transitions: {}
  });

  const published = attributeManager.getPublishedAttributes(attributeManager.getAttributes(), {
    isInstanced: false
  });
  const rowIndexBytes = await published.buffers.rowIndex.readAsync(0, 20);
  const pickingColorBytes = await published.buffers.pickingColors.readAsync(0, 20);

  expect(Array.from(new Uint32Array(rowIndexBytes.buffer, rowIndexBytes.byteOffset, 5))).toEqual([
    0, 0, 1, 1, 1
  ]);
  expect(
    Array.from(new Uint8Array(pickingColorBytes.buffer, pickingColorBytes.byteOffset, 20))
  ).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0]);
});

test('GroupedAttributeManager.getPublishedAttributes - table-with-inline-row-geometry pickingColors use source index', async () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'}
  });

  attributeManager.update({
    numInstances: 3,
    startIndices: [0, 1, 3],
    data: [{__source: {index: 7}}, {__source: {index: 9}}],
    props: {
      getPosition: () => [0, 0]
    },
    transitions: {}
  });

  const published = attributeManager.getPublishedAttributes(attributeManager.getAttributes(), {
    isInstanced: false
  });
  const pickingColorBytes = await published.buffers.pickingColors.readAsync(0, 12);

  expect(
    Array.from(new Uint8Array(pickingColorBytes.buffer, pickingColorBytes.byteOffset, 12))
  ).toEqual([8, 0, 0, 0, 10, 0, 0, 0, 10, 0, 0, 0]);
});

test('GroupedAttributeManager.getBufferLayouts - table-with-inline-row-geometry does not duplicate layer pickingColors', () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.add({
    positions: {size: 2, accessor: 'getPosition'},
    pickingColors: {size: 4, type: 'uint8', accessor: 'getPickingColor'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [{position: [0, 0]}, {position: [1, 1]}],
    props: {
      getPosition: (x: {position: number[]}) => x.position,
      getPickingColor: (_x: unknown, {index}: {index: number}) => [index + 1, 0, 0, 0]
    },
    transitions: {}
  });

  const attributeNames = attributeManager
    .getBufferLayouts({isInstanced: false})
    .flatMap(layout => layout.attributes.map(attribute => attribute.attribute));

  expect(attributeNames.filter(attribute => attribute === 'pickingColors')).toHaveLength(1);
  expect(attributeNames).toContain('rowIndex');
});

test('GroupedAttributeManager.getPublishedAttributes - publishes constants and index buffers', () => {
  const attributeManager = new GroupedAttributeManager(createDevice({type: 'webgl'}));
  attributeManager.add({
    indices: {size: 1, isIndexed: true, accessor: 'getIndex'}
  });
  attributeManager.addInstanced({
    instanceSizes: {size: 1, accessor: 'getSize'},
    instanceAngles: {size: 1, accessor: 'getAngle'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {index: 0, angle: 10},
      {index: 1, angle: 20}
    ],
    props: {
      getIndex: (x: {index: number}) => x.index,
      getSize: 3,
      getAngle: (x: {angle: number}) => x.angle
    },
    transitions: {}
  });

  const publishedAttributes = attributeManager.getPublishedAttributes(
    attributeManager.getAttributes(),
    {isInstanced: true}
  );

  expect(publishedAttributes.buffers.instanceAngles).toBeTruthy();
  expect(Array.from(publishedAttributes.constants.instanceSizes)).toEqual([3]);
  expect(publishedAttributes.indexBuffers).toHaveLength(1);
});

test('GroupedAttributeManager.getBufferLayouts - active transitions stay unmanaged', () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.addInstanced({
    instancePositions: {size: 3, accessor: 'getPosition', transition: true},
    instanceSizes: {size: 1, accessor: 'getSize'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [{position: [0, 0, 0]}, {position: [1, 1, 1]}],
    props: {
      getPosition: (x: {position: number[]}) => x.position,
      getSize: 1
    },
    transitions: {}
  });

  const transitionManager = (attributeManager as any).attributeTransitionManager;
  vi.spyOn(transitionManager, 'hasAttribute').mockImplementation(attributeName => {
    return attributeName === 'instancePositions';
  });

  expect(attributeManager.getBufferLayouts({isInstanced: true}).map(layout => layout.name)).toEqual(
    ['instancePositions', 'interleaved-constant-attribute-columns']
  );
});

test('GroupedAttributeManager.getPackedBufferAttributes - preserves overflow buffers across partial rewrites', async () => {
  const attributeManager = new GroupedAttributeManager(createDevice({maxVertexBuffers: 1}));
  attributeManager.addInstanced({
    instanceSizes: {
      size: 1,
      accessor: 'getSize',
      bufferLayoutPriority: 'low'
    },
    instanceAngles: {
      size: 1,
      accessor: 'getAngle',
      bufferLayoutPriority: 'low'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {angle: 10, size: 1},
      {angle: 20, size: 2}
    ],
    props: {
      getSize: (x: {size: number}) => x.size,
      getAngle: (x: {angle: number}) => x.angle
    },
    transitions: {}
  });

  const initialBuffer = attributeManager.getPackedBufferAttributes(
    attributeManager.getAttributes(),
    {isInstanced: true}
  )['interleaved-attribute-columns'];
  let packedBytes = await initialBuffer.readAsync(0, 16);
  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 4))).toEqual([
    10, 1, 20, 2
  ]);

  attributeManager.invalidate('getAngle');
  attributeManager.update({
    numInstances: 2,
    data: [
      {angle: 30, size: 1},
      {angle: 40, size: 2}
    ],
    props: {
      getSize: (x: {size: number}) => x.size,
      getAngle: (x: {angle: number}) => x.angle
    },
    transitions: {}
  });

  const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});
  const updatedBuffer = attributeManager.getPackedBufferAttributes(
    {
      instanceAngles: changedAttributes.instanceAngles
    },
    {isInstanced: true}
  )['interleaved-attribute-columns'];

  expect(updatedBuffer).toBe(initialBuffer);
  packedBytes = await updatedBuffer.readAsync(0, 16);
  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 4))).toEqual([
    30, 1, 40, 2
  ]);
});

test('GroupedAttributeManager.update - planned attributes skip unmanaged buffers', () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.addInstanced({
    instanceSizes: {size: 1, accessor: 'getSize'},
    instanceAngles: {size: 1, accessor: 'getAngle'},
    instancePositions: {size: 3, accessor: 'getPosition'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {angle: 10, position: [0, 0, 0]},
      {angle: 20, position: [1, 1, 1]}
    ],
    props: {
      getSize: 3,
      getAngle: (x: {angle: number}) => x.angle,
      getPosition: (x: {position: number[]}) => x.position
    },
    transitions: {}
  });

  const attributes = attributeManager.getAttributes();
  expect(attributes.instanceAngles.getBuffer()).toBeNull();
  expect(attributes.instanceSizes.isConstant).toBeTruthy();
  expect(attributes.instancePositions.getBuffer()).toBeNull();

  const published = attributeManager.getPublishedAttributes(attributeManager.getAttributes(), {
    isInstanced: true
  });
  expect(published.buffers['interleaved-constant-attribute-columns']).toBeTruthy();
  expect(published.buffers['position-attribute-columns']).toBeTruthy();
  expect(published.buffers.instanceAngles).toBeTruthy();
});

test('GroupedAttributeManager.getBufferLayouts - fp64 positions publish high and low columns separately', () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.addInstanced({
    instancePositions: {
      size: 3,
      type: 'float64',
      accessor: 'getPosition'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [{position: [0.1, 0.2, 0.3]}, {position: [1.1, 1.2, 1.3]}],
    props: {
      getPosition: (x: {position: number[]}) => x.position
    },
    transitions: {}
  });

  const layouts = attributeManager.getBufferLayouts({isInstanced: true});

  expect(layouts.map(layout => layout.name)).toEqual([
    'interleaved-constant-attribute-columns',
    'position-attribute-columns'
  ]);
  expect(layouts[0].attributes.map(attribute => attribute.attribute)).toEqual([
    'instancePositions64Low'
  ]);
  expect(layouts[1].attributes.map(attribute => attribute.attribute)).toEqual([
    'instancePositions'
  ]);

  const published = attributeManager.getPublishedAttributes(attributeManager.getAttributes(), {
    isInstanced: true
  });
  expect(published.buffers['interleaved-constant-attribute-columns']).toBeTruthy();
  expect(published.buffers['position-attribute-columns']).toBeTruthy();
});

test('GroupedAttributeManager.getBufferLayouts - priority controls separate vs interleaved columns', () => {
  const attributeManager = new GroupedAttributeManager(createDevice({maxVertexBuffers: 2}));
  attributeManager.addInstanced({
    instanceColors: {size: 4, accessor: 'getColor', bufferLayoutPriority: 'high'},
    instanceAngles: {size: 1, accessor: 'getAngle', bufferLayoutPriority: 'medium'},
    instancePickingColors: {size: 4, accessor: 'getPickingColor', bufferLayoutPriority: 'low'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [{angle: 10}, {angle: 20}],
    props: {
      getColor: () => [255, 0, 0, 255],
      getAngle: (x: {angle: number}) => x.angle,
      getPickingColor: (_x: unknown, {index}: {index: number}) => [index, 0, 0, 0]
    },
    transitions: {}
  });

  expect(attributeManager.getBufferLayouts({isInstanced: true}).map(layout => layout.name)).toEqual(
    ['instanceColors', 'interleaved-attribute-columns']
  );
});

test('GroupedAttributeManager.getBufferLayouts - reserves slots for model geometry', () => {
  const attributeManager = new GroupedAttributeManager(createDevice({maxVertexBuffers: 8}));
  attributeManager.addInstanced({
    instancePositions: {
      size: 3,
      type: 'float64',
      fp64: false,
      accessor: 'getPosition'
    },
    instanceSizes: {size: 1, accessor: 'getSize'},
    instanceIconDefs: {
      size: 7,
      accessor: 'getIcon',
      shaderAttributes: {
        instanceOffsets: {size: 2, elementOffset: 0},
        instanceIconFrames: {size: 4, elementOffset: 2},
        instanceColorModes: {size: 1, elementOffset: 6}
      }
    },
    instanceColors: {size: 4, type: 'unorm8', accessor: 'getColor'},
    instanceAngles: {size: 1, accessor: 'getAngle'},
    instancePixelOffset: {size: 2, accessor: 'getPixelOffset'},
    instancePickingColors: {size: 4, type: 'uint8', accessor: 'getPickingColor'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {position: [0, 0, 0], angle: 10},
      {position: [1, 1, 1], angle: 20}
    ],
    props: {
      getPosition: (x: {position: number[]}) => x.position,
      getSize: () => 1,
      getIcon: () => [0, 0, 1, 1, 0, 0, 1],
      getColor: () => [255, 0, 0, 255],
      getAngle: (x: {angle: number}) => x.angle,
      getPixelOffset: () => [0, 0],
      getPickingColor: (_x: unknown, {index}: {index: number}) => [index, 0, 0, 0]
    },
    transitions: {}
  });

  const layouts = attributeManager.getBufferLayouts({
    isInstanced: true,
    reservedVertexBufferCount: 1
  });

  expect(layouts.map(layout => layout.name)).toEqual([
    'interleaved-constant-attribute-columns',
    'position-attribute-columns',
    'instanceColors',
    'instanceAngles',
    'instanceIconDefs',
    'instancePixelOffset',
    'interleaved-attribute-columns'
  ]);
  expect(layouts).toHaveLength(7);
  for (const layout of layouts) {
    for (const attribute of layout.attributes) {
      expect(attribute.byteOffset).toBeLessThan(layout.byteStride);
    }
  }

  const published = attributeManager.getPublishedAttributes(attributeManager.getAttributes(), {
    isInstanced: true,
    reservedVertexBufferCount: 1
  });
  expect(Object.keys(published.buffers).sort()).toEqual(layouts.map(layout => layout.name).sort());
});

test('GroupedAttributeManager.getPublishedAttributes - packs IconLayer shader attributes by row', async () => {
  const attributeManager = new GroupedAttributeManager(createDevice({maxVertexBuffers: 8}));
  attributeManager.addInstanced({
    instanceIconDefs: {
      size: 7,
      accessor: 'getIcon',
      shaderAttributes: {
        instanceOffsets: {size: 2, elementOffset: 0},
        instanceIconFrames: {size: 4, elementOffset: 2},
        instanceColorModes: {size: 1, elementOffset: 6}
      }
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [{icon: 1}, {icon: 100}],
    props: {
      getIcon: (x: {icon: number}) => [
        x.icon,
        x.icon + 1,
        x.icon + 2,
        x.icon + 3,
        x.icon + 4,
        x.icon + 5,
        x.icon + 6
      ]
    },
    transitions: {}
  });

  const published = attributeManager.getPublishedAttributes(attributeManager.getAttributes(), {
    isInstanced: true,
    reservedVertexBufferCount: 1
  });
  const packedBytes = await published.buffers.instanceIconDefs.readAsync(0, 56);

  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 14))).toEqual([
    1, 2, 3, 4, 5, 6, 7, 100, 101, 102, 103, 104, 105, 106
  ]);
});

test('GroupedAttributeManager.getPublishedAttributes - packs fp64 position high rows', async () => {
  const attributeManager = new GroupedAttributeManager(createDevice());
  attributeManager.addInstanced({
    instancePositions: {
      size: 3,
      type: 'float64',
      fp64: false,
      accessor: 'getPosition'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [{position: [-35, 36.7, 0]}, {position: [10, 20, 0]}],
    props: {
      getPosition: (x: {position: number[]}) => x.position
    },
    transitions: {}
  });

  const published = attributeManager.getPublishedAttributes(attributeManager.getAttributes(), {
    isInstanced: true
  });
  const packedBytes = await published.buffers['position-attribute-columns'].readAsync(0, 24);

  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 6))).toEqual([
    -35,
    Math.fround(36.7),
    0,
    10,
    20,
    0
  ]);
});

test('GroupedAttributeManager.getBufferLayouts - packs MultiIconLayer attributes within WebGPU limits', () => {
  const attributeManager = new GroupedAttributeManager(createDevice({maxVertexBuffers: 8}));
  attributeManager.addInstanced({
    instancePositions: {size: 3, type: 'float64', fp64: false, accessor: 'getPosition'},
    instanceSizes: {size: 1, accessor: 'getSize'},
    instanceIconDefs: {
      size: 7,
      accessor: 'getIcon',
      shaderAttributes: {
        instanceOffsets: {size: 2, elementOffset: 0},
        instanceIconFrames: {size: 4, elementOffset: 2},
        instanceColorModes: {size: 1, elementOffset: 6}
      }
    },
    instanceColors: {size: 4, type: 'unorm8', accessor: 'getColor'},
    instanceAngles: {size: 1, accessor: 'getAngle'},
    instancePixelOffset: {size: 2, accessor: 'getPixelOffset'},
    instancePickingColors: {size: 4, type: 'uint8', accessor: 'getPickingColor'},
    instanceClipRect: {size: 4, accessor: 'getContentBox'},
    collisionPriorities: {size: 1, stepMode: 'dynamic', accessor: 'getCollisionPriority'}
  });

  expect(
    attributeManager.getBufferLayouts({
      isInstanced: true,
      reservedVertexBufferCount: 1
    }).length
  ).toBeLessThanOrEqual(8);

  attributeManager.update({
    numInstances: 2,
    data: [{position: [0, 0, 0]}, {position: [1, 1, 1]}],
    props: {
      getPosition: (x: {position: number[]}) => x.position,
      getSize: () => 1,
      getIcon: () => [0, 0, 1, 1, 0, 0, 1],
      getColor: () => [255, 0, 0, 255],
      getAngle: () => 0,
      getPixelOffset: () => [0, 0],
      getPickingColor: (_x: unknown, {index}: {index: number}) => [index, 0, 0, 0],
      getContentBox: () => [0, 0, -1, -1],
      getCollisionPriority: () => 1
    },
    transitions: {}
  });

  const layouts = attributeManager.getBufferLayouts({
    isInstanced: true,
    reservedVertexBufferCount: 1
  });

  expect(layouts.length).toBeLessThanOrEqual(8);
});

test('GroupedAttributeManager.getBufferLayouts - throws when planned buffers exceed device limit', () => {
  const attributeManager = new GroupedAttributeManager(createDevice({maxVertexBuffers: 1}));
  attributeManager.add({
    positions: {size: 2, accessor: 'getVertex'}
  });
  attributeManager.addInstanced({
    instancePositions: {size: 3, accessor: 'getPosition'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [{position: [0, 0, 0]}, {position: [1, 1, 1]}],
    props: {
      getVertex: (x: {position: number[]}) => x.position.slice(0, 2),
      getPosition: (x: {position: number[]}) => x.position
    },
    transitions: {}
  });

  expect(() => attributeManager.getBufferLayouts({isInstanced: true})).toThrow(
    /requires 2 vertex buffers/
  );
});

test('GroupedAttributeManager.getBufferLayouts - throws when reserved buffers exceed device limit', () => {
  const attributeManager = new GroupedAttributeManager(createDevice({maxVertexBuffers: 2}));
  attributeManager.addInstanced({
    instancePositions: {size: 3, type: 'float64', fp64: false, accessor: 'getPosition'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [{position: [0, 0, 0]}, {position: [1, 1, 1]}],
    props: {
      getPosition: (x: {position: number[]}) => x.position
    },
    transitions: {}
  });

  expect(() =>
    attributeManager.getBufferLayouts({isInstanced: true, reservedVertexBufferCount: 1})
  ).toThrow(/requires 3 vertex buffers/);
});

test('GroupedAttributeManager.getBufferLayouts - throws when packed stride exceeds device limit', () => {
  const attributeManager = new GroupedAttributeManager(
    createDevice({maxVertexBufferArrayStride: 8})
  );
  attributeManager.addInstanced({
    instancePositions: {size: 3, accessor: 'getPosition'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [{position: [0, 0, 0]}, {position: [1, 1, 1]}],
    props: {
      getPosition: (x: {position: number[]}) => x.position
    },
    transitions: {}
  });

  expect(() => attributeManager.getBufferLayouts({isInstanced: true})).toThrow(
    /requires byteStride 12/
  );
});
