// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {webglDevice, NullDevice} from '@luma.gl/test-utils';

/** Test device */
export const device = webglDevice || new NullDevice({});

export const gl = webglDevice?.gl || 1;

globalThis.glContext = globalThis.glContext || gl;
