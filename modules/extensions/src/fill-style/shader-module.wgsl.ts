// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderPlugin} from '@luma.gl/shaders';

export const source = /* wgsl */ `
struct FillUniforms {
  patternTextureSize: vec2<f32>,
  patternUnitScale: f32,
  patternEnabled: i32,
  patternMask: i32,
  procedural: i32,
  flipY: i32,
  uvCoordinateOrigin: vec2<f32>,
  uvCoordinateOrigin64Low: vec2<f32>,
};

@group(0) @binding(auto) var<uniform> fill: FillUniforms;
#ifdef FILL_PROCEDURAL_PATTERN
@group(0) @binding(auto) var fill_patternTexture: texture_2d<u32>;
#else
@group(0) @binding(auto) var fill_patternTexture: texture_2d<f32>;
@group(0) @binding(auto) var fill_patternTextureSampler: sampler;
#endif

fn fill_mod(value: f32, period: f32) -> f32 {
  return value - period * floor(value / period);
}

fn fill_getPatternCoordinate(axis: vec2<f32>, period: f32, offset: f32) -> f32 {
  let scale = max(abs(fill_patternCoordinateScale), 1e-20);
  let yDirection = select(-1.0, 1.0, fill.flipY != 0);
  let orientation = vec2<f32>(1.0, yDirection);
  let origin = fill.uvCoordinateOrigin * orientation;
  let local = (fill.uvCoordinateOrigin64Low + fill_uv) * orientation;
  let highPart = fill_mod(dot(origin, axis) / scale, period);
  return fill_mod(highPart + dot(local, axis) / scale + offset * period, period);
}

fn fill_getScreenSpaceAlpha(signedDistance: f32) -> f32 {
  let derivative = fwidth(signedDistance);
  let distanceInPixels = signedDistance / max(derivative, 1e-20);
  return select(
    1.0 - smoothstep(-0.5, 0.5, distanceInPixels),
    select(0.0, 1.0, signedDistance <= 0.0),
    derivative == 0.0
  );
}

fn fill_getLineAlpha(position: f32, center: f32, period: f32, strokeWidth: f32) -> f32 {
  let distance = abs(fill_mod(position - center + period * 0.5, period) - period * 0.5);
  return fill_getScreenSpaceAlpha(distance - strokeWidth * 0.5);
}

fn fill_getHatchAlpha(angle: f32, strokeWidth: f32, gaps: vec2<f32>, alternating: bool) -> f32 {
  let normal = vec2<f32>(-sin(angle), cos(angle));
  let period = max(select(strokeWidth + gaps.x, strokeWidth * 2.0 + gaps.x + gaps.y, alternating), 1e-20);
  let position = fill_getPatternCoordinate(normal, period, dot(fill_patternOffsets, normal));
  let first = fill_getLineAlpha(position, 0.0, period, strokeWidth);
  let second = fill_getLineAlpha(position, strokeWidth + gaps.x, period, strokeWidth);
  return select(first, max(first, second), alternating);
}

fn fill_getDotAlpha(angle: f32, skew: f32, radius: f32, gap: f32) -> f32 {
  let axis0 = vec2<f32>(cos(angle), sin(angle));
  let axis1Angle = angle + 1.5707963267948966 - skew;
  let axis1 = vec2<f32>(cos(axis1Angle), sin(axis1Angle));
  let determinant = axis0.x * axis1.y - axis0.y * axis1.x;
  let reciprocal0 = vec2<f32>(axis1.y, -axis1.x) / determinant;
  let reciprocal1 = vec2<f32>(-axis0.y, axis0.x) / determinant;
  let period = max(radius * 2.0 + gap, 1e-20);
  let lattice = vec2<f32>(
    fill_getPatternCoordinate(reciprocal0, period, fill_patternOffsets.x),
    fill_getPatternCoordinate(reciprocal1, period, fill_patternOffsets.y)
  );
  let cellOffset = lattice + vec2<f32>(period * 0.5) -
    floor((lattice + vec2<f32>(period * 0.5)) / period) * period - vec2<f32>(period * 0.5);
  var distanceSquared = 1e20;
  for (var x = -1; x <= 1; x++) {
    for (var y = -1; y <= 1; y++) {
      let neighbor = cellOffset + vec2<f32>(f32(x), f32(y)) * period;
      let offset = axis0 * neighbor.x + axis1 * neighbor.y;
      distanceSquared = min(distanceSquared, dot(offset, offset));
    }
  }
  return fill_getScreenSpaceAlpha(sqrt(distanceSquared) - radius);
}

fn fill_getProceduralPatternAlpha() -> f32 {
  let patternType = fill_patternParams0.x;
  let size = fill_patternParams0.y;
  let gaps = fill_patternParams0.zw;
  let angles = fill_patternParams1.xy;
  let hatch = fill_getHatchAlpha(angles.x, size, gaps, patternType == 1.0 && fill_patternParams1.z == 2.0);
  let crossHatch = max(hatch, fill_getHatchAlpha(angles.y, size, gaps, false));
  let dots = fill_getDotAlpha(angles.x, angles.y, size, gaps.x);
  return select(select(select(1.0, hatch, patternType == 1.0), crossHatch, patternType == 2.0), dots, patternType == 3.0);
}

fn fill_blendOverBackground(pattern: vec4<f32>, background: vec4<f32>) -> vec4<f32> {
  if (background.a == 0.0 || layer.opacity == 0.0) { return pattern; }
  let patternAlpha = pattern.a / layer.opacity;
  let blendedAlpha = patternAlpha + background.a * (1.0 - patternAlpha);
  let rgb = mix(background.rgb, pattern.rgb, patternAlpha / blendedAlpha);
  return vec4<f32>(rgb, blendedAlpha * layer.opacity);
}
`;

