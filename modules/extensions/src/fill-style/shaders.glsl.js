import {project} from '@deck.gl/core';

/*
 * data filter shader module
 */
const patternVs = `
#ifdef NON_INSTANCED_MODEL
  #define FILL_PATTERN_FRAME_ATTRIB fillPatternFrames
  #define FILL_PATTERN_SCALE_ATTRIB fillPatternScales
  #define FILL_PATTERN_OFFSET_ATTRIB fillPatternOffsets
#else
  #define FILL_PATTERN_FRAME_ATTRIB instanceFillPatternFrames
  #define FILL_PATTERN_SCALE_ATTRIB instanceFillPatternScales
  #define FILL_PATTERN_OFFSET_ATTRIB instanceFillPatternOffsets
#endif

attribute vec4 FILL_PATTERN_FRAME_ATTRIB;
attribute float FILL_PATTERN_SCALE_ATTRIB;
attribute vec2 FILL_PATTERN_OFFSET_ATTRIB;

uniform bool fill_patternEnabled;
uniform vec2 fill_patternTextureSize;

varying vec2 fill_uv;
varying vec4 fill_patternBounds;
varying vec3 fill_patternPlacement;
`;

const patternFs = `
uniform bool fill_patternEnabled;
uniform bool fill_patternMask;
uniform sampler2D fill_patternTexture;
uniform vec2 fill_uvCoordinateOrigin;

varying vec4 fill_patternBounds;
varying vec3 fill_patternPlacement;
varying vec2 fill_uv;

const float FILL_UV_SCALE = 512.0 / 40000000.0;
`;

const inject = {
  'vs:DECKGL_FILTER_GL_POSITION': `
    fill_uv = geometry.position.xy;
  `,

  'vs:DECKGL_FILTER_COLOR': `
    if (fill_patternEnabled) {
      fill_patternBounds = FILL_PATTERN_FRAME_ATTRIB / vec4(fill_patternTextureSize, fill_patternTextureSize);
      fill_patternPlacement.xy = FILL_PATTERN_OFFSET_ATTRIB;
      fill_patternPlacement.z = FILL_PATTERN_SCALE_ATTRIB * FILL_PATTERN_FRAME_ATTRIB.w;
    }
  `,

  'fs:DECKGL_FILTER_COLOR': `
    if (fill_patternEnabled) {
      float scale = FILL_UV_SCALE * fill_patternPlacement.z;
      vec2 patternUV = mod(mod(fill_uvCoordinateOrigin, scale) + fill_uv, scale) / scale;
      patternUV = mod(fill_patternPlacement.xy + patternUV, 1.0);

      vec2 texCoords = fill_patternBounds.xy + fill_patternBounds.zw * patternUV;
      texCoords.y = 1.0 - texCoords.y;

      vec4 patternColor = texture2D(fill_patternTexture, texCoords);
      if (fill_patternMask) {
        color.a *= patternColor.a;
      } else {
        color.rgb = patternColor.rgb;
      }
    }
  `
};

function getPatternUniforms(opts = {}, uniforms) {
  if ('fillPatternTexture' in opts) {
    const {fillPatternTexture, fillPatternTextureSize, fillPatternMapping} = opts;
    return fillPatternTextureSize && fillPatternMapping
      ? {
          fill_patternTexture: fillPatternTexture,
          fill_patternTextureSize: fillPatternTextureSize,
          fill_patternEnabled: true
        }
      : {
          fill_patternTexture: fillPatternTexture,
          fill_patternEnabled: false
        };
  }
  if (opts.viewport) {
    const {viewport, fillPatternMask = true} = opts;
    const {project_uCoordinateOrigin} = uniforms;

    const coordinateOriginCommon = viewport.projectPosition(project_uCoordinateOrigin);

    return {
      fill_uvCoordinateOrigin: coordinateOriginCommon.slice(0, 2),
      fill_patternMask: fillPatternMask
    };
  }
  return {};
}

export const patternShaders = {
  name: 'fill-style-pattern',
  vs: patternVs,
  fs: patternFs,
  inject,
  dependencies: [project],
  getUniforms: getPatternUniforms
};
