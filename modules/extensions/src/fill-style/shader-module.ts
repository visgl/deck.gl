// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import {project, fp64LowPart} from '@deck.gl/core';
import type {ProjectProps, ProjectUniforms} from '@deck.gl/core';

import type {Texture} from '@luma.gl/core';

// Common-space size of one atlas texel: the equator measures 40,000km and spans 512 common units
const FILL_UV_SCALE = 512 / 40000000;

const uniformBlock = /* glsl */ `\
layout(std140) uniform fillUniforms {
  vec2 patternTextureSize;
  bool patternEnabled;
  bool patternMask;
  vec2 uvCoordinateOrigin;
  vec2 uvCoordinateOrigin64Low;
} fill;
`;

/*
 * fill pattern shader module
 */
const patternVs = /* glsl */ `
in vec4 fillPatternFrames;
in float fillPatternScales;
in vec2 fillPatternOffsets;
in vec4 fillPatternBackgroundColors;

out vec2 fill_uv;
out vec4 fill_patternBounds;
out vec4 fill_backgroundColor;

const float FILL_UV_SCALE = ${FILL_UV_SCALE};
`;

const vs = `
${uniformBlock}
${patternVs}
`;

const patternFs = /* glsl */ `
uniform sampler2D fill_patternTexture;

in vec4 fill_patternBounds;
in vec4 fill_backgroundColor;
in vec2 fill_uv;

// Draw the pattern over the background fill (Porter-Duff source-over)
vec4 fill_blendOverBackground(vec4 pattern, vec4 background) {
  if (background.a == 0.0 || layer.opacity == 0.0) return pattern;
  float patternAlpha = pattern.a / layer.opacity;
  float blendedAlpha = patternAlpha + background.a * (1.0 - patternAlpha);
  vec3 blendedRGB = mix(background.rgb, pattern.rgb, patternAlpha / blendedAlpha);
  return vec4(blendedRGB, blendedAlpha * layer.opacity);
}
`;

const fs = `
${uniformBlock}
${patternFs}
`;

const inject = {
  'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
    if (fill.patternEnabled) {
      fill_patternBounds = fillPatternFrames / vec4(fill.patternTextureSize, fill.patternTextureSize);

      vec2 patternFrameCommon = FILL_UV_SCALE * fillPatternScales * fillPatternFrames.zw;
      // Reduce the coordinate origin to within one tile before adding the vertex position. The
      // origin is large in common space, and fp32 cannot carry the sum at full precision.
      vec2 origin = mod(fill.uvCoordinateOrigin, patternFrameCommon) + fill.uvCoordinateOrigin64Low;
      fill_uv = (origin + geometry.position.xy) / patternFrameCommon + fillPatternOffsets;

      fill_backgroundColor = fillPatternBackgroundColors;
    }
  `,

  'fs:DECKGL_FILTER_COLOR': /* glsl */ `
    if (fill.patternEnabled) {
      vec2 patternUV = fract(fill_uv);
      vec2 texCoords = fill_patternBounds.xy + fill_patternBounds.zw * vec2(patternUV.x, 1.0 - patternUV.y);

      // Tiling is emulated by wrapping the coordinate, so texCoords jumps from the end of the
      // frame back to its start once per tile, leading to the wrong mip level being selected,
      // which leads to artifacts at pattern edges. fill_uv is continuous across the primitive,
      // meaning that the correct mip level is always selected
      vec4 grad = fill_patternBounds.zwzw * vec4(dFdx(fill_uv), dFdy(fill_uv));
      vec4 patternColor = textureGrad(fill_patternTexture, texCoords, grad.xy, grad.zw);

      color.a *= patternColor.a;
      if (!fill.patternMask) {
        color.rgb = patternColor.rgb;
      }
      color = fill_blendOverBackground(color, fill_backgroundColor);
    }
  `
};

export type FillStyleModuleProps = {
  project: ProjectProps;
  fillPatternEnabled?: boolean;
  fillPatternMask?: boolean;
  fillPatternTexture: Texture;
  fillPatternCommonFrame?: [number, number] | null;
};

type FillStyleModuleUniforms = {
  patternTextureSize?: [number, number];
  patternEnabled?: boolean;
  patternMask?: boolean;
  uvCoordinateOrigin?: [number, number];
  uvCoordinateOrigin64Low?: [number, number];
};

type FillStyleModuleBindings = {
  fill_patternTexture?: Texture;
};

/* eslint-disable camelcase */
function getPatternUniforms(
  opts?: FillStyleModuleProps | {}
): FillStyleModuleBindings & FillStyleModuleUniforms {
  if (!opts) {
    return {};
  }
  const uniforms: FillStyleModuleBindings & FillStyleModuleUniforms = {};
  if ('fillPatternTexture' in opts) {
    const {fillPatternTexture} = opts;
    uniforms.fill_patternTexture = fillPatternTexture;
    uniforms.patternTextureSize = [fillPatternTexture.width, fillPatternTexture.height];
  }
  if ('project' in opts) {
    const {fillPatternMask = true, fillPatternEnabled = true, fillPatternCommonFrame = null} = opts;
    const projectUniforms = project.getUniforms(opts.project) as ProjectUniforms;
    const {commonOrigin: coordinateOriginCommon} = projectUniforms;

    // Improve the precision of the uv mapping by removing an integer multiple of the
    // pattern frames. This results in the same result, without wobbling at high zooms
    const origin: [number, number] = [coordinateOriginCommon[0], coordinateOriginCommon[1]];
    if (fillPatternCommonFrame) {
      origin[0] %= FILL_UV_SCALE * fillPatternCommonFrame[0];
      origin[1] %= FILL_UV_SCALE * fillPatternCommonFrame[1];
    }

    uniforms.uvCoordinateOrigin = origin;
    uniforms.uvCoordinateOrigin64Low = [fp64LowPart(origin[0]), fp64LowPart(origin[1])];
    uniforms.patternMask = fillPatternMask;
    uniforms.patternEnabled = fillPatternEnabled;
  }
  return uniforms;
}

export const patternShaders = {
  name: 'fill',
  vs,
  fs,
  inject,
  dependencies: [project],
  getUniforms: getPatternUniforms,
  uniformTypes: {
    patternTextureSize: 'vec2<f32>',
    patternEnabled: 'i32',
    patternMask: 'i32',
    uvCoordinateOrigin: 'vec2<f32>',
    uvCoordinateOrigin64Low: 'vec2<f32>'
  }
} as const satisfies ShaderModule<
  FillStyleModuleProps,
  FillStyleModuleUniforms,
  FillStyleModuleBindings
>;
