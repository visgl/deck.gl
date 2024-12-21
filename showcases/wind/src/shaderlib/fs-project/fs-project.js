// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// NOTE: this is same as 'project' shader module except this is applied to fragment shader.

import fsfp32 from '../fs-fp32/fs-fp32';
import {project} from 'deck.gl';

export default {
  name: 'fsproject',
  dependencies: [fsfp32],
  vs: null,
  fs: project.vs,
  getUniforms: project.getUniforms
};
