// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CanvasContextProps} from '@luma.gl/core';
import {WebGLDevice} from '@luma.gl/webgl';
import {NullDevice} from '@luma.gl/test-utils';

// Overriding test device from luma.gl/test-utils to use useDevicePixels = false
const DEFAULT_CANVAS_CONTEXT_PROPS: CanvasContextProps = {
  width: 1,
  height: 1,
  useDevicePixels: false
};

/** Test device */
const webglDevice = new WebGLDevice({createCanvasContext: DEFAULT_CANVAS_CONTEXT_PROPS});
export const device = webglDevice || new NullDevice({});
export const gl = webglDevice?.gl || 1;

globalThis.glContext = globalThis.glContext || gl;
