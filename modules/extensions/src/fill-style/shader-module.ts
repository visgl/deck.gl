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
  bool procedural;
  bool flipY;
  vec2 uvCoordinateOrigin;
  vec2 uvCoordinateOrigin64Low;
} fill;
`;

/*
 * fill pattern shader module
 */
const patternVs = /* glsl */ `
uniform sampler2D fill_patternTexture;

in vec4 fillPatternFrames;
in float fillPatternScales;
in vec2 fillPatternOffsets;
in vec4 fillPatternBackgroundColors;

out vec2 fill_uv;
out vec4 fill_patternBounds;
out vec4 fill_patternPlacement;
out vec4 fill_backgroundColor;
out float fill_patternCoordinateScale;
flat out vec4 fill_patternParams0;
flat out vec4 fill_patternParams1;
`;

const vs = `
${uniformBlock}
${patternVs}
`;

const patternFs = /* glsl */ `
uniform sampler2D fill_patternTexture;

in vec4 fill_patternBounds;
in vec4 fill_patternPlacement;
in vec4 fill_backgroundColor;
in vec2 fill_uv;
in float fill_patternCoordinateScale;
flat in vec4 fill_patternParams0;
flat in vec4 fill_patternParams1;

const float FILL_PATTERN_HATCH = 1.0;
const float FILL_PATTERN_CROSS_HATCH = 2.0;
const float FILL_PATTERN_DOTS = 3.0;

float fill_getPatternCoordinate(vec2 axis, float period, float offset) {
  float coordinateScale = max(abs(fill_patternCoordinateScale), 1.0e-20);
  vec2 coordinateOrigin = fill.uvCoordinateOrigin;
  vec2 coordinateOffset = fill.uvCoordinateOrigin64Low + fill_uv;
  float yDirection = fill.flipY ? 1.0 : -1.0;
  coordinateOrigin.y *= yDirection;
  coordinateOffset.y *= yDirection;

  // Reduce the high part before adding the local offset to retain precision in large coordinates.
  float highPart = mod(dot(coordinateOrigin, axis) / coordinateScale, period);
  float lowPart = dot(coordinateOffset, axis) / coordinateScale;
  return mod(highPart + lowPart + offset * period, period);
}

vec2 fill_getPatternCoords(
  vec2 axis0,
  vec2 axis1,
  vec2 period,
  vec2 offset
) {
  return vec2(
    fill_getPatternCoordinate(axis0, period.x, offset.x),
    fill_getPatternCoordinate(axis1, period.y, offset.y)
  );
}

float fill_getScreenSpaceAlpha(float signedDistance) {
  float distanceDerivative = fwidth(signedDistance);
  if (distanceDerivative == 0.0) {
    return signedDistance <= 0.0 ? 1.0 : 0.0;
  }
  // Normalize the SDF to screen pixels so the coverage ramp is independent of pattern units.
  float distanceInPixels = signedDistance / distanceDerivative;
  return 1.0 - smoothstep(-0.5, 0.5, distanceInPixels);
}

float fill_getLineAlpha(float position, float center, float period, float strokeWidth) {
  float distanceToLine = abs(mod(position - center + period * 0.5, period) - period * 0.5);
  return fill_getScreenSpaceAlpha(distanceToLine - strokeWidth * 0.5);
}

float fill_getHatchAlpha(float angle, float strokeWidth, vec2 gaps, bool alternating) {
  vec2 lineDirection = vec2(cos(angle), sin(angle));
  vec2 lineNormal = vec2(-lineDirection.y, lineDirection.x);
  float period = alternating
    ? strokeWidth * 2.0 + gaps.x + gaps.y
    : strokeWidth + gaps.x;
  float offset = dot(fill_patternPlacement.xy, lineNormal);
  float position = fill_getPatternCoordinate(lineNormal, period, offset);
  float alpha = fill_getLineAlpha(position, 0.0, period, strokeWidth);
  if (alternating) {
    alpha = max(
      alpha,
      fill_getLineAlpha(position, strokeWidth + gaps.x, period, strokeWidth)
    );
  }
  return alpha;
}

float fill_getDotAlpha(float angle, float skew, float radius, float gap) {
  vec2 axis0 = vec2(cos(angle), sin(angle));
  float axis1Angle = angle + 1.5707963267948966 - skew;
  vec2 axis1 = vec2(cos(axis1Angle), sin(axis1Angle));
  float determinant = axis0.x * axis1.y - axis0.y * axis1.x;

  // The reciprocal basis maps common coordinates into the skewed dot lattice.
  vec2 reciprocal0 = vec2(axis1.y, -axis1.x) / determinant;
  vec2 reciprocal1 = vec2(-axis0.y, axis0.x) / determinant;
  float period = radius * 2.0 + gap;
  vec2 latticeCoords = fill_getPatternCoords(
    reciprocal0,
    reciprocal1,
    vec2(period),
    fill_patternPlacement.xy
  );
  vec2 cellOffset = mod(latticeCoords + period * 0.5, period) - period * 0.5;
  float distanceToDotSquared = 1.0e20;
  // In a skewed lattice the closest dot is not necessarily in the independently wrapped cell.
  // Include adjacent cells to keep the repeated distance field continuous at cell boundaries.
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 neighborOffset = cellOffset + vec2(float(x), float(y)) * period;
      vec2 dotOffset = axis0 * neighborOffset.x + axis1 * neighborOffset.y;
      distanceToDotSquared = min(distanceToDotSquared, dot(dotOffset, dotOffset));
    }
  }
  float distanceToDot = sqrt(distanceToDotSquared);
  return fill_getScreenSpaceAlpha(distanceToDot - radius);
}

