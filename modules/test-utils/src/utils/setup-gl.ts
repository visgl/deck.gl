// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CanvasContextProps} from '@luma.gl/core';
import {WebGLDevice} from '@luma.gl/webgl';
import {webglDevice, NullDevice} from '@luma.gl/test-utils';

export const device = webglDevice || new NullDevice({});
export const gl = webglDevice?.gl || 1;

globalThis.glContext = globalThis.glContext || gl;
