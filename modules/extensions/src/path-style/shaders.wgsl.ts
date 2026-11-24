// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderPlugin} from '@luma.gl/shaders';

const dashUniformTypes = {
  dashAlignMode: 'f32',
  dashGapPickable: 'i32',
  dashUnits: 'i32'
} as const;

const dashSource = /* wgsl */ `
struct PathStyleUniforms {
  dashAlignMode: f32,
  dashGapPickable: i32,
  dashUnits: i32,
};
@group(0) @binding(auto) var<uniform> pathStyle: PathStyleUniforms;

fn pathStyle_mod(value: f32, period: f32) -> f32 {
  return value - floor(value / period) * period;
}

fn pathStyle_dashIntegral(position: f32, solid: f32, period: f32) -> f32 {
  return floor(position / period) * solid + min(pathStyle_mod(position, period), solid);
}

fn pathStyle_fitPeriod(length: f32, period: f32) -> f32 {
  return max(length / max(round(length / period), 1.0), 0.0001);
}
`;

/** Port the PathLayer dash and lateral offset stages using luma-managed inputs. */
export function getPathStylePlugin(
  dash: boolean,
  offset: boolean,
  precise: boolean,
  glslInjections: Record<string, string>
): ShaderPlugin {
  return {
    name: 'pathStyle',
    module: {
      name: 'pathStyle',
      ...(dash && {source: dashSource, uniformTypes: dashUniformTypes})
    },
    vertexInputs: {
      ...(offset && {instanceOffsets: 'f32'}),
      ...(dash && {instanceDashArrays: 'vec2<f32>'}),
      ...(dash && precise && {instanceDashOffsets: 'vec2<f32>'})
    },
    interStageVariables: dash
      ? {
          pathStyle_dashArray: {type: 'vec2<f32>'},
          pathStyle_dashOffset: {type: 'f32'},
          pathStyle_dashPathLength: {type: 'f32'}
        }
      : {},
    injections: {
      ...glslInjections,
      ...(offset && {
        'wgsl:vs:DECKGL_FILTER_SIZE': '*size *= abs(instanceOffsets * 2.0) + 1.0;'
      }),
      'wgsl:vs:DECKGL_PATH_STYLE_COORDINATES': /* wgsl */ `
var offsetWidth = 1.0;
#ifdef PATH_STYLE_OFFSET
  offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
  let offsetDirection = sign(instanceOffsets);
  (*pathPosition).x = ((*pathPosition).x + offsetDirection) * offsetWidth - offsetDirection;
  (*pathPosition).y *= offsetWidth;
  *pathLength *= offsetWidth;
  #ifdef DASH_ENABLED
    *dashSegment *= offsetWidth;
  #endif
#endif
#ifdef DASH_ENABLED
  let strokeHalfWidth = halfWidth / offsetWidth;
  let dashWidthPixels = max(select(strokeHalfWidth * project.scale, strokeHalfWidth * project.focalDistance, path.billboard != 0), 0.0001);
  let strokeHalfWidthPixels = select(strokeHalfWidth * project.scale, strokeHalfWidth, path.billboard != 0);
  let dashUnitPixels = select(
    select(strokeHalfWidthPixels, 1.0, pathStyle.dashUnits == 1),
    select(project_unit_size_to_pixel(1.0, UNIT_METERS), project.scale, pathStyle.dashUnits == 3),
    pathStyle.dashUnits >= 2
  );
  pathStyle_dashArray = instanceDashArrays * (dashUnitPixels / dashWidthPixels);
  pathStyle_dashOffset = 0.0;
  pathStyle_dashPathLength = 0.0;
  #ifdef HIGH_PRECISION_DASH
    let offsetAndLength = instanceDashOffsets * project.scale / dashWidthPixels;
    pathStyle_dashPathLength = offsetAndLength.y;
    let period = max(pathStyle_dashArray.x + pathStyle_dashArray.y, 0.0001);
    let fittedPeriod = pathStyle_fitPeriod(offsetAndLength.y, period);
    pathStyle_dashOffset = pathStyle_mod(offsetAndLength.x, select(period, fittedPeriod, pathStyle.dashAlignMode != 0.0));
  #endif
#endif
`,
      ...(dash && {
        'wgsl:fs:#decl': /* wgsl */ `
var<private> pathStyle_dashCoverage: f32;
var<private> pathStyle_discardDash: bool;
var<private> pathStyle_roundedGap: bool;
var<private> pathStyle_capCoverage: f32;
var<private> pathStyle_dutyCycle: f32;
var<private> pathStyle_subPixelBlend: f32;
`,
        // The derivative inputs are evaluated before the layer can discard a fragment.
        'wgsl:fs:#main-start': /* wgsl */ `
let gap = pathStyle_dashArray.y;
let unitLength = max(pathStyle_dashArray.x + gap, 0.0001);
var fitLength = varyings.vDashSegment.y;
#ifdef HIGH_PRECISION_DASH
  fitLength = pathStyle_dashPathLength;
#endif
let justified = pathStyle.dashAlignMode != 0.0;
let period = select(unitLength, pathStyle_fitPeriod(fitLength, unitLength), justified);
let solid = min(pathStyle_dashArray.x, period);
let along = varyings.vDashSegment.x + pathStyle_dashOffset + select(0.0, solid * 0.5, justified);
let phase = pathStyle_mod(along, period);
let filterWidth = max(fwidth(along), 0.0001);
let gapDistance = min(phase - solid, period - phase);
let transverse = varyings.vPathPosition.x;
let endDistance = length(vec2<f32>(max(gapDistance, 0.0), transverse));
let pathStyle_edgePixels = (1.0 - endDistance) / max(fwidth(endDistance), 1e-6);
pathStyle_capCoverage = smoothedge(0.0, pathStyle_edgePixels);
let rectangularCoverage = (
  pathStyle_dashIntegral(phase + 0.5 * filterWidth, solid, period) -
  pathStyle_dashIntegral(phase - 0.5 * filterWidth, solid, period)
) / filterWidth;
let capSpan = 2.0 * sqrt(max(1.0 - transverse * transverse, 0.0));
pathStyle_dutyCycle = clamp((solid + min(period - solid, capSpan)) / period, 0.0, 1.0);
pathStyle_subPixelBlend = smoothstep(period, 2.0 * period, filterWidth);
let rounded = path.capType > 0.5;
pathStyle_roundedGap = gap > 0.0 && rounded && gapDistance > 0.0;
pathStyle_dashCoverage = 1.0;
pathStyle_discardDash = false;
if (gap > 0.0) {
  if (picking.isActive > 0.5) {
    let inGap = phase > solid && (!rounded || endDistance > 1.0);
    pathStyle_discardDash = inGap && pathStyle.dashGapPickable == 0;
  } else if (rounded) {
    pathStyle_dashCoverage = mix(
      select(1.0, pathStyle_capCoverage, pathStyle_roundedGap), pathStyle_dutyCycle, pathStyle_subPixelBlend
    );
  } else {
    pathStyle_dashCoverage = clamp(rectangularCoverage, 0.0, 1.0);
  }
}
`
      }),
      'wgsl:fs:DECKGL_PATH_STYLE_COLOR': /* wgsl */ `
#ifdef DASH_ENABLED
  var coverage = pathStyle_dashCoverage;
  if (pathStyle_roundedGap && picking.isActive <= 0.5) {
    let resolved = min(pathCoverage, pathStyle_capCoverage) / max(pathCoverage, 1e-6);
    coverage = mix(resolved, pathStyle_dutyCycle, pathStyle_subPixelBlend);
  }
  if (pathStyle_discardDash || coverage <= 0.0) { discard; }
  (*color).a *= coverage;
#endif
#ifdef PATH_STYLE_OFFSET
  #ifndef ANTIALIASING
    if (abs(pathPosition.x) > 1.0) { discard; }
  #endif
#endif
`
    }
  };
}

