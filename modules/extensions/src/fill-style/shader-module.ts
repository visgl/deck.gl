import type {ShaderModule} from '@luma.gl/shadertools';
import {project, fp64LowPart} from '@deck.gl/core';
import type {Viewport, ProjectUniforms} from '@deck.gl/core';

import type {Texture} from '@luma.gl/core';
import {glsl} from '../utils/syntax-tags';

const uniformBlock = glsl`\
uniform fillUniforms {
  vec2 fill_patternTextureSize;
  bool fill_patternEnabled;
  bool fill_patternMask;
  vec2 fill_uvCoordinateOrigin;
  vec2 fill_uvCoordinateOrigin64Low;
} fill;
`;

/*
 * fill pattern shader module
 */
const patternVs = glsl`
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

const patternFs = glsl`
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
  'vs:DECKGL_FILTER_GL_POSITION': glsl`
    fill_uv = geometry.position.xy;
  `,

  'vs:DECKGL_FILTER_COLOR': glsl`
    if (fill.fill_patternEnabled) {
      fill_patternBounds = fillPatternFrames / vec4(fill.fill_patternTextureSize, fill.fill_patternTextureSize);
      fill_patternPlacement.xy = fillPatternOffsets;
      fill_patternPlacement.zw = fillPatternScales * fillPatternFrames.zw;
    }
  `,

  'fs:DECKGL_FILTER_COLOR': glsl`
    if (fill.fill_patternEnabled) {
      vec2 scale = FILL_UV_SCALE * fill_patternPlacement.zw;
      vec2 patternUV = mod(mod(fill.fill_uvCoordinateOrigin, scale) + fill.fill_uvCoordinateOrigin64Low + fill_uv, scale) / scale;
      patternUV = mod(fill_patternPlacement.xy + patternUV, 1.0);

      vec2 texCoords = fill_patternBounds.xy + fill_patternBounds.zw * patternUV;

      vec4 patternColor = texture(fill_patternTexture, texCoords);
      color.a *= patternColor.a;
      if (!fill.fill_patternMask) {
        color.rgb = patternColor.rgb;
      }
    }
  `
};

export type FillStyleModuleSettings =
  | {
      viewport: Viewport;
      fillPatternEnabled?: boolean;
      fillPatternMask?: boolean;
    }
  | {
      fillPatternTexture: Texture;
    };

/* eslint-disable camelcase */
function getPatternUniforms(opts: FillStyleModuleSettings | {}): Record<string, any> {
  if (!opts) {
    return {};
  }
  const out = {} as any;
  if ('fillPatternTexture' in opts) {
    const {fillPatternTexture} = opts;
    out.fill_patternTexture = fillPatternTexture;
    out.fill_patternTextureSize = [fillPatternTexture.width, fillPatternTexture.height];
  }
  if ('viewport' in opts) {
    const {fillPatternMask = true, fillPatternEnabled = true} = opts;
    const projectUniforms = project.getUniforms(opts) as ProjectUniforms;
    const {commonOrigin: coordinateOriginCommon} = projectUniforms;

    const coordinateOriginCommon64Low = [
      fp64LowPart(coordinateOriginCommon[0]),
      fp64LowPart(coordinateOriginCommon[1])
    ];

    out.fill_uvCoordinateOrigin = coordinateOriginCommon.slice(0, 2);
    out.fill_uvCoordinateOrigin64Low = coordinateOriginCommon64Low;
    out.fill_patternMask = fillPatternMask;
    out.fill_patternEnabled = fillPatternEnabled;
  }
  return out;
}

export const patternShaders: ShaderModule<FillStyleModuleSettings> = {
  name: 'fill',
  vs,
  fs,
  inject,
  dependencies: [project],
  getUniforms: getPatternUniforms,
  uniformTypes: {
    fill_patternTextureSize: 'vec2<f32>',
    fill_patternEnabled: 'i32',
    fill_patternMask: 'i32',
    fill_uvCoordinateOrigin: 'vec2<f32>',
    fill_uvCoordinateOrigin64Low: 'vec2<f32>'
  }
};
