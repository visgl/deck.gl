// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import {project, fp64LowPart} from '@deck.gl/core';
import type {ProjectProps, ProjectUniforms} from '@deck.gl/core';

import type {Texture} from '@luma.gl/core';

const uniformBlock = /* glsl */ `\
uniform fillUniforms {
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

out vec2 fill_uv;
out vec4 fill_patternBounds;
out vec4 fill_patternPlacement;
`;

const vs = `
${uniformBlock}
${patternVs}
`;

const patternFs = /* glsl */ `
uniform sampler2D fill_patternTexture;

in vec4 fill_patternBounds;
in vec4 fill_patternPlacement;
in vec2 fill_uv;

const float FILL_UV_SCALE = 512.0 / 40000000.0;
`;

const fs = `
${uniformBlock}
${patternFs}
`;

const inject = {
  'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
    fill_uv = geometry.position.xy;
  `,

  'vs:DECKGL_FILTER_COLOR': /* glsl */ `
    if (fill.patternEnabled) {
      fill_patternBounds = fillPatternFrames / vec4(fill.patternTextureSize, fill.patternTextureSize);
      fill_patternPlacement.xy = fillPatternOffsets;
      fill_patternPlacement.zw = fillPatternScales * fillPatternFrames.zw;
    }
  `,

  'fs:DECKGL_FILTER_COLOR': /* glsl */ `
    if (fill.patternEnabled) {
      vec2 scale = FILL_UV_SCALE * fill_patternPlacement.zw;
      vec2 patternUV = mod(mod(fill.uvCoordinateOrigin, scale) + fill.uvCoordinateOrigin64Low + fill_uv, scale) / scale;
      patternUV = mod(fill_patternPlacement.xy + patternUV, 1.0);

      vec2 texCoords = fill_patternBounds.xy + fill_patternBounds.zw * patternUV;

      vec4 patternColor = texture(fill_patternTexture, texCoords);
      color.a *= patternColor.a;
      if (!fill.patternMask) {
        color.rgb = patternColor.rgb;
      }
    }
  `
};

export type FillStyleModuleProps = {
  project: ProjectProps;
  fillPatternEnabled?: boolean;
  fillPatternMask?: boolean;
  fillPatternTexture: Texture;
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
    const {fillPatternMask = true, fillPatternEnabled = true} = opts;
    const projectUniforms = project.getUniforms(opts.project) as ProjectUniforms;
    const {commonOrigin: coordinateOriginCommon} = projectUniforms;

    const coordinateOriginCommon64Low: [number, number] = [
      fp64LowPart(coordinateOriginCommon[0]),
      fp64LowPart(coordinateOriginCommon[1])
    ];

    uniforms.uvCoordinateOrigin = coordinateOriginCommon.slice(0, 2) as [number, number];
    uniforms.uvCoordinateOrigin64Low = coordinateOriginCommon64Low;
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
