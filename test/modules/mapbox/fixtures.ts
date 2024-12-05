// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GL} from '@luma.gl/constants';

export const DEFAULT_PARAMETERS = {
  depthMask: true,
  depthWriteEnabled: true,
  depthCompare: 'less-equal',
  blend: true,
  blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
  polygonOffsetFill: true,
  depthFunc: GL.LEQUAL,
  blendEquation: GL.FUNC_ADD
};
