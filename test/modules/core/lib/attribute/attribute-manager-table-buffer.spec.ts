// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import AttributeManager from '@deck.gl/core/lib/attribute/attribute-manager';
import TableBufferPlanner, {
  type TableColumnDescriptor
} from '@deck.gl/core/lib/attribute/table-buffer-planner';
import {getStride} from '@deck.gl/core/lib/attribute/gl-utils';
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

function getColumnDescriptors(
  attributeManager: AttributeManager,
  modelInfo?: {isInstanced?: boolean}
): TableColumnDescriptor[] {
  return Object.values(attributeManager.getAttributes()).map((attribute: any) => {
    const stepMode = attribute.getBufferLayout(modelInfo).stepMode as 'vertex' | 'instance';
    const isGeneratedPickingColor =
      attribute.id === 'pickingColors' || attribute.id === 'instancePickingColors';
    const isPosition = attribute.id === 'positions' || /Positions$/.test(attribute.id);
    const isColor = /Colors?$/.test(attribute.id);
    const isExternalGpuBufferOnly =
      Boolean(attribute.getBuffer && attribute.getBuffer()) && !ArrayBuffer.isView(attribute.value);

    return {
      id: attribute.id,
      byteStride: getStride(attribute.getAccessor()),
      byteLength: ArrayBuffer.isView(attribute.value)
        ? attribute.value.byteLength
        : Math.max(1, attribute.numInstances) * getStride(attribute.getAccessor()),
      rowCount: attribute.numInstances,
      stepMode,
      isPosition,
      isConstant: attribute.constant || attribute.isConstant,
      isIndexed: attribute.settings.isIndexed,
      isTransition: Boolean(attribute.settings.transition),
      isExternalBufferOnly: isExternalGpuBufferOnly,
      isDoublePrecision: attribute.doublePrecision,
      noAlloc: attribute.settings.noAlloc,
      allowNoAllocManaged:
        isGeneratedPickingColor &&
        typeof attribute.settings.update === 'function' &&
        !isExternalGpuBufferOnly,
      supportsPackedBuffer:
        !attribute.doublePrecision &&
        !attribute.settings.isIndexed &&
        attribute.getBufferLayout(modelInfo).stepMode === stepMode,
      isGeneratedRowGeometry: attribute.id === 'rowIndex' || attribute.id === 'pickingColors',
      priority:
        attribute.settings.bufferLayoutPriority ||
        (isGeneratedPickingColor ? 'low' : isPosition || isColor ? 'high' : 'medium')
    };
  });
}

test('AttributeManager imports', () => {
  expect(typeof AttributeManager).toBe('function');
});

test('AttributeManager.getBufferLayouts - builds semantic allocation groups', () => {
  const attributeManager = new AttributeManager(createDevice());
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

test('AttributeManager.getBufferLayouts - table-with-row-geometries packs constants with instance step mode', async () => {
  const attributeManager = new AttributeManager(createDevice());
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

  const modelBindings = attributeManager.getModelBindings(attributeManager.getAttributes(), {
    isInstanced: false
  });
  const packedBytes = await modelBindings.buffers[
    'interleaved-constant-attribute-columns'
  ].readAsync(0, 8);

  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 2))).toEqual([
    10, 1
  ]);
});

test('TableBufferPlanner.getAllocationPlan - table-with-row-geometries can opt data columns into storage buffers', () => {
  const attributeManager = new AttributeManager(createDevice());
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
    columns: getColumnDescriptors(attributeManager, {isInstanced: false}),
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
  expect(plan.storageColumnIds).toEqual(new Set(['elevations', 'fillColors']));
  expect(plan.packedColumnIds.has('fillColors')).toBe(false);
});

test('TableBufferPlanner.getAllocationPlan - storage buffers are WebGPU table-with-row-geometries only', () => {
  const attributeManager = new AttributeManager(createDevice());
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
    columns: getColumnDescriptors(attributeManager, {isInstanced: false}),
    modelInfo: {isInstanced: false},
    useStorageBuffers: true,
    generateConstantAttributes: true,
    isTransitionAttribute: () => false
  });
  const sharedGeometryPlan = TableBufferPlanner.getAllocationPlan({
    device: createDevice(),
    columns: getColumnDescriptors(attributeManager, {isInstanced: true}),
    modelInfo: {isInstanced: true},
    useStorageBuffers: true,
    generateConstantAttributes: true,
    isTransitionAttribute: () => false
  });

  expect(webglPlan.groups.some(group => group.kind === 'separate-storage-column')).toBe(false);
  expect(sharedGeometryPlan.groups.some(group => group.kind === 'separate-storage-column')).toBe(
    false
  );
});

