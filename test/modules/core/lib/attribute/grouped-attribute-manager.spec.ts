// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import GroupedAttributeManager from '@deck.gl/core/lib/attribute/grouped-attribute-manager';
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

test('GroupedAttributeManager imports', () => {
  expect(typeof GroupedAttributeManager).toBe('function');
});

test('GroupedAttributeManager.getBufferLayouts - collapses shared groups', () => {
  const attributeManager = new GroupedAttributeManager(createWebGPUDevice());
  attributeManager.addInstanced({
    instanceSizes: {size: 1, accessor: 'getSize', bufferGroup: 'group-a'},
    instanceAngles: {size: 1, accessor: 'getAngle', bufferGroup: 'group-a'},
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

  expect(attributeManager.getBufferLayouts({isInstanced: true}).map(layout => layout.name)).toEqual(
    ['group-a', 'instancePositions']
  );
});

test('GroupedAttributeManager.getPublishedAttributes - groups vertex, constant, and index bindings', () => {
  const attributeManager = new GroupedAttributeManager(device);
  attributeManager.add({
    indices: {size: 1, isIndexed: true, accessor: 'getIndex'}
  });
  attributeManager.addInstanced({
    instanceSizes: {size: 1, accessor: 'getSize', bufferGroup: 'group-a'},
    instanceAngles: {size: 1, accessor: 'getAngle', bufferGroup: 'group-a'}
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
    attributeManager.getAttributes()
  );

  expect(publishedAttributes.buffers['group-a']).toBeTruthy();
  expect(Array.from(publishedAttributes.constants.instanceSizes)).toEqual([3]);
  expect(publishedAttributes.indexBuffers).toHaveLength(1);
});

test('GroupedAttributeManager.getBufferLayouts - actively transitioning attributes stay standalone', () => {
  const attributeManager = new GroupedAttributeManager(device);
  attributeManager.addInstanced({
    instancePositions: {size: 3, accessor: 'getPosition', bufferGroup: 'group-a', transition: true},
    instanceSizes: {size: 1, accessor: 'getSize', bufferGroup: 'group-a'}
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
    ['instancePositions', 'group-a']
  );
});

test('GroupedAttributeManager.getPackedBufferAttributes - preserves shared buffers across partial rewrites', () => {
  const attributeManager = new GroupedAttributeManager(createWebGPUDevice());
  attributeManager.addInstanced({
    instanceSizes: {size: 1, accessor: 'getSize', bufferGroup: 'group-a'},
    instanceAngles: {size: 1, accessor: 'getAngle', bufferGroup: 'group-a'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [{angle: 10}, {angle: 20}],
    props: {
      getSize: 3,
      getAngle: (x: {angle: number}) => x.angle
    },
    transitions: {}
  });

  const initialBuffer = attributeManager.getPackedBufferAttributes(
    attributeManager.getAttributes()
  )['group-a'];

  attributeManager.invalidate('getAngle');
  attributeManager.update({
    numInstances: 2,
    data: [{angle: 30}, {angle: 40}],
    props: {
      getSize: 3,
      getAngle: (x: {angle: number}) => x.angle
    },
    transitions: {}
  });

  const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});
  const updatedBuffer = attributeManager.getPackedBufferAttributes({
    instanceAngles: changedAttributes.instanceAngles
  })['group-a'];

  expect(updatedBuffer).toBe(initialBuffer);
});

test('GroupedAttributeManager.update - shared packed attributes skip standalone buffers', () => {
  const attributeManager = new GroupedAttributeManager(createWebGPUDevice());
  attributeManager.addInstanced({
    instanceSizes: {size: 1, accessor: 'getSize', bufferGroup: 'group-a'},
    instanceAngles: {size: 1, accessor: 'getAngle', bufferGroup: 'group-a'},
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
  expect(attributes.instancePositions.getBuffer()).toBeTruthy();
  expect(
    attributeManager.getPublishedAttributes(attributeManager.getAttributes()).buffers['group-a']
  ).toBeTruthy();
});

test('GroupedAttributeManager.getBufferLayouts - grouped layout stays stable across accessor/constant flips', () => {
  const attributeManager = new GroupedAttributeManager(device);
  attributeManager.addInstanced({
    instanceSizes: {size: 1, accessor: 'getSize', bufferGroup: 'group-a'},
    instanceAngles: {size: 1, accessor: 'getAngle', bufferGroup: 'group-a'}
  });

  attributeManager.update({
    numInstances: 2,
    data: [{angle: 10}, {angle: 20}],
    props: {
      getSize: 3,
      getAngle: (x: {angle: number}) => x.angle
    },
    transitions: {}
  });

  const accessorLayout = attributeManager.getBufferLayouts();

  attributeManager.invalidate('instanceAngles');
  attributeManager.update({
    numInstances: 2,
    data: [{angle: 10}, {angle: 20}],
    props: {
      getSize: 3,
      getAngle: 5
    },
    transitions: {}
  });

  expect(attributeManager.getBufferLayouts()).toEqual(accessorLayout);
  expect(
    attributeManager.getPublishedAttributes(attributeManager.getAttributes()).buffers['group-a']
  ).toBeTruthy();
});