float fill_getProceduralPatternAlpha() {
  float patternType = fill_patternParams0.x;
  float size = fill_patternParams0.y;
  vec2 gaps = fill_patternParams0.zw;
  vec2 angles = fill_patternParams1.xy;
  float elementCount = fill_patternParams1.z;

  if (patternType == FILL_PATTERN_HATCH) {
    return fill_getHatchAlpha(angles.x, size, gaps, elementCount == 2.0);
  }
  if (patternType == FILL_PATTERN_CROSS_HATCH) {
    return max(
      fill_getHatchAlpha(angles.x, size, gaps, false),
      fill_getHatchAlpha(angles.y, size, gaps, false)
    );
  }
  if (patternType == FILL_PATTERN_DOTS) {
    return fill_getDotAlpha(angles.x, angles.y, size, gaps.x);
  }
  return 1.0;
}

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
      fill_patternPlacement.xy = fillPatternOffsets;
      fill_backgroundColor = fillPatternBackgroundColors;
      if (fill.procedural) {
        fill_uv = geometry.position.xy;
        fill_patternCoordinateScale = fill.patternUnitScale * fillPatternScales;
        int texelIndex = int(fillPatternFrames.x) * 4;
        fill_patternParams0 = vec4(
          texelFetch(fill_patternTexture, ivec2(texelIndex, 0), 0).rg,
          texelFetch(fill_patternTexture, ivec2(texelIndex + 1, 0), 0).rg
        );
        fill_patternParams1 = vec4(
          texelFetch(fill_patternTexture, ivec2(texelIndex + 2, 0), 0).rg,
          texelFetch(fill_patternTexture, ivec2(texelIndex + 3, 0), 0).rg
        );
      } else {
        fill_patternBounds = fillPatternFrames / vec4(fill.patternTextureSize, fill.patternTextureSize);
        vec2 patternFrameCommon = fill.patternUnitScale * fillPatternScales * fillPatternFrames.zw;
        // Reduce the coordinate origin to within one tile before adding the vertex position. The
        // origin is large in common space, and fp32 cannot carry the sum at full precision.
        vec2 origin = mod(fill.uvCoordinateOrigin, patternFrameCommon) + fill.uvCoordinateOrigin64Low;
        fill_uv = (origin + geometry.position.xy) / patternFrameCommon;
        // Pattern atlases use top-left coordinates, so reverse common-space Y in bottom-left views.
        fill_uv.y *= fill.flipY ? 1.0 : -1.0;
        fill_uv += fillPatternOffsets;
      }
    }
  `,

  'fs:DECKGL_FILTER_COLOR': /* glsl */ `
    if (fill.patternEnabled) {
      if (fill.procedural) {
        color.a *= fill_getProceduralPatternAlpha();
      } else {
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
      }
      color = fill_blendOverBackground(color, fill_backgroundColor);
    }
  `
};

export type FillStyleModuleProps = {
  project: ProjectProps;
  fillPatternEnabled?: boolean;
  fillPatternMask?: boolean;
  procedural?: boolean;
  fillPatternTexture: Texture;
  fillPatternSizeUnits?: Unit;
  fillPatternCommonFrame?: [number, number] | null;
};

type FillStyleModuleUniforms = {
  patternTextureSize?: [number, number];
  patternUnitScale?: number;
  patternEnabled?: boolean;
  patternMask?: boolean;
  procedural?: boolean;
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
      fillPatternSizeUnits = 'meters',
      fillPatternCommonFrame = null,
      procedural = false
    } = opts;
    const projectUniforms = project.getUniforms(opts.project) as ProjectUniforms;
    const {commonOrigin: coordinateOriginCommon} = projectUniforms;
    const unitScale = getPatternUnitScale(fillPatternSizeUnits, opts.project.viewport);

    // Improve the precision of the uv mapping by removing an integer multiple of the
    // pattern frames. This results in the same result, without wobbling at high zooms
    const origin: [number, number] = [coordinateOriginCommon[0], coordinateOriginCommon[1]];
    if (fillPatternCommonFrame) {
      origin[0] %= unitScale * fillPatternCommonFrame[0];
      origin[1] %= unitScale * fillPatternCommonFrame[1];
    }

    uniforms.uvCoordinateOrigin = origin;
    uniforms.uvCoordinateOrigin64Low = [fp64LowPart(origin[0]), fp64LowPart(origin[1])];
    uniforms.patternUnitScale = unitScale;
    uniforms.patternMask = fillPatternMask;
    uniforms.patternEnabled = fillPatternEnabled;
    uniforms.procedural = procedural;
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
    procedural: 'i32',
    flipY: 'i32',
    uvCoordinateOrigin: 'vec2<f32>',
    uvCoordinateOrigin64Low: 'vec2<f32>'
  }
} as const satisfies ShaderModule<
  FillStyleModuleProps,
  FillStyleModuleUniforms,
  FillStyleModuleBindings
>;
