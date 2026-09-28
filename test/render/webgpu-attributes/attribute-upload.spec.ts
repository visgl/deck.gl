// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect, beforeAll} from 'vitest';
import {Buffer} from '@luma.gl/core';
import type {Device} from '@luma.gl/core';
import Attribute from '@deck.gl/core/lib/attribute/attribute';
import AttributeManager from '@deck.gl/core/lib/attribute/attribute-manager';
import {getRequiredWebGPUDevice, getValidationError} from './webgpu-test-device';
import {isRenderTestDeviceEnabled} from '../render-test-suite';

const DEFAULT_COLOR = [0, 0, 0, 255];

describe.skipIf(!isRenderTestDeviceEnabled('webgpu'))('WebGPU attribute upload', () => {
  let device: Device;

  beforeAll(async () => {
    device = await getRequiredWebGPUDevice();
  });

  /** CPU reference: repack `size`-component vertices into `paddedSize` components */
  function padReference(
    values: number[],
    size: number,
    paddedSize: number,
    padValues: number[]
  ): number[] {
    const result: number[] = [];
    for (let i = 0; i < values.length; i += size) {
      for (let j = 0; j < paddedSize; j++) {
        result.push(j < size ? values[i + j] : padValues[j]);
      }
    }
    return result;
  }

  async function readAttribute(
    attribute: Attribute,
    ArrayType: typeof Uint8Array | typeof Uint16Array,
    length: number
  ): Promise<number[]> {
    const bytes = await attribute.getBuffer()!.readAsync(0, length * ArrayType.BYTES_PER_ELEMENT);
    return Array.from(new ArrayType(bytes.buffer, bytes.byteOffset, length));
  }

  function createColorAttribute(size: number): Attribute {
    return new Attribute(device, {
      id: 'colors',
      size,
      type: 'unorm8',
      accessor: 'getColor',
      defaultValue: DEFAULT_COLOR
    });
  }

  test('WebGPU RGB constant color is padded to unorm8x4 on upload', async () => {
    const attribute = createColorAttribute(3);
    attribute.numInstances = 3;

    const error = await getValidationError(device, () =>
      attribute.setConstantValue(null, [10, 20, 30])
    );
    expect(error, 'no WebGPU error during constant upload').toBeNull();

    // WebGPU constants are a single row read with byteStride 0
    const layout = attribute.getBufferLayout();
    expect(layout.byteStride).toBe(0);
    expect(layout.attributes![0].format).toBe('unorm8x4');
    const expected = padReference([10, 20, 30], 3, 4, DEFAULT_COLOR);
    expect(await readAttribute(attribute, Uint8Array, 4)).toEqual(expected);
    attribute.delete();
  });

  test('WebGPU size-3 Uint8Array is padded on upload (colorFormat RGB)', async () => {
    const attribute = createColorAttribute(3);
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const error = await getValidationError(device, () =>
      attribute.setExternalBuffer(new Uint8Array(values))
    );
    expect(error, 'no WebGPU error during typed array upload').toBeNull();

    expect(await readAttribute(attribute, Uint8Array, 12)).toEqual(
      padReference(values, 3, 4, DEFAULT_COLOR)
    );
    attribute.delete();
  });

  test('WebGPU size-3 Uint8Array is padded on upload (colorFormat RGBA)', async () => {
    const attribute = createColorAttribute(4);
    const values = [1, 2, 3, 4, 5, 6];

    const error = await getValidationError(device, () =>
      attribute.setExternalBuffer({value: new Uint8Array(values), size: 3})
    );
    expect(error, 'no WebGPU error during typed array upload').toBeNull();

    expect(await readAttribute(attribute, Uint8Array, 8)).toEqual(
      padReference(values, 3, 4, DEFAULT_COLOR)
    );
    attribute.delete();
  });

  test('WebGPU interleaved size-3 Uint8Array is repacked, not passed through', async () => {
    const attribute = createColorAttribute(3);
    // The 4th byte of each vertex (99) must not leak into alpha
    const value = new Uint8Array([99, 1, 2, 3, 99, 4, 5, 6]);

    const error = await getValidationError(device, () =>
      attribute.setExternalBuffer({value, size: 3, stride: 4, offset: 1})
    );
    expect(error, 'no WebGPU error during interleaved upload').toBeNull();

    const layout = attribute.getBufferLayout();
    expect(layout.attributes![0].format, 'repacked format').toBe('unorm8x4');
    expect(layout.byteStride, 'repacked stride').toBe(4);
    expect(layout.attributes![0].byteOffset, 'repacked offset').toBe(0);
    expect(await readAttribute(attribute, Uint8Array, 8)).toEqual([1, 2, 3, 255, 4, 5, 6, 255]);
    attribute.delete();
  });

  test('WebGPU RGB accessor colors are padded, including partial updates', async () => {
    const attributeManager = new AttributeManager(device);
    attributeManager.add({
      colors: {size: 3, type: 'unorm8', accessor: 'getColor', defaultValue: DEFAULT_COLOR}
    });
    const data = [{color: [1, 2, 3]}, {color: [4, 5, 6]}, {color: [7, 8, 9]}];
    const props = {getColor: (d: {color: number[]}) => d.color};

    let error = await getValidationError(device, () =>
      attributeManager.update({data, numInstances: 3, props} as any)
    );
    expect(error, 'no WebGPU error during full update').toBeNull();

    const attribute = attributeManager.getAttributes().colors;
    expect(await readAttribute(attribute, Uint8Array, 12)).toEqual(
      padReference([1, 2, 3, 4, 5, 6, 7, 8, 9], 3, 4, DEFAULT_COLOR)
    );

    data[1] = {color: [40, 50, 60]};
    attributeManager.invalidate('getColor', {startRow: 1, endRow: 2});
    error = await getValidationError(device, () =>
      attributeManager.update({data, numInstances: 3, props} as any)
    );
    expect(error, 'no WebGPU error during partial update').toBeNull();

    expect(await readAttribute(attribute, Uint8Array, 12)).toEqual(
      padReference([1, 2, 3, 40, 50, 60, 7, 8, 9], 3, 4, DEFAULT_COLOR)
    );
    attributeManager.finalize();
  });

  test('WebGPU uint16 size 1 and size 3 are padded on upload', async () => {
    const cases = [
      {size: 1, paddedSize: 2, values: [1, 2, 3], padValues: [0, 0]},
      {size: 3, paddedSize: 4, values: [1, 2, 3, 4, 5, 6], padValues: [0, 0, 0, 1]}
    ];
    for (const {size, paddedSize, values, padValues} of cases) {
      const attribute = new Attribute(device, {id: `uint16x${size}`, size, accessor: 'getValue'});
      const error = await getValidationError(device, () =>
        attribute.setExternalBuffer(new Uint16Array(values))
      );
      expect(error, `no WebGPU error for uint16x${size}`).toBeNull();

      const expected = padReference(values, size, paddedSize, padValues);
      expect(await readAttribute(attribute, Uint16Array, expected.length)).toEqual(expected);
      attribute.delete();
    }
  });

  test('WebGPU unaligned external Buffer throws a descriptive error', () => {
    const attribute = createColorAttribute(3);
    const buffer = device.createBuffer({byteLength: 12, usage: Buffer.VERTEX | Buffer.COPY_DST});

    expect(() => attribute.setExternalBuffer(buffer)).toThrow(
      /unorm8x3 .*not a valid WebGPU vertex format/
    );
    buffer.destroy();
    attribute.delete();
  });

  test('WebGPU render pipeline accepts padded RGB color layout', async () => {
    const attribute = createColorAttribute(3);
    // 4 vertices = 12 bytes, so the upload itself is 4-byte aligned even on main
    attribute.setExternalBuffer(new Uint8Array([255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255]));

    const source = /* wgsl */ `\
  struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
  };

  @vertex
  fn vertexMain(@location(0) colors: vec4<f32>) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    output.color = colors;
    return output;
  }

  @fragment
  fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
    return input.color;
  }
  `;

    const error = await getValidationError(device, () => {
      const shader = device.createShader({id: 'padded-color', source});
      const pipeline = device.createRenderPipeline({
        id: 'padded-color',
        vs: shader,
        fs: shader,
        vertexEntryPoint: 'vertexMain',
        fragmentEntryPoint: 'fragmentMain',
        topology: 'point-list',
        shaderLayout: {
          attributes: [{name: 'colors', location: 0, type: 'vec4<f32>', stepMode: 'vertex'}],
          bindings: []
        },
        bufferLayout: [attribute.getBufferLayout()]
      });
      pipeline.destroy();
      shader.destroy();
    });
    expect(error, 'createRenderPipeline reports no WebGPU error').toBeNull();
    attribute.delete();
  });
});
