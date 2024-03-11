import type {ShaderModule} from '@luma.gl/shadertools';
import {project, fp64LowPart} from '@deck.gl/core';
import type {Viewport, ProjectUniforms} from '@deck.gl/core';

import type {Texture} from '@luma.gl/core';
import {glsl} from '../utils/syntax-tags';

/*
 * fill pattern shader module
 */
const patternVs = glsl`
#ifdef NON_INSTANCED_MODEL
  #define FILL_PATTERN_FRAME_ATTRIB fillPatternFrames
  #define FILL_PATTERN_SCALE_ATTRIB fillPatternScales
  #define FILL_PATTERN_OFFSET_ATTRIB fillPatternOffsets
#else
  #define FILL_PATTERN_FRAME_ATTRIB instanceFillPatternFrames
  #define FILL_PATTERN_SCALE_ATTRIB instanceFillPatternScales
  #define FILL_PATTERN_OFFSET_ATTRIB instanceFillPatternOffsets
#endif

in vec4 FILL_PATTERN_FRAME_ATTRIB;
in float FILL_PATTERN_SCALE_ATTRIB;
in vec2 FILL_PATTERN_OFFSET_ATTRIB;

uniform bool fill_patternEnabled;
uniform vec2 fill_patternTextureSize;

out vec2 fill_uv;
out vec4 fill_patternBounds;
out vec4 fill_patternPlacement;
`;

const patternFs = glsl`
uniform bool fill_patternEnabled;
uniform bool fill_patternMask;
uniform sampler2D fill_patternTexture;
uniform vec2 fill_uvCoordinateOrigin;
uniform vec2 fill_uvCoordinateOrigin64Low;

in vec4 fill_patternBounds;
in vec4 fill_patternPlacement;
in vec2 fill_uv;

const float FILL_UV_SCALE = 512.0 / 40000000.0;
`;

const inject = {
  'vs:DECKGL_FILTER_GL_POSITION': glsl`
    fill_uv = geometry.position.xy;
  `,

  'vs:DECKGL_FILTER_COLOR': glsl`
    if (fill_patternEnabled) {
      fill_patternBounds = FILL_PATTERN_FRAME_ATTRIB / vec4(fill_patternTextureSize, fill_patternTextureSize);
      fill_patternPlacement.xy = FILL_PATTERN_OFFSET_ATTRIB;
      fill_patternPlacement.zw = FILL_PATTERN_SCALE_ATTRIB * FILL_PATTERN_FRAME_ATTRIB.zw;
    }
  `,

  'fs:DECKGL_FILTER_COLOR': glsl`
    if (fill_patternEnabled) {
      vec2 scale = FILL_UV_SCALE * fill_patternPlacement.zw;
      vec2 patternUV = mod(mod(fill_uvCoordinateOrigin, scale) + fill_uvCoordinateOrigin64Low + fill_uv, scale) / scale;
      patternUV = mod(fill_patternPlacement.xy + patternUV, 1.0);

      vec2 texCoords = fill_patternBounds.xy + fill_patternBounds.zw * patternUV;

      vec4 patternColor = texture(fill_patternTexture, texCoords);
      color.a *= patternColor.a;
      if (!fill_patternMask) {
        color.rgb = patternColor.rgb;
      }
    }
  `
};

type FillStyleModuleSettings =
  | {
      viewport: Viewport;
      fillPatternEnabled?: boolean;
      fillPatternMask?: boolean;
    }
  | {
      fillPatternTexture: Texture;
    };

/* eslint-disable camelcase */
function getPatternUniforms(
  opts: FillStyleModuleSettings | {},
  uniforms: Record<string, any>
): Record<string, any> {
  if (!opts) {
    return {};
  }
  if ('fillPatternTexture' in opts) {
    const {fillPatternTexture} = opts;
    return {
      fill_patternTexture: fillPatternTexture,
      fill_patternTextureSize: [fillPatternTexture.width, fillPatternTexture.height]
    };
  }
  if ('viewport' in opts) {
    const {fillPatternMask = true, fillPatternEnabled = true} = opts;
    const {project_uCommonOrigin: coordinateOriginCommon} = uniforms as ProjectUniforms;

    const coordinateOriginCommon64Low = [
      fp64LowPart(coordinateOriginCommon[0]),
      fp64LowPart(coordinateOriginCommon[1])
    ];

    return {
      fill_uvCoordinateOrigin: coordinateOriginCommon.slice(0, 2),
      fill_uvCoordinateOrigin64Low: coordinateOriginCommon64Low,
      fill_patternMask: fillPatternMask,
      fill_patternEnabled: fillPatternEnabled
    };
  }
  return {};
}

export const patternShaders: ShaderModule<FillStyleModuleSettings> = {
  name: 'fill-pattern',
  vs: patternVs,
  fs: patternFs,
  inject,
  dependencies: [project],
  getUniforms: getPatternUniforms
};