export const vertexInputs = {
  fillPatternFrames: 'vec4<f32>',
  fillPatternScales: 'f32',
  fillPatternOffsets: 'vec2<f32>',
  fillPatternBackgroundColors: 'vec4<f32>'
} satisfies NonNullable<ShaderPlugin['vertexInputs']>;

export const interStageVariables = {
  fill_uv: {type: 'vec2<f32>'},
  fill_patternBounds: {type: 'vec4<f32>'},
  fill_patternOffsets: {type: 'vec2<f32>'},
  fill_backgroundColor: {type: 'vec4<f32>'},
  fill_patternCoordinateScale: {type: 'f32'},
  fill_patternParams0: {type: 'vec4<f32>', interpolation: 'flat'},
  fill_patternParams1: {type: 'vec4<f32>', interpolation: 'flat'}
} satisfies NonNullable<ShaderPlugin['interStageVariables']>;

export const injections = {
  'wgsl:vs:DECKGL_FILTER_GL_POSITION': /* wgsl */ `
if (fill.patternEnabled != 0) {
  let cameraFlatX = project_common_position_to_flat(project.cameraPosition).x;
  let flatPosition = project_common_position_to_flat_continuous(geometry.position, cameraFlatX);
  fill_patternOffsets = fillPatternOffsets;
  fill_backgroundColor = fillPatternBackgroundColors;
#ifdef FILL_PROCEDURAL_PATTERN
    fill_uv = flatPosition;
    fill_patternCoordinateScale = fill.patternUnitScale * fillPatternScales;
    let texelIndex = i32(fillPatternFrames.x) * 4;
    fill_patternParams0 = vec4<f32>(
      bitcast<vec2<f32>>(textureLoad(fill_patternTexture, vec2<i32>(texelIndex, 0), 0).rg),
      bitcast<vec2<f32>>(textureLoad(fill_patternTexture, vec2<i32>(texelIndex + 1, 0), 0).rg)
    );
    fill_patternParams1 = vec4<f32>(
      bitcast<vec2<f32>>(textureLoad(fill_patternTexture, vec2<i32>(texelIndex + 2, 0), 0).rg),
      bitcast<vec2<f32>>(textureLoad(fill_patternTexture, vec2<i32>(texelIndex + 3, 0), 0).rg)
    );
#else
    fill_patternBounds = fillPatternFrames / vec4<f32>(fill.patternTextureSize, fill.patternTextureSize);
    let frame = fill.patternUnitScale * fillPatternScales * fillPatternFrames.zw;
    let origin = fill.uvCoordinateOrigin - frame * floor(fill.uvCoordinateOrigin / frame) +
      fill.uvCoordinateOrigin64Low;
    fill_uv = (origin + flatPosition) / frame;
    fill_uv.y *= select(-1.0, 1.0, fill.flipY != 0);
    fill_uv += fillPatternOffsets;
#endif
}
`,
  'wgsl:fs:#decl': /* wgsl */ `
var<private> fill_sampledPattern: vec4<f32>;
`,
  // Evaluate gradients before any layer or extension discards.
  'wgsl:fs:#main-start': /* wgsl */ `
if (fill.patternEnabled != 0) {
#ifdef FILL_PROCEDURAL_PATTERN
    fill_sampledPattern = vec4<f32>(1.0, 1.0, 1.0, fill_getProceduralPatternAlpha());
#else
    let uv = fill_patternBounds.xy + fill_patternBounds.zw * fract(fill_uv);
    fill_sampledPattern = textureSampleGrad(
      fill_patternTexture, fill_patternTextureSampler, uv,
      fill_patternBounds.zw * dpdx(fill_uv), fill_patternBounds.zw * dpdy(fill_uv)
    );
#endif
}
`,
  'wgsl:fs:DECKGL_FILTER_COLOR': /* wgsl */ `
if (fill.patternEnabled != 0) {
  let rgb = select(fill_sampledPattern.rgb, (*color).rgb, fill.procedural != 0 || fill.patternMask != 0);
  *color = fill_blendOverBackground(
    vec4<f32>(rgb, (*color).a * fill_sampledPattern.a), fill_backgroundColor
  );
}
`
} satisfies NonNullable<ShaderPlugin['injections']>;
