// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {picking} from '@luma.gl/shadertools';

export default {
  ...picking,
  defaultUniforms: {...picking.defaultUniforms, useFloatColors: false},
  inject: {
    'vs:DECKGL_FILTER_GL_POSITION': `
    // for picking depth values
    picking_setPickingAttribute(position.z / position.w);
  `,
    'vs:DECKGL_FILTER_COLOR': `
  picking_setPickingColor(geometry.pickingColor);
  `,
    'fs:DECKGL_FILTER_COLOR': {
      order: 99,
      injection: `
  // use highlight color if this fragment belongs to the selected object.
  color = picking_filterHighlightColor(color);

  // use picking color if rendering to picking FBO.
  color = picking_filterPickingColor(color);
    `
    }
  }
};
