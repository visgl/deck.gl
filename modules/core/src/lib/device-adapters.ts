// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Adapter, Device, DeviceProps} from '@luma.gl/core';
import {bundledWebGPUAdapter} from './bundled-webgpu-adapter';
import {webgl2Adapter} from '@luma.gl/core/webgl';

/** Default selection policy for the current distribution. */
export const defaultDeviceType = bundledWebGPUAdapter ? 'best-available' : 'webgl';

/** Combine caller-supplied adapters with Deck's bundled adapters, preserving their order. */
export function getDeviceAdapters(adapters: readonly Adapter[] = []): Adapter[] {
  const bundledAdapters = bundledWebGPUAdapter
    ? [webgl2Adapter, bundledWebGPUAdapter]
    : [webgl2Adapter];
  return [
    ...bundledAdapters.filter(adapter => !adapters.some(a => a.type === adapter.type)),
    ...adapters
  ];
}

/** Attach Deck to a host application's existing WebGL2 context. */
export function attachWebGLContext(
  gl: WebGL2RenderingContext,
  props: DeviceProps
): Promise<Device> {
  return webgl2Adapter.attach(gl, props);
}
