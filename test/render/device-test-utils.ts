// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {luma} from '@luma.gl/core';
import type {Device} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {WIDTH, HEIGHT} from './constants';

export type TestDeviceType = 'webgl' | 'webgpu';

/**
 * Creates a device and canvas for a render test.
 */
export function createTestDevice(type: TestDeviceType, container: HTMLDivElement): Promise<Device> {
  return luma.createDevice({
    type,
    adapters: type === 'webgl' ? [webgl2Adapter] : [webgpuAdapter],
    createCanvasContext: {
      container,
      width: WIDTH,
      height: HEIGHT,
      useDevicePixels: false,
      autoResize: true,
      alphaMode: type === 'webgpu' ? 'premultiplied' : undefined
    }
  });
}
