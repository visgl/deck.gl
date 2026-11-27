// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Adapter, Device, DeviceProps} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/core/webgl';

/** Combine caller-supplied adapters with Deck's bundled adapter, preserving their order. */
export function getDeviceAdapters(adapters: readonly Adapter[] = []): Adapter[] {
  return adapters.includes(webgl2Adapter) ? [...adapters] : [...adapters, webgl2Adapter];
}

/** Attach Deck to a host application's existing WebGL2 context. */
export function attachWebGLContext(
  gl: WebGL2RenderingContext,
  props: DeviceProps
): Promise<Device> {
  return webgl2Adapter.attach(gl, props);
}
