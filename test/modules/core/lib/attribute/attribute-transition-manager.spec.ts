// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-statements */
import AttributeTransitionManager from '@deck.gl/core/lib/attribute/attribute-transition-manager';
import Attribute from '@deck.gl/core/lib/attribute/attribute';
import {test, expect} from 'vitest';
import type {Buffer} from '@luma.gl/core';
import {Timeline} from '@luma.gl/engine';
import {device} from '@deck.gl/test-utils';

const TEST_ATTRIBUTES = (function () {
  const indices = new Attribute(device, {
    id: 'indices',
    isIndexed: true,
    size: 1,
    update: () => {}
  });
  indices.setData({value: new Float32Array([0, 1, 2, 1, 3, 2])});

  const instancePositions = new Attribute(device, {
    id: 'instancePositions',
    size: 3,
    accessor: ['getPosition', 'getElevation'],
    update: () => {},
    transition: true
  });
  instancePositions.setData({value: new Float32Array(12)});

  const instanceSizes = new Attribute(device, {
    id: 'instanceSizes',
    size: 1,
    accessor: 'getSize',
    defaultValue: 1,
    transition: true
  });
  instanceSizes.setData({value: new Float32Array(4)});

  return {indices, instancePositions, instanceSizes};
})();

test('AttributeTransitionManager#constructor', () => {
  let manager = new AttributeTransitionManager(device, {id: 'attribute-transition'});
  expect(manager, 'AttributeTransitionManager is constructed').toBeTruthy();

  manager.finalize();
  console.log('AttributeTransitionManager is finalized');

  expect(
    () => new AttributeTransitionManager(null, {id: 'attribute-transition'}),
    'AttributeTransitionManager is constructed without device'
  ).toThrow();
});