const sdfSource = /* wgsl */ `
struct PathStyleUniforms {
  dashGapPickable: i32,
};
@group(0) @binding(auto) var<uniform> pathStyle: PathStyleUniforms;
const PATH_STYLE_PI = 3.141592653589793;
fn pathStyle_mod(value: f32, period: f32) -> f32 {
  return value - floor(value / period) * period;
}
`;

const textPerimeterSource = /* wgsl */ `
// Calculate position along rounded rectangle perimeter in stroke-width units
fn pathStyle_getPerimeterPosition(fragUV: vec2<f32>, dims: vec2<f32>, radii: vec4<f32>, lineWidth: f32) -> f32 {
  let width = dims.x;
  let height = dims.y;

  let maxRadius = min(width, height) * 0.5;
  let rBL = min(radii.w, maxRadius);
  let rTL = min(radii.z, maxRadius);
  let rTR = min(radii.x, maxRadius);
  let rBR = min(radii.y, maxRadius);

  let p = fragUV * dims;

  let leftLen = height - rBL - rTL;
  let topLen = width - rTL - rTR;
  let rightLen = height - rTR - rBR;
  let bottomLen = width - rBR - rBL;

  let arcBL = PATH_STYLE_PI * 0.5 * rBL;
  let arcTL = PATH_STYLE_PI * 0.5 * rTL;
  let arcTR = PATH_STYLE_PI * 0.5 * rTR;
  let arcBR = PATH_STYLE_PI * 0.5 * rBR;

  var pos = 0.0;

  let distLeft = p.x;
  let distRight = width - p.x;
  let distBottom = p.y;
  let distTop = height - p.y;
  let minDist = min(min(distLeft, distRight), min(distBottom, distTop));

  if (p.x < rBL && p.y < rBL) {
    let c = vec2<f32>(rBL, rBL);
    let d = p - c;
    let angle = atan2(-d.x, -d.y);
    pos = angle / (PATH_STYLE_PI * 0.5) * arcBL;
  } else if (p.x < rTL && p.y > height - rTL) {
    let c = vec2<f32>(rTL, height - rTL);
    let d = p - c;
    let angle = atan2(d.y, -d.x);
    pos = arcBL + leftLen + angle / (PATH_STYLE_PI * 0.5) * arcTL;
  } else if (p.x > width - rTR && p.y > height - rTR) {
    let c = vec2<f32>(width - rTR, height - rTR);
    let d = p - c;
    let angle = atan2(d.x, d.y);
    pos = arcBL + leftLen + arcTL + topLen + angle / (PATH_STYLE_PI * 0.5) * arcTR;
  } else if (p.x > width - rBR && p.y < rBR) {
    let c = vec2<f32>(width - rBR, rBR);
    let d = p - c;
    let angle = atan2(-d.y, d.x);
    pos = arcBL + leftLen + arcTL + topLen + arcTR + rightLen + angle / (PATH_STYLE_PI * 0.5) * arcBR;
  } else if (minDist == distLeft) {
    pos = arcBL + clamp(p.y - rBL, 0.0, leftLen);
  } else if (minDist == distTop) {
    pos = arcBL + leftLen + arcTL + clamp(p.x - rTL, 0.0, topLen);
  } else if (minDist == distRight) {
    pos = arcBL + leftLen + arcTL + topLen + arcTR + clamp(height - rTR - p.y, 0.0, rightLen);
  } else {
    pos = arcBL + leftLen + arcTL + topLen + arcTR + rightLen + arcBR + clamp(width - rBR - p.x, 0.0, bottomLen);
  }

  return pos / lineWidth;
}

// Simple rectangular perimeter calculation (no rounded corners)
fn pathStyle_getRectPerimeterPosition(fragUV: vec2<f32>, dims: vec2<f32>, lineWidth: f32) -> f32 {
  let width = dims.x;
  let height = dims.y;

  let distLeft = fragUV.x * width;
  let distRight = (1.0 - fragUV.x) * width;
  let distBottom = fragUV.y * height;
  let distTop = (1.0 - fragUV.y) * height;

  let minDist = min(min(distLeft, distRight), min(distBottom, distTop));

  var pos = 0.0;
  if (minDist == distLeft) {
    pos = fragUV.y * height;
  } else if (minDist == distTop) {
    pos = height + fragUV.x * width;
  } else if (minDist == distRight) {
    pos = height + width + (1.0 - fragUV.y) * height;
  } else {
    pos = 2.0 * height + width + (1.0 - fragUV.x) * width;
  }

  return pos / lineWidth;
}
`;

