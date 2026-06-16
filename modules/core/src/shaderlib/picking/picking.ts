// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {picking} from '@luma.gl/shadertools';
import log from '../../utils/log';

export const PICKING_MAX_DISABLED_INDICES = 10;
export const PICKING_INVALID_INDEX = 16777215;

export function disablePickingIndex(disabledPickingIndices: number[], objectIndex: number): void {
  if (disabledPickingIndices.length === PICKING_MAX_DISABLED_INDICES) {
    log.warn(
      `pickMultipleObjects can only exclude ${PICKING_MAX_DISABLED_INDICES} previously picked objects for layers without picking buffers`
    )();
  } else {
    disabledPickingIndices.push(objectIndex);
  }
}

const pickingUniformsGLSL = /* glsl */ `\
  float disabledPickingIndexCount;
  vec4 disabledPickingIndices0;
  vec4 disabledPickingIndices1;
  vec4 disabledPickingIndices2;
`;

function addPickingUniformsGLSL(source: string): string {
  return source.replace(
    '  vec4 highlightColor;\n} picking;',
    `  vec4 highlightColor;\n${pickingUniformsGLSL}} picking;`
  );
}

function packDisabledPickingIndices(disabledPickingIndices: number[], startIndex: number) {
  return [
    disabledPickingIndices[startIndex] || 0,
    disabledPickingIndices[startIndex + 1] || 0,
    disabledPickingIndices[startIndex + 2] || 0,
    disabledPickingIndices[startIndex + 3] || 0
  ];
}

const pickingHelpersGLSL = /* glsl */ `\
vec3 picking_getPickingColorFromIndex(float objectIndex) {
  if (objectIndex < 0.0 || objectIndex >= ${PICKING_INVALID_INDEX}.0) {
    return vec3(0.0);
  }

  for (int i = 0; i < ${PICKING_MAX_DISABLED_INDICES}; i++) {
    if (float(i) >= picking.disabledPickingIndexCount) {
      break;
    }
    vec4 disabledIndices = i < 4
      ? picking.disabledPickingIndices0
      : (i < 8 ? picking.disabledPickingIndices1 : picking.disabledPickingIndices2);
    float disabledIndex = disabledIndices[i - (i / 4) * 4];
    if (disabledIndex == objectIndex) {
      return vec3(0.0);
    }
  }

  float encodedIndex = objectIndex + 1.0;
  return vec3(
    mod(encodedIndex, 256.0),
    mod(floor(encodedIndex / 256.0), 256.0),
    mod(floor(encodedIndex / 65536.0), 256.0)
  );
}

vec3 picking_getPickingColorFromIndex(uint objectIndex) {
  return picking_getPickingColorFromIndex(float(objectIndex));
}

vec3 picking_getPickingColorFromInstanceID() {
  return picking_getPickingColorFromIndex(float(gl_InstanceID));
}

void picking_setPickingColorFromInstanceID() {
  picking_setPickingColor(picking_getPickingColorFromInstanceID());
}
`;

const sourceWGSL = /* wgsl */ `\
struct pickingUniforms {
  isActive: f32,
  isAttribute: f32,
  isHighlightActive: f32,
  useByteColors: f32,
  highlightedObjectColor: vec3<f32>,
  highlightColor: vec4<f32>,
  disabledPickingIndexCount: f32,
  disabledPickingIndices0: vec4<f32>,
  disabledPickingIndices1: vec4<f32>,
  disabledPickingIndices2: vec4<f32>,
};

@group(0) @binding(auto) var<uniform> picking: pickingUniforms;

fn picking_normalizeColor(color: vec3<f32>) -> vec3<f32> {
  return select(color, color / 255.0, picking.useByteColors > 0.5);
}

fn picking_normalizeColor4(color: vec4<f32>) -> vec4<f32> {
  return select(color, color / 255.0, picking.useByteColors > 0.5);
}

fn picking_isColorZero(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) < 0.00001;
}

fn picking_isColorValid(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) > 0.00001;
}

fn picking_getPickingColorFromIndex(objectIndex: u32) -> vec3<f32> {
  if (objectIndex >= ${PICKING_INVALID_INDEX}u) {
    return vec3<f32>(0.0);
  }

  for (var i = 0; i < ${PICKING_MAX_DISABLED_INDICES}; i = i + 1) {
    if (f32(i) >= picking.disabledPickingIndexCount) {
      break;
    }
    let disabledIndices = select(
      picking.disabledPickingIndices2,
      select(picking.disabledPickingIndices1, picking.disabledPickingIndices0, i < 4),
      i < 8
    );
    let disabledIndex = disabledIndices[i % 4];
    if (disabledIndex == f32(objectIndex)) {
      return vec3<f32>(0.0);
    }
  }

  let encodedIndex = objectIndex + 1u;
  return vec3<f32>(
    f32(encodedIndex % 256u),
    f32((encodedIndex / 256u) % 256u),
    f32((encodedIndex / 65536u) % 256u)
  ) / 255.0;
}
`;

export default {
  ...picking,
  vs: `${addPickingUniformsGLSL(picking.vs)}\n${pickingHelpersGLSL}`,
  fs: addPickingUniformsGLSL(picking.fs),
  source: sourceWGSL,
  uniformTypes: {
    ...picking.uniformTypes,
    disabledPickingIndexCount: 'f32',
    disabledPickingIndices0: 'vec4<f32>',
    disabledPickingIndices1: 'vec4<f32>',
    disabledPickingIndices2: 'vec4<f32>'
  },
  defaultUniforms: {
    ...picking.defaultUniforms,
    useByteColors: true,
    disabledPickingIndexCount: 0,
    disabledPickingIndices0: [0, 0, 0, 0],
    disabledPickingIndices1: [0, 0, 0, 0],
    disabledPickingIndices2: [0, 0, 0, 0]
  },
  getUniforms(props, prevUniforms) {
    const uniforms = picking.getUniforms(props, prevUniforms) as any;
    const disabledPickingIndices = props.disabledPickingIndices || [];
    uniforms.disabledPickingIndexCount = disabledPickingIndices.length;
    uniforms.disabledPickingIndices0 = packDisabledPickingIndices(disabledPickingIndices, 0);
    uniforms.disabledPickingIndices1 = packDisabledPickingIndices(disabledPickingIndices, 4);
    uniforms.disabledPickingIndices2 = packDisabledPickingIndices(disabledPickingIndices, 8);
    return uniforms;
  },
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