test('AttributeTransitionManager#update', async () => {
  const timeline = new Timeline();
  const manager = new AttributeTransitionManager(device, {id: 'attribute-transition', timeline});
  const attributes = Object.assign({}, TEST_ATTRIBUTES);

  attributes.indices.setNeedsRedraw('initial');
  attributes.instanceSizes.setNeedsRedraw('initial');
  attributes.instancePositions.setNeedsRedraw('initial');

  manager.update({attributes, transitions: {}, numInstances: 4});
  expect(manager.hasAttribute('indices'), 'no transition for indices').toBeFalsy();
  expect(manager.hasAttribute('instanceSizes'), 'no transition for instanceSizes').toBeFalsy();
  expect(
    manager.hasAttribute('instancePositions'),
    'no transition for instancePositions'
  ).toBeFalsy();

  manager.update({attributes, transitions: {getSize: 1000, getElevation: 1000}, numInstances: 0});
  expect(manager.hasAttribute('indices'), 'no transition for indices').toBeFalsy();
  expect(manager.hasAttribute('instanceSizes'), 'added transition for instanceSizes').toBeTruthy();
  expect(
    manager.hasAttribute('instancePositions'),
    'added transition for instancePositions'
  ).toBeTruthy();

  // byteLength = max(numInstances, 1) * 4. Later reallocation may skip the padding.
  const sizeTransition = manager.transitions.instanceSizes;
  expect(sizeTransition.buffers[0].byteLength, 'buffer has correct size').toBe(4);

  const positionTransform = manager.transitions.instancePositions.transform;
  expect(positionTransform, 'transform is constructed for instancePositions').toBeTruthy();
  delete attributes.instancePositions;

  manager.update({attributes, transitions: {getSize: 1000, getElevation: 1000}, numInstances: 4});
  expect(manager.hasAttribute('instanceSizes'), 'added transition for instanceSizes').toBeTruthy();
  expect(
    manager.hasAttribute('instancePositions'),
    'removed transition for instancePositions'
  ).toBeFalsy();
  expect(positionTransform._handle, 'instancePositions transform is deleted').toBeFalsy();
  expect(sizeTransition.buffers[0].byteLength, 'buffer has correct size').toBe(4 * 4);

  attributes.instanceSizes.setData({value: new Float32Array(10).fill(1)});
  manager.update({attributes, transitions: {getSize: 1000}, numInstances: 10});
  manager.run();
  let transitioningBuffer = manager.getAttributes().instanceSizes.getBuffer();
  let actual = await readArray(transitioningBuffer);
  expect(actual, 'buffer is extended with new data').toEqual([0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
  expect(transitioningBuffer.byteLength, 'buffer has correct size').toBe(10 * 4);

  attributes.instanceSizes.setData({constant: true, value: [2]});
  manager.update({attributes, transitions: {getSize: 1000}, numInstances: 12});
  manager.run();
  transitioningBuffer = manager.getAttributes().instanceSizes.getBuffer();
  actual = await readArray(transitioningBuffer);
  expect(actual, 'buffer is extended with new data').toEqual([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2]);
  expect(transitioningBuffer.byteLength, 'buffer has correct size').toBe(12 * 4);

  manager.finalize();
  expect(transitioningBuffer._handle, 'transform buffer is deleted').toBeFalsy();
  expect(manager.transitions.instanceSizes, 'transition is deleted').toBeFalsy();
});

test('AttributeTransitionManager#transition', async () => {
  const timeline = new Timeline();
  const manager = new AttributeTransitionManager(device, {id: 'attribute-transition', timeline});
  const attributes = Object.assign({}, TEST_ATTRIBUTES);

  let startCounter = 0;
  let interruptCounter = 0;
  let endCounter = 0;
  const transitions = {
    getSize: {
      duration: 1000,
      onStart: () => {
        startCounter++;
      },
      onInterrupt: () => {
        interruptCounter++;
      },
      onEnd: () => {
        endCounter++;
      }
    }
  };

  attributes.instanceSizes.setData({value: new Float32Array(4).fill(1)});
  attributes.instanceSizes.setNeedsRedraw('initial');

  timeline.setTime(0);
  manager.update({attributes, transitions, numInstances: 4});
  manager.run();
  expect(startCounter, 'transition starts').toBe(1);

  timeline.setTime(500);
  attributes.instanceSizes.needsRedraw({clearChangedFlags: true});
  manager.update({attributes, transitions, numInstances: 4});
  manager.run();
  expect(startCounter, 'no new transition is triggered').toBe(1);

  timeline.setTime(1000);
  attributes.instanceSizes.setData({value: new Float32Array(4).fill(3)});
  attributes.instanceSizes.setNeedsRedraw('update');
  manager.update({attributes, transitions, numInstances: 4});
  manager.run();
  expect(interruptCounter, 'transition is interrupted').toBe(1);
  expect(startCounter, 'new transition is triggered').toBe(2);

  timeline.setTime(1500);
  manager.run();
  let actual = await readArray(manager.getAttributes().instanceSizes.getBuffer());
  expect(actual.slice(0, 4), 'attribute in transition').toEqual([2, 2, 2, 2]);

  attributes.instanceSizes.setData({value: new Float32Array(4).fill(4)});
  attributes.instanceSizes.setNeedsRedraw('update');

  manager.update({attributes, transitions, numInstances: 4});
  manager.run();
  expect(interruptCounter, 'transition is interrupted').toBe(2);
  expect(startCounter, 'new transition is triggered').toBe(3);

  timeline.setTime(2000);
  manager.run();
  actual = await readArray(manager.getAttributes().instanceSizes.getBuffer());
  expect(actual.slice(0, 4), 'attribute in transition').toEqual([3, 3, 3, 3]);

  timeline.setTime(2500);
  manager.run();
  expect(endCounter, 'transition ends').toBe(1);

  manager.finalize();
});

async function readArray(buffer: Buffer): Promise<number[]> {
  const result = await buffer.readAsync();
  return Array.from(new Float32Array(result.buffer, result.byteOffset, result.byteLength / 4));
}
