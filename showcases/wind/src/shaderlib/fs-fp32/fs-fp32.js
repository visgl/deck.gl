// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// NOTE: this is same as luma.gl 'fp32' shader module except this is applied to fragment shader.

import {fp32} from 'luma.gl';

export default {
  name: 'fsfp32',
  vs: null,
  fs: fp32.vs
};
