// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import {project, fp64LowPart} from '@deck.gl/core';
import type {
  OrthographicViewport,
  ProjectProps,
  ProjectUniforms,
  Unit,
  Viewport
} from '@deck.gl/core';

import type {Texture} from '@luma.gl/core';

// Common-space size of one atlas texel: the equator measures 40,000km and spans 512 common units
const FILL_UV_SCALE = 512 / 40000000;

/** Common-space size of one atlas texel, i.e. what turns the pixel size of a frame into the size
 * of one tile in common space. */
function getPatternUnitScale(sizeUnits: Unit, viewport: Viewport): number {
  switch (sizeUnits) {
    case 'pixels':
      // Following the zoom exactly would rescale the pattern on every fractional zoom change,
      // which never lets the tiling settle. The pattern is re-anchored once per zoom level
      // instead, and within a level stays within a factor of sqrt(2) of its nominal size.
      return 2 ** -Math.round(viewport.zoom);
    case 'common':
      return 1;
    default:
      return FILL_UV_SCALE;
  }
}

const uniformBlock = /* glsl */ `\
layout(std140) uniform fillUniforms {
  vec2 patternTextureSize;
  float patternUnitScale;
  bool patternEnabled;
  bool patternMask;
  bool flipY;
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

      vec2 patternFrameCommon = fill.patternUnitScale * fillPatternScales * fillPatternFrames.zw;
      // Reduce the coordinate origin to within one tile before adding the vertex position. The
      // origin is large in common space, and fp32 cannot carry the sum at full precision.
      vec2 origin = mod(fill.uvCoordinateOrigin, patternFrameCommon) + fill.uvCoordinateOrigin64Low;
      fill_uv = (origin + geometry.position.xy) / patternFrameCommon;
      // Pattern atlases use top-left coordinates, so reverse common-space Y in bottom-left views.
      fill_uv.y *= fill.flipY ? 1.0 : -1.0;
      fill_uv += fillPatternOffsets;

      fill_backgroundColor = fillPatternBackgroundColors;
    }
  `,

  'fs:DECKGL_FILTER_COLOR': /* glsl */ `
    if (fill.patternEnabled) {
      vec2 patternUV = fract(fill_uv);
      vec2 texCoords = fill_patternBounds.xy + fill_patternBounds.zw * patternUV;

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
  fillPatternSizeUnits?: Unit;
};

type FillStyleModuleUniforms = {
  patternTextureSize?: [number, number];
  patternUnitScale?: number;
  patternEnabled?: boolean;
  patternMask?: boolean;
  flipY?: boolean;
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
    const {
      fillPatternMask = true,
      fillPatternEnabled = true,
      fillPatternSizeUnits = 'meters'
    } = opts;
    const projectUniforms = project.getUniforms(opts.project) as ProjectUniforms;
    const {commonOrigin: coordinateOriginCommon} = projectUniforms;
    const unitScale = getPatternUnitScale(fillPatternSizeUnits, opts.project.viewport);

    const coordinateOriginCommon64Low: [number, number] = [
      fp64LowPart(coordinateOriginCommon[0]),
      fp64LowPart(coordinateOriginCommon[1])
    ];

    uniforms.uvCoordinateOrigin = coordinateOriginCommon.slice(0, 2) as [number, number];
    uniforms.uvCoordinateOrigin64Low = coordinateOriginCommon64Low;
    uniforms.patternUnitScale = unitScale;
    uniforms.patternMask = fillPatternMask;
    uniforms.patternEnabled = fillPatternEnabled;
    uniforms.flipY = (opts.project.viewport as OrthographicViewport)?.flipY ?? false;
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
    patternUnitScale: 'f32',
    patternEnabled: 'i32',
    patternMask: 'i32',
    flipY: 'i32',
    uvCoordinateOrigin: 'vec2<f32>',
    uvCoordinateOrigin64Low: 'vec2<f32>'
  }
} as const satisfies ShaderModule<
  FillStyleModuleProps,
  FillStyleModuleUniforms,
  FillStyleModuleBindings
>;
