// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import GroupedAttributeManager from '@deck.gl/core/lib/attribute/grouped-attribute-manager';
import {test, expect, vi} from 'vitest';
import {device} from '@deck.gl/test-utils/vitest';

function createDevice({
  type = 'webgpu',
  maxVertexBuffers = device.limits.maxVertexBuffers,
  maxVertexBufferArrayStride = device.limits.maxVertexBufferArrayStride
}: {
  type?: 'webgl' | 'webgpu';
  maxVertexBuffers?: number;
  maxVertexBufferArrayStride?: number;
} = {}) {
  const limits = Object.create(device.limits);
  Object.defineProperty(limits, 'maxVertexBuffers', {value: maxVertexBuffers});
  Object.defineProperty(limits, 'maxVertexBufferArrayStride', {
    value: maxVertexBufferArrayStride
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

  expect(attributeManager.getBufferLayouts({isInstanced: true}).map(layout => layout.name)).toEqual(
    ['geometry', 'constants', 'positionAttributes', 'instanceAngles']
  );
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

test('GroupedAttributeManager.getBufferLayouts - active transitions stay standalone', () => {
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
    ['instancePositions', 'constants']
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
    data: [{angle: 10, size: 1}, {angle: 20, size: 2}],
    props: {
      getSize: (x: {size: number}) => x.size,
      getAngle: (x: {angle: number}) => x.angle
    },
    transitions: {}
  });

  const initialBuffer = attributeManager.getPackedBufferAttributes(
    attributeManager.getAttributes(),
    {isInstanced: true}
  ).overflow;
  let packedBytes = await initialBuffer.readAsync(0, 16);
  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 4))).toEqual([
    10, 1, 20, 2
  ]);

  attributeManager.invalidate('getAngle');
  attributeManager.update({
    numInstances: 2,
    data: [{angle: 30, size: 1}, {angle: 40, size: 2}],
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
  ).overflow;

  expect(updatedBuffer).toBe(initialBuffer);
  packedBytes = await updatedBuffer.readAsync(0, 16);
  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 4))).toEqual([
    30, 1, 40, 2
  ]);
});

test('GroupedAttributeManager.update - planned attributes skip standalone buffers', () => {
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
  expect(published.buffers.constants).toBeTruthy();
  expect(published.buffers.positionAttributes).toBeTruthy();
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
    data: [
      {position: [0.1, 0.2, 0.3]},
      {position: [1.1, 1.2, 1.3]}
    ],
    props: {
      getPosition: (x: {position: number[]}) => x.position
    },
    transitions: {}
  });

  const layouts = attributeManager.getBufferLayouts({isInstanced: true});

  expect(layouts.map(layout => layout.name)).toEqual(['constants', 'positionAttributes']);
  expect(layouts[0].attributes.map(attribute => attribute.attribute)).toEqual([
    'instancePositions64Low'
  ]);
  expect(layouts[1].attributes.map(attribute => attribute.attribute)).toEqual([
    'instancePositions'
  ]);

  const published = attributeManager.getPublishedAttributes(attributeManager.getAttributes(), {
    isInstanced: true
  });
  expect(published.buffers.constants).toBeTruthy();
  expect(published.buffers.positionAttributes).toBeTruthy();
});

test('GroupedAttributeManager.getBufferLayouts - priority controls dedicated vs overflow', () => {
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
    ['instanceColors', 'overflow']
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
    'constants',
    'positionAttributes',
    'instanceColors',
    'instanceAngles',
    'instanceIconDefs',
    'instancePixelOffset',
    'overflow'
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
    data: [
      {position: [-35, 36.7, 0]},
      {position: [10, 20, 0]}
    ],
    props: {
      getPosition: (x: {position: number[]}) => x.position
    },
    transitions: {}
  });

  const published = attributeManager.getPublishedAttributes(attributeManager.getAttributes(), {
    isInstanced: true
  });
  const packedBytes = await published.buffers.positionAttributes.readAsync(0, 24);

  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 6))).toEqual([
    -35, Math.fround(36.7), 0, 10, 20, 0
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
