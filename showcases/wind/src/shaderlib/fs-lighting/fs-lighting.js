// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// NOTE: this is same as 'lighting' shader module except this is applied to fragment shader.

import {lighting} from 'deck.gl';
import fsproject from '../fs-project/fs-project';

export default {
  name: 'fslighting',
  dependencies: [fsproject],
  vs: null,
  fs: lighting.vs,
  getUniforms: lighting.getUniforms
};
