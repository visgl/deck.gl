// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// TODO: Push to @luma.gl/test-utils - separate debug (error messages) from
// debugWebGL (verbose logging). Currently debug: true implies debugWebGL: true
// in webgl-device.ts line 236, so we can't have better error messages without verbose logs.

import {luma, type Device} from '@luma.gl/core';
import {webgl2Adapter, WebGLDevice} from '@luma.gl/webgl';

// Create test device without debugWebGL to avoid verbose logging
// Note: debug: true implicitly enables debugWebGL in luma.gl
const webglDevice = (await luma.createDevice({
  id: 'deck-test-device',
  type: 'webgl',
  adapters: [webgl2Adapter],
  createCanvasContext: {width: 1, height: 1}
})) as WebGLDevice;

const device: Device = webglDevice;
const gl: WebGL2RenderingContext = webglDevice.gl;

globalThis.glContext = globalThis.glContext || gl;

export {device, gl};