test('TableBufferPlanner.getAllocationPlan - storage buffer limits fall back to vertex buffers', () => {
  const attributeManager = new AttributeManager(createDevice());
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
    columns: getColumnDescriptors(attributeManager, {isInstanced: false}),
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
    columns: getColumnDescriptors(attributeManager, {isInstanced: false}),
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
      .map(group => [group.id, group.kind, group.columns.map(({id}) => id)])
  ).toEqual([['stacked-storage-columns', 'stacked-storage-columns', ['fillColors', 'elevations']]]);
  expect(
    countLimitedPlan.groups.find(group => group.kind === 'stacked-storage-columns')?.byteOffsets
  ).toEqual({fillColors: 0, elevations: 256});
  expect(countLimitedPlan.mappingsByColumnId.fillColors[0].byteOffset).toBe(0);
  expect(countLimitedPlan.mappingsByColumnId.elevations[0].byteOffset).toBe(256);
  expect(countLimitedPlan.storageColumnIds).toEqual(new Set(['fillColors', 'elevations']));
  expect(
    sizeLimitedPlan.groups.some(
      group => group.kind === 'separate-storage-column' || group.kind === 'stacked-storage-columns'
    )
  ).toBe(false);
});

test('AttributeManager.getModelBindings - table-with-row-geometries generates rowIndex and pickingColors', async () => {
  const attributeManager = new AttributeManager(createDevice());
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

  const modelBindings = attributeManager.getModelBindings(attributeManager.getAttributes(), {
    isInstanced: false
  });
  const rowIndexBytes = await modelBindings.buffers.rowIndex.readAsync(0, 20);
  const pickingColorBytes = await modelBindings.buffers.pickingColors.readAsync(0, 20);

  expect(Array.from(new Uint32Array(rowIndexBytes.buffer, rowIndexBytes.byteOffset, 5))).toEqual([
    0, 0, 1, 1, 1
  ]);
  expect(
    Array.from(new Uint8Array(pickingColorBytes.buffer, pickingColorBytes.byteOffset, 20))
  ).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0]);
});

test('AttributeManager.getModelBindings - table-with-row-geometries pickingColors use source index', async () => {
  const attributeManager = new AttributeManager(createDevice());
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

  const modelBindings = attributeManager.getModelBindings(attributeManager.getAttributes(), {
    isInstanced: false
  });
  const pickingColorBytes = await modelBindings.buffers.pickingColors.readAsync(0, 12);

  expect(
    Array.from(new Uint8Array(pickingColorBytes.buffer, pickingColorBytes.byteOffset, 12))
  ).toEqual([8, 0, 0, 0, 10, 0, 0, 0, 10, 0, 0, 0]);
});

