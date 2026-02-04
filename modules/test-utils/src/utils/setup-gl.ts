// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// TODO: Push to @luma.gl/test-utils - separate debug (error messages) from
// debugWebGL (verbose logging). Currently debug: true implies debugWebGL: true
// in webgl-device.ts line 236, so we can't have better error messages without verbose logs.

import {luma, type Device} from '@luma.gl/core';
import {webgl2Adapter, WebGLDevice} from '@luma.gl/webgl';
import {NullDevice} from '@luma.gl/test-utils';

// Use an async IIFE to handle the try/catch properly with top-level await
const {device, gl}: {device: Device; gl: WebGL2RenderingContext | number} = await (async () => {
  try {
    // Browser: create custom device with specific params (no verbose logging)
    const webglDevice = (await luma.createDevice({
      id: 'deck-test-device',
      type: 'webgl',
      adapters: [webgl2Adapter],
      createCanvasContext: {width: 1, height: 1}
    })) as WebGLDevice;
    return {device: webglDevice as Device, gl: webglDevice.gl};
  } catch {
    // Node: fall back to NullDevice
    return {device: new NullDevice({}) as Device, gl: 1 as number};
  }
})();

globalThis.glContext = globalThis.glContext || gl;

export {device, gl};
