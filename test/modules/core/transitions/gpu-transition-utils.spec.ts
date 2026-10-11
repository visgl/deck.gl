// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {Timeline} from '@luma.gl/engine';
import type {Buffer} from '@luma.gl/core';

import Attribute from '@deck.gl/core/lib/attribute/attribute';
import {GPUTransitionBase} from '@deck.gl/core/transitions/gpu-transition';
import type {TransitionSettings} from '@deck.gl/core/lib/attribute/transition-settings';
import {
  cloneAttribute,
  getAttributeBufferLength
} from '@deck.gl/core/transitions/gpu-transition-utils';

class TestGPUTransition extends GPUTransitionBase<TransitionSettings> {
  readonly type = 'test';

  onUpdate(): void {}

  setTransitionBuffer(buffer: Buffer): void {
    this.setBuffer(buffer);
  }
}

test('WebGPU Float32-backed fp64 transition uses a split buffer layout', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) {
    return skip();
  }
  const attribute = new Attribute(device, {
    id: 'instancePositions',
    type: 'float64',
    fp64: false,
    size: 3,
    accessor: 'getPosition',
    transition: true
  });
  attribute.setData({value: new Float32Array(6)});

  expect(attribute.isDoublePrecisionBuffer).toBe(true);
  expect(getAttributeBufferLength(attribute, 2)).toBe(12);

  const clonedAttribute = cloneAttribute(attribute);
  expect(clonedAttribute.getBufferLayout().byteStride).toBe(24);

  const transition = new TestGPUTransition({device, attribute, timeline: new Timeline()});
  const transitionBuffer = device.createBuffer({byteLength: 48});
  transition.setTransitionBuffer(transitionBuffer);

  expect(transition.attributeInTransition.getBufferLayout().byteStride).toBe(24);
  expect(transition.attributeInTransition.getValue().instancePositions64Low).toBe(transitionBuffer);

  transition.delete();
  transition.attributeInTransition.delete();
  transitionBuffer.destroy();
  clonedAttribute.delete();
  attribute.delete();
});
