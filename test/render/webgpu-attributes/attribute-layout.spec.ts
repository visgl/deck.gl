// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect, beforeAll} from 'vitest';
import type {Device} from '@luma.gl/core';
import {getWebGLTestDevice} from '@luma.gl/test-utils';
import Attribute from '@deck.gl/core/lib/attribute/attribute';
import {getRequiredWebGPUDevice} from './webgpu-test-device';
import {isRenderTestDeviceEnabled} from '../render-test-suite';

// https://www.w3.org/TR/webgpu/#enumdef-gpuvertexformat
const GPU_VERTEX_FORMATS = new Set([
  'uint8',
  'uint8x2',
  'uint8x4',
  'sint8',
  'sint8x2',
  'sint8x4',
  'unorm8',
  'unorm8x2',
  'unorm8x4',
  'snorm8',
  'snorm8x2',
  'snorm8x4',
  'uint16',
  'uint16x2',
  'uint16x4',
  'sint16',
  'sint16x2',
  'sint16x4',
  'unorm16',
  'unorm16x2',
  'unorm16x4',
  'snorm16',
  'snorm16x2',
  'snorm16x4',
  'float16',
  'float16x2',
  'float16x4',
  'float32',
  'float32x2',
  'float32x3',
  'float32x4',
  'uint32',
  'uint32x2',
  'uint32x3',
  'uint32x4',
  'sint32',
  'sint32x2',
  'sint32x3',
  'sint32x4',
  'unorm10-10-10-2',
  'unorm8x4-bgra'
]);

const SMALL_TYPES = [
  'uint8',
  'sint8',
  'unorm8',
  'snorm8',
  'uint16',
  'sint16',
  'unorm16',
  'snorm16'
] as const;
const SIZES = [1, 2, 3, 4];

describe.skipIf(!isRenderTestDeviceEnabled('webgpu'))('WebGPU attribute layouts', () => {
  let webgpuDevice: Device;

  beforeAll(async () => {
    webgpuDevice = await getRequiredWebGPUDevice();
  });

  function getLayoutForAttribute(device: Device, type: string, size: number) {
    const attribute = new Attribute(device, {
      id: `${type}x${size}`,
      type: type as any,
      size,
      accessor: 'getValue'
    });
    const layout = attribute.getBufferLayout();
    attribute.delete();
    return layout;
  }

  for (const type of SMALL_TYPES) {
    for (const size of SIZES) {
      test(`getBufferLayout on WebGPU - ${type} size ${size}`, () => {
        const layout = getLayoutForAttribute(webgpuDevice, type, size);
        expect(layout.attributes?.length, 'layout has one attribute').toBe(1);
        for (const attributeLayout of layout.attributes!) {
          expect(
            GPU_VERTEX_FORMATS.has(attributeLayout.format),
            `${attributeLayout.format} is a GPUVertexFormat`
          ).toBe(true);
          expect(attributeLayout.byteOffset % 4, 'byteOffset is a multiple of 4').toBe(0);
        }
        expect(layout.byteStride! % 4, `byteStride ${layout.byteStride} is a multiple of 4`).toBe(
          0
        );
      });
    }
  }

  test('getBufferLayout on WebGL - unaligned layouts are unchanged', async () => {
    const webglDevice = await getWebGLTestDevice();
    const layout = getLayoutForAttribute(webglDevice, 'unorm8', 3);
    expect(layout.byteStride, 'WebGL keeps the packed stride').toBe(3);
    expect(layout.attributes![0].format, 'WebGL keeps the size-3 format').toBe('unorm8x3-webgl');
  });
});
