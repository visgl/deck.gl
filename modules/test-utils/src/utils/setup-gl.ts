// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {NullDevice} from '@luma.gl/core/test-utils';
import {webglDevice} from '@luma.gl/core/test-utils-legacy';

// Use luma.gl's legacy pre-created device, falling back to NullDevice in Node.
export const device = webglDevice || new NullDevice({});
export const gl = webglDevice?.gl || 1;

globalThis.glContext = globalThis.glContext || gl;
