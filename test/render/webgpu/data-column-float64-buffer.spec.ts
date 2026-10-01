// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// On WebGL, the low part of an external Buffer bound to a double-precision attribute is a
// constant zero. WebGPU has no constant attributes, so it is read from a one-row zero buffer.

/// <reference types="@webgpu/types" />

import {test, expect, beforeAll, describe} from 'vitest';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {Buffer} from '@luma.gl/core';
import type {Device} from '@luma.gl/core';
import {Timeline} from '@luma.gl/engine';

import Attribute from '@deck.gl/core/lib/attribute/attribute';
import AttributeManager from '@deck.gl/core/lib/attribute/attribute-manager';
import {ZERO_LOW_BUFFER_NAME} from '@deck.gl/core/lib/attribute/gl-utils';
import AttributeTransitionManager from '@deck.gl/core/lib/attribute/attribute-transition-manager';
import {isRenderTestDeviceEnabled} from '../render-test-suite';

const NUM_INSTANCES = 4;

describe.runIf(isRenderTestDeviceEnabled('webgpu'))(
  'Attribute external Buffer on a float64 attribute (WebGPU)',
  () => {
    let device: Device;

    beforeAll(async () => {
      // A missing adapter must fail the suite, not skip it
      const adapter = await navigator.gpu?.requestAdapter();
      expect(adapter, 'navigator.gpu.requestAdapter() returns an adapter').toBeTruthy();
      const webgpuDevice = await getWebGPUTestDevice();
      expect(webgpuDevice, 'WebGPU test device').toBeTruthy();
      device = webgpuDevice!;
    });

    function createPositionAttribute(options: Record<string, unknown> = {}) {
      const attribute = new Attribute(device, {
        id: 'instancePositions',
        type: 'float64',
        size: 3,
        accessor: 'getPosition',
        stepMode: 'instance',
        ...options
      });
      attribute.numInstances = NUM_INSTANCES;
      return attribute;
    }

    function createBuffer(byteLength: number): Buffer {
      return device.createBuffer({usage: Buffer.VERTEX | Buffer.COPY_DST, byteLength});
    }

    async function readFloats(buffer: Buffer): Promise<Float32Array> {
      const bytes = await buffer.readAsync();
      return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
    }

    test('reads the low part of a float32x3 Buffer from a zero buffer', async () => {
      const attribute = createPositionAttribute();
      const buffer = createBuffer(NUM_INSTANCES * 12);
      attribute.setExternalBuffer({buffer, stride: 12});

      expect(attribute.hasZeroLowBuffer).toBe(true);
      const value = attribute.getValue();
      expect(value.instancePositions, 'high part bound to the external Buffer').toBe(buffer);
      const lowBuffer = value[ZERO_LOW_BUFFER_NAME] as Buffer;
      expect(lowBuffer, 'low part bound to a separate Buffer').toBeInstanceOf(Buffer);
      expect(lowBuffer).not.toBe(buffer);
      expect(await readFloats(lowBuffer)).toEqual(new Float32Array(4));

      expect(attribute.getBufferLayouts()).toEqual([
        {
          name: 'instancePositions',
          byteStride: 12,
          stepMode: 'instance',
          attributes: [{attribute: 'instancePositions', format: 'float32x3', byteOffset: 0}]
        },
        {
          name: ZERO_LOW_BUFFER_NAME,
          byteStride: 0,
          stepMode: 'instance',
          attributes: [{attribute: 'instancePositions64Low', format: 'float32x3', byteOffset: 0}]
        }
      ]);

      attribute.delete();
      expect(lowBuffer.destroyed, 'zero buffer is deleted with the attribute').toBe(true);
      buffer.destroy();
    });

    test('supports binary size overrides after the zero buffer is created', async () => {
      const attribute = createPositionAttribute();
      const buffer = createBuffer(NUM_INSTANCES * 16);
      attribute.setExternalBuffer({buffer, stride: 16});
      const lowBuffer = attribute.getValue()[ZERO_LOW_BUFFER_NAME] as Buffer;

      attribute.setExternalBuffer({buffer, size: 4, stride: 16});
      expect(attribute.getValue()[ZERO_LOW_BUFFER_NAME]).toBe(lowBuffer);
      expect(attribute.getBufferLayouts()[1].attributes).toEqual([
        {attribute: 'instancePositions64Low', format: 'float32x4', byteOffset: 0}
      ]);
      expect(await readFloats(lowBuffer)).toEqual(new Float32Array(4));

      attribute.delete();
      buffer.destroy();
    });

    test('preserves base and shader vertex offsets with external buffers', () => {
      const attribute = createPositionAttribute({
        vertexOffset: 1,
        shaderAttributes: {
          instanceSourcePositions: {vertexOffset: 0},
          instanceTargetPositions: {vertexOffset: 2}
        }
      });
      const buffer = createBuffer(4 + (NUM_INSTANCES + 2) * 24);
      attribute.setExternalBuffer({buffer, offset: 4, stride: 24});

      const [layout, lowLayout] = attribute.getBufferLayouts();
      expect(layout.attributes).toEqual([
        {attribute: 'instancePositions', format: 'float32x3', byteOffset: 28},
        {attribute: 'instanceSourcePositions', format: 'float32x3', byteOffset: 4},
        {attribute: 'instanceTargetPositions', format: 'float32x3', byteOffset: 52}
      ]);
      expect(lowLayout.attributes?.map(attribute => attribute.byteOffset)).toEqual([0, 0, 0]);

      attribute.delete();
      buffer.destroy();
    });

    test('ignores the low part of [high, low] rows, as on WebGL', () => {
      const attribute = createPositionAttribute();
      const buffer = createBuffer(NUM_INSTANCES * 24);
      attribute.setExternalBuffer(buffer);

      const [layout, lowLayout] = attribute.getBufferLayouts();
      expect(layout.byteStride, 'default stride of a float64 attribute').toBe(24);
      expect(layout.attributes?.map(attribute => attribute.attribute)).toEqual([
        'instancePositions'
      ]);
      expect(lowLayout.name).toBe(ZERO_LOW_BUFFER_NAME);

      buffer.destroy();
      attribute.delete();
    });

    test('uses the fp64: false default stride', () => {
      const attribute = createPositionAttribute({fp64: false});
      const buffer = createBuffer(NUM_INSTANCES * 12);
      attribute.setExternalBuffer(buffer);

      expect(attribute.getBufferLayouts().map(layout => layout.byteStride)).toEqual([12, 0]);

      buffer.destroy();
      attribute.delete();
    });

    test('declares a low part for each shader attribute', () => {
      const attribute = createPositionAttribute({
        shaderAttributes: {
          instanceSourcePositions: {vertexOffset: 0},
          instanceTargetPositions: {vertexOffset: 1}
        }
      });
      const buffer = createBuffer((NUM_INSTANCES + 1) * 12);
      attribute.setExternalBuffer({buffer, stride: 12});

      const [layout, lowLayout] = attribute.getBufferLayouts();
      expect(layout.attributes).toEqual([
        {attribute: 'instancePositions', format: 'float32x3', byteOffset: 0},
        {attribute: 'instanceSourcePositions', format: 'float32x3', byteOffset: 0},
        {attribute: 'instanceTargetPositions', format: 'float32x3', byteOffset: 12}
      ]);
      expect(lowLayout.attributes).toEqual([
        {attribute: 'instancePositions64Low', format: 'float32x3', byteOffset: 0},
        {attribute: 'instanceSourcePositions64Low', format: 'float32x3', byteOffset: 0},
        {attribute: 'instanceTargetPositions64Low', format: 'float32x3', byteOffset: 0}
      ]);
      // One zero buffer is bound to the layout of all low parts
      const value = attribute.getValue();
      expect(value[ZERO_LOW_BUFFER_NAME]).toBeInstanceOf(Buffer);
      expect(value.instanceSourcePositions64Low).toBeUndefined();

      buffer.destroy();
      attribute.delete();
    });

    test.each([false, true])('shares a zero slot across columns (groups: %s)', grouped => {
      const manager = new AttributeManager(device);
      manager.addInstanced({
        source: {size: 3, type: 'float64', accessor: 'getSource'},
        target: {size: 3, type: 'float64', accessor: 'getTarget'},
        width: {size: 1, accessor: 'getWidth', bufferGroup: grouped ? 'style' : undefined},
        height: {size: 1, accessor: 'getHeight', bufferGroup: grouped ? 'style' : undefined}
      });
      const buffer = createBuffer(NUM_INSTANCES * 12);
      manager.update({
        data: Array.from({length: NUM_INSTANCES}, () => ({})),
        numInstances: NUM_INSTANCES,
        props: {getWidth: () => 1, getHeight: () => 2},
        buffers: {
          getSource: {buffer, stride: 12},
          getTarget: {buffer, stride: 12}
        },
        transitions: {},
        context: {}
      });

      const layouts = manager.getBufferLayouts();
      const lowLayouts = layouts.filter(layout => layout.name === ZERO_LOW_BUFFER_NAME);
      expect(lowLayouts).toHaveLength(1);
      expect(lowLayouts[0].attributes).toEqual([
        {attribute: 'source64Low', format: 'float32x3', byteOffset: 0},
        {attribute: 'target64Low', format: 'float32x3', byteOffset: 0}
      ]);
      if (grouped) {
        const bindings = manager.getBufferGroupBindings({}, {isInstanced: true});
        expect(bindings.bufferLayouts).toEqual(layouts);
        expect(bindings.groupedAttributeIds).toEqual(new Set(['width', 'height']));
      }

      manager.finalize();
      buffer.destroy();
    });

    test('flags a layout change when switching to and from an external Buffer', () => {
      const attribute = createPositionAttribute();
      attribute.setExternalBuffer(new Float64Array(NUM_INSTANCES * 3));
      attribute.getBufferLayouts();
      expect(attribute.layoutChanged()).toBe(false);

      // Same accessor as the Float64Array (stride 24), but the low part moves to the zero buffer
      const buffer = createBuffer(NUM_INSTANCES * 24);
      attribute.setExternalBuffer(buffer);
      expect(attribute.layoutChanged(), 'switch to external Buffer').toBe(true);
      expect(attribute.getBufferLayouts()).toHaveLength(2);
      expect(attribute.layoutChanged()).toBe(false);

      attribute.setExternalBuffer(new Float64Array(NUM_INSTANCES * 3));
      expect(attribute.layoutChanged(), 'switch back to Float64Array').toBe(true);
      const layouts = attribute.getBufferLayouts();
      expect(layouts).toHaveLength(1);
      expect(layouts[0].attributes?.map(attribute => attribute.byteOffset)).toEqual([0, 12]);

      buffer.destroy();
      attribute.delete();
    });

    test('GPU transitions of an external Buffer are not supported, as for deck-managed data', () => {
      // BufferTransform is WebGL-only, so the zero buffer never feeds a transition
      const attribute = createPositionAttribute({transition: true});
      const buffer = createBuffer(NUM_INSTANCES * 12);
      attribute.setExternalBuffer({buffer, stride: 12});
      const manager = new AttributeTransitionManager(device, {
        id: 'transitions',
        timeline: new Timeline()
      });

      expect(() =>
        manager.update({
          attributes: {instancePositions: attribute},
          transitions: {getPosition: 1000},
          numInstances: NUM_INSTANCES
        })
      ).toThrow('BufferTransform not yet implemented on WebGPU');

      manager.finalize();
      buffer.destroy();
      attribute.delete();
    });
  }
);
