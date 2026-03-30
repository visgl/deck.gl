// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {picking} from '@luma.gl/shadertools';

const sourceWGSL = /* wgsl */ `\
struct pickingUniforms {
  isActive: f32,
  isAttribute: f32,
  isHighlightActive: f32,
  useFloatColors: f32,
  highlightedObjectColor: vec3<f32>,
  highlightColor: vec4<f32>,
};

@group(0) @binding(auto) var<uniform> picking: pickingUniforms;

fn picking_normalizeColor(color: vec3<f32>) -> vec3<f32> {
  return select(color / 255.0, color, picking.useFloatColors > 0.5);
}

fn picking_normalizeColor4(color: vec4<f32>) -> vec4<f32> {
  return select(color / 255.0, color, picking.useFloatColors > 0.5);
}

fn picking_isColorZero(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) < 0.00001;
}

fn picking_isColorValid(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) > 0.00001;
}
`;

export default {
  ...picking,
  source: sourceWGSL,
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