test('AttributeManager.getBufferLayouts - table-with-row-geometries does not duplicate layer pickingColors', () => {
  const attributeManager = new AttributeManager(createDevice());
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

test('AttributeManager.getModelBindings - binds constants and index buffers', () => {
  const attributeManager = new AttributeManager(createDevice({type: 'webgl'}));
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

  const modelBindings = attributeManager.getModelBindings(attributeManager.getAttributes(), {
    isInstanced: true
  });

  expect(modelBindings.buffers.instanceAngles).toBeTruthy();
  expect(Array.from(modelBindings.constants.instanceSizes)).toEqual([3]);
  expect(modelBindings.indexBuffers).toHaveLength(1);
});

test('AttributeManager.getBufferLayouts - active transitions stay unmanaged', () => {
  const attributeManager = new AttributeManager(createDevice());
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

test('AttributeManager.getModelBindings - preserves overflow buffers across partial rewrites', async () => {
  const attributeManager = new AttributeManager(createDevice({maxVertexBuffers: 1}));
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

  const initialBuffer = attributeManager.getModelBindings(attributeManager.getAttributes(), {
    isInstanced: true
  }).buffers['interleaved-attribute-columns'];
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
  const updatedBuffer = attributeManager.getModelBindings(
    {
      instanceAngles: changedAttributes.instanceAngles
    },
    {isInstanced: true}
  ).buffers['interleaved-attribute-columns'];

  expect(updatedBuffer).toBe(initialBuffer);
  packedBytes = await updatedBuffer.readAsync(0, 16);
  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 4))).toEqual([
    30, 1, 40, 2
  ]);
});

test('AttributeManager.update - planned attributes skip unmanaged buffers', () => {
  const attributeManager = new AttributeManager(createDevice());
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

  const modelBindings = attributeManager.getModelBindings(attributeManager.getAttributes(), {
    isInstanced: true
  });
  expect(modelBindings.buffers['interleaved-constant-attribute-columns']).toBeTruthy();
  expect(modelBindings.buffers['position-attribute-columns']).toBeTruthy();
  expect(modelBindings.buffers.instanceAngles).toBeTruthy();
});

test('AttributeManager.getBufferLayouts - fp64 positions bind high and low columns separately', () => {
  const attributeManager = new AttributeManager(createDevice());
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

  const modelBindings = attributeManager.getModelBindings(attributeManager.getAttributes(), {
    isInstanced: true
  });
  expect(modelBindings.buffers['interleaved-constant-attribute-columns']).toBeTruthy();
  expect(modelBindings.buffers['position-attribute-columns']).toBeTruthy();
});

test('AttributeManager.getBufferLayouts - named fp64 position columns are planned', () => {
  const attributeManager = new AttributeManager(createDevice());
  attributeManager.addInstanced({
    instanceSourcePositions: {
      size: 3,
      type: 'float64',
      accessor: 'getSourcePosition'
    },
    instanceTargetPositions: {
      size: 3,
      type: 'float64',
      accessor: 'getTargetPosition'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {source: [0.1, 0.2, 0.3], target: [1.1, 1.2, 1.3]},
      {source: [2.1, 2.2, 2.3], target: [3.1, 3.2, 3.3]}
    ],
    props: {
      getSourcePosition: (x: {source: number[]}) => x.source,
      getTargetPosition: (x: {target: number[]}) => x.target
    },
    transitions: {}
  });

  const layouts = attributeManager.getBufferLayouts({isInstanced: true});

  expect(layouts.map(layout => layout.name)).toEqual([
    'interleaved-constant-attribute-columns',
    'position-attribute-columns'
  ]);
  expect(layouts[0].attributes.map(attribute => attribute.attribute)).toEqual([
    'instanceSourcePositions64Low',
    'instanceTargetPositions64Low'
  ]);
  expect(layouts[1].attributes.map(attribute => attribute.attribute)).toEqual([
    'instanceSourcePositions',
    'instanceTargetPositions'
  ]);
});

test('AttributeManager.getBufferLayouts - priority controls separate vs interleaved columns', () => {
  const attributeManager = new AttributeManager(createDevice({maxVertexBuffers: 2}));
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

test('AttributeManager.getBufferLayouts - generated noAlloc picking colors are planned', () => {
  const attributeManager = new AttributeManager(createDevice({maxVertexBuffers: 2}));
  attributeManager.addInstanced({
    instancePositions: {size: 3, accessor: 'getPosition'},
    instanceAngles: {size: 1, accessor: 'getAngle'},
    instancePickingColors: {
      size: 4,
      type: 'uint8',
      noAlloc: true,
      update: (attribute: any, {numInstances}: {numInstances: number}) => {
        const value = new Uint8Array(numInstances * 4);
        for (let index = 0; index < numInstances; index++) {
          value[index * 4] = index + 1;
        }
        attribute.value = value;
      }
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {position: [0, 0, 0], angle: 10},
      {position: [1, 1, 1], angle: 20}
    ],
    props: {
      getPosition: (x: {position: number[]}) => x.position,
      getAngle: (x: {angle: number}) => x.angle
    },
    transitions: {}
  });

  const attributes = attributeManager.getAttributes();
  const plan = TableBufferPlanner.getAllocationPlan({
    device: createDevice({maxVertexBuffers: 2}),
    columns: getColumnDescriptors(attributeManager, {isInstanced: true}),
    modelInfo: {isInstanced: true},
    generateConstantAttributes: true,
    isTransitionAttribute: () => false
  });

  expect(attributes.instancePickingColors.getBuffer()).toBeNull();
  expect(plan.groupsByColumnId.instancePickingColors[0].kind).toBe('interleaved-attribute-columns');
  expect(plan.groups.some(group => group.kind === 'unmanaged-attribute-column')).toBe(false);
  expect(attributeManager.getBufferLayouts({isInstanced: true}).map(layout => layout.name)).toEqual(
    ['position-attribute-columns', 'interleaved-attribute-columns']
  );
});

test('AttributeManager.getBufferLayouts - external GPU picking colors stay unmanaged', () => {
  const testDevice = createDevice({maxVertexBuffers: 2});
  const externalBuffer = testDevice.createBuffer({byteLength: 8});
  const attributeManager = new AttributeManager(testDevice);
  attributeManager.addInstanced({
    instancePickingColors: {
      size: 4,
      type: 'uint8',
      noAlloc: true,
      update: (attribute: any, {numInstances}: {numInstances: number}) => {
        attribute.value = new Uint8Array(numInstances * 4);
      }
    }
  });

  try {
    attributeManager.update({
      numInstances: 2,
      data: [{}, {}],
      buffers: {
        instancePickingColors: externalBuffer
      },
      props: {},
      transitions: {}
    });

    const plan = TableBufferPlanner.getAllocationPlan({
      device: testDevice,
      columns: getColumnDescriptors(attributeManager, {isInstanced: true}),
      modelInfo: {isInstanced: true},
      generateConstantAttributes: true,
      isTransitionAttribute: () => false
    });

    expect(plan.groupsByColumnId.instancePickingColors[0].kind).toBe('unmanaged-attribute-column');
    expect(
      attributeManager.getBufferLayouts({isInstanced: true}).map(layout => layout.name)
    ).toEqual(['instancePickingColors']);
  } finally {
    externalBuffer.delete();
  }
});

test('AttributeManager.getBufferLayouts - external GPU-only data columns stay unmanaged', () => {
  const testDevice = createDevice({maxVertexBuffers: 2});
  const externalBuffer = testDevice.createBuffer({byteLength: 8});
  const attributeManager = new AttributeManager(testDevice);
  attributeManager.addInstanced({
    instanceValues: {
      size: 1,
      type: 'float32',
      accessor: 'getValue'
    }
  });

  try {
    attributeManager.update({
      numInstances: 2,
      data: [{}, {}],
      buffers: {
        instanceValues: externalBuffer
      },
      props: {},
      transitions: {}
    });

    const plan = TableBufferPlanner.getAllocationPlan({
      device: testDevice,
      columns: getColumnDescriptors(attributeManager, {isInstanced: true}),
      modelInfo: {isInstanced: true},
      generateConstantAttributes: true,
      isTransitionAttribute: () => false
    });

    expect(plan.groupsByColumnId.instanceValues[0].kind).toBe('unmanaged-attribute-column');
    expect(
      attributeManager.getBufferLayouts({isInstanced: true}).map(layout => layout.name)
    ).toEqual(['instanceValues']);

    const modelBindings = attributeManager.getModelBindingPlan(
      {},
      {isInstanced: true},
      {includeAllAttributes: true}
    );
    expect(modelBindings.buffers.instanceValues).toBe(externalBuffer);

    const unchangedBindings = attributeManager.getModelBindings({}, {isInstanced: true});
    expect(unchangedBindings.buffers.instanceValues).toBeUndefined();
  } finally {
    externalBuffer.delete();
  }
});

test('AttributeManager.getBufferLayouts - reserves slots for model geometry', () => {
  const attributeManager = new AttributeManager(createDevice({maxVertexBuffers: 8}));
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

  const modelBindings = attributeManager.getModelBindings(attributeManager.getAttributes(), {
    isInstanced: true,
    reservedVertexBufferCount: 1
  });
  expect(Object.keys(modelBindings.buffers).sort()).toEqual(
    layouts.map(layout => layout.name).sort()
  );
});

test('AttributeManager.getModelBindings - packs IconLayer shader attributes by row', async () => {
  const attributeManager = new AttributeManager(createDevice({maxVertexBuffers: 8}));
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

  const layout = attributeManager.getBufferLayouts({
    isInstanced: true,
    reservedVertexBufferCount: 1
  })[0];
  const offsets = Object.fromEntries(
    layout.attributes.map(attribute => [attribute.attribute, attribute.byteOffset])
  );
  expect(layout.byteStride).toBe(28);
  expect(offsets).toEqual({
    instanceOffsets: 0,
    instanceIconFrames: 8,
    instanceColorModes: 24
  });

  const modelBindings = attributeManager.getModelBindings(attributeManager.getAttributes(), {
    isInstanced: true,
    reservedVertexBufferCount: 1
  });
  const packedBytes = await modelBindings.buffers.instanceIconDefs.readAsync(0, 56);

  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 14))).toEqual([
    1, 2, 3, 4, 5, 6, 7, 100, 101, 102, 103, 104, 105, 106
  ]);
});

test('AttributeManager.getModelBindings - packs fp64 position high rows', async () => {
  const attributeManager = new AttributeManager(createDevice());
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

  const modelBindings = attributeManager.getModelBindings(attributeManager.getAttributes(), {
    isInstanced: true
  });
  const packedBytes = await modelBindings.buffers['position-attribute-columns'].readAsync(0, 24);

  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 6))).toEqual([
    -35,
    Math.fround(36.7),
    0,
    10,
    20,
    0
  ]);
});

test('AttributeManager.getBufferLayouts - packs MultiIconLayer attributes within WebGPU limits', () => {
  const attributeManager = new AttributeManager(createDevice({maxVertexBuffers: 8}));
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

test('AttributeManager.getBufferLayouts - throws when planned buffers exceed device limit', () => {
  const attributeManager = new AttributeManager(createDevice({maxVertexBuffers: 1}));
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

test('AttributeManager.getBufferLayouts - throws when reserved buffers exceed device limit', () => {
  const attributeManager = new AttributeManager(createDevice({maxVertexBuffers: 2}));
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

test('AttributeManager.getBufferLayouts - throws when packed stride exceeds device limit', () => {
  const attributeManager = new AttributeManager(createDevice({maxVertexBufferArrayStride: 8}));
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