/** Apply the dashed stroke to circle and text-background silhouettes. */
export function getSDFDashPlugin(
  textBackground: boolean,
  glslInjections: Record<string, string>
): ShaderPlugin {
  return {
    name: 'pathStyle',
    module: {
      name: 'pathStyle',
      source: textBackground ? sdfSource + textPerimeterSource : sdfSource,
      uniformTypes: {dashGapPickable: 'i32'}
    },
    vertexInputs: {instanceDashArrays: 'vec2<f32>'},
    interStageVariables: {pathStyle_dashArray: {type: 'vec2<f32>'}},
    injections: {
      ...glslInjections,
      'wgsl:vs:DECKGL_FILTER_GL_POSITION': 'pathStyle_dashArray = instanceDashArrays;',
      'wgsl:fs:#decl': /* wgsl */ `
var<private> pathStyle_inGap: bool;
var<private> pathStyle_fillColor: vec4<f32>;
var<private> pathStyle_lineAlpha: f32;
var<private> pathStyle_hasFill: bool;
`,
      'wgsl:fs:#main-start': textBackground
        ? /* wgsl */ `
pathStyle_inGap = false;
pathStyle_fillColor = varyings.vFillColor;
pathStyle_lineAlpha = varyings.vLineColor.a;
pathStyle_hasFill = varyings.vFillColor.a > 0.0;
let period = pathStyle_dashArray.x + pathStyle_dashArray.y;
if (period > 0.0 && textBackground.stroked > 0.5 && varyings.vLineWidth > 0.0) {
  let rounded = any(textBackground.borderRadius != vec4<f32>(0.0));
  var distance = rect(varyings.uv, varyings.dimensions);
  if (rounded) {
    distance = round_rect(varyings.uv, varyings.dimensions, textBackground.borderRadius);
  }
  if (distance >= 0.0 && distance <= varyings.vLineWidth) {
    var along = pathStyle_getRectPerimeterPosition(varyings.uv, varyings.dimensions, varyings.vLineWidth);
    if (rounded) {
      along = pathStyle_getPerimeterPosition(
        varyings.uv, varyings.dimensions, textBackground.borderRadius, varyings.vLineWidth
      );
    }
    pathStyle_inGap = pathStyle_mod(along, period) > pathStyle_dashArray.x;
  }
}
`
        : /* wgsl */ `
pathStyle_inGap = false;
pathStyle_fillColor = varyings.vFillColor;
pathStyle_lineAlpha = varyings.vLineColor.a;
pathStyle_hasFill = scatterplot.filled != 0;
let period = pathStyle_dashArray.x + pathStyle_dashArray.y;
let strokeWidth = 1.0 - varyings.innerUnitRadius;
if (period > 0.0 && scatterplot.stroked != 0 && strokeWidth > 0.0 &&
    length(varyings.unitPosition) >= varyings.innerUnitRadius) {
  let angle = atan2(varyings.unitPosition.y, varyings.unitPosition.x) + PATH_STYLE_PI;
  let along = angle * (1.0 + varyings.innerUnitRadius) * 0.5 / strokeWidth;
  pathStyle_inGap = pathStyle_mod(along, period) > pathStyle_dashArray.x;
}
`,
      'wgsl:fs:DECKGL_FILTER_COLOR': /* wgsl */ `
if (pathStyle_inGap) {
  if (pathStyle_hasFill) {
    let coverage = (*color).a / max(pathStyle_lineAlpha, 0.001);
    *color = vec4<f32>(pathStyle_fillColor.rgb, pathStyle_fillColor.a * coverage);
  } else if (!(pathStyle.dashGapPickable != 0 && picking.isActive > 0.5)) {
    discard;
  }
}
`
    }
  };
}
