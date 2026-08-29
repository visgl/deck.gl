// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export type Defines = {
  // Defines passed externally
  /**
   * Enable high precision dash rendering.
   */
  HIGH_PRECISION_DASH?: boolean;
  /**
   * Set whenever the dash shaders are injected, so that the offset shaders can adjust dash
   * varyings only when they actually exist.
   */
  DASH_ENABLED?: boolean;
};

export const dashShaders = {
  inject: {
    'vs:#decl': `
in vec2 instanceDashArrays;
#ifdef HIGH_PRECISION_DASH
in float instanceDashOffsets;
#endif
out vec2 vDashArray;
out float vDashOffset;
`,

    'vs:#main-end': `
// How many screen pixels one unit of vPathPosition.y covers. The two extrusion branches of
// the path layer leave this in different units, and both differences have to be undone here
// for a billboarded path to dash like a flat one.
//
// Flat paths extrude in common space, so \`width\` is in common units and a unit of
// vPathPosition.y is width.x * project.scale pixels.
//
// Billboarded paths extrude in clip space, so \`width\` is already in pixels at this point -
// the clip-space conversion happens inside getLineJoinOffset. That conversion also folds in
// project.focalDistance, which scales the half-width the segment delta is divided by but not
// the delta itself, so a unit of vPathPosition.y ends up focalDistance pixels wider than the
// stroke it is supposed to be relative to.
float dashWidthPixels = path.billboard
  ? width.x * project.focalDistance
  : width.x * project.scale;

// getDashArray is documented relative to the stroke, which is what flat paths already do, so
// the billboard case is corrected onto the flat one rather than the other way round.
vDashArray = path.billboard
  ? instanceDashArrays / project.focalDistance
  : instanceDashArrays;

#ifdef HIGH_PRECISION_DASH
// instanceDashOffsets accumulates common-space distance on the CPU. Converting it to pixels
// and dividing by the pixel half-width above works in either branch; the previous
// \`instanceDashOffsets / width.x\` was only dimensionally correct for flat paths, and dropped
// a whole factor of project.scale when billboarded.
vDashOffset = (instanceDashOffsets * project.scale) / dashWidthPixels;
#else
vDashOffset = 0.0;
#endif
`,

    'fs:#decl': `
layout(std140) uniform pathStyleUniforms {
  float dashAlignMode;
  bool dashGapPickable;
} pathStyle;

in vec2 vDashArray;
in float vDashOffset;

// Integral of the dash square wave from 0 to position, i.e. how much solid stroke lies before it.
float dashPatternIntegral(float position, float solidLength, float unitLength) {
  return floor(position / unitLength) * solidLength +
    min(mod(position, unitLength), solidLength);
}

// Fraction of the filter-width interval centered on position that is covered by solid stroke.
//
// Testing the dash pattern with a single comparison per fragment aliases as soon as one
// period approaches one pixel: the stroke breaks into moire or, when the phase happens to
// land inside a dash, reads as solid. Integrating the wave over the fragment footprint
// instead is the closed form of what a mipmapped dash texture approximates, and it degrades
// the way one wants - once a period drops below a pixel the result converges on the duty
// cycle solidLength / unitLength, so the stroke fades to a uniformly lighter line.
//
// position is reduced into the first period first. The integral satisfies
// F(position + periodIndex * unitLength) = F(position) + periodIndex * solidLength,
// so the same periodIndex cancels out of the
// difference below, and keeping the arguments small avoids subtracting two large nearly
// equal numbers in fp32 on long paths.
float dashPatternCoverage(
  float position,
  float solidLength,
  float unitLength,
  float filterWidth
) {
  float halfFilter = 0.5 * filterWidth;
  float reducedPosition = mod(position, unitLength);
  return (dashPatternIntegral(reducedPosition + halfFilter, solidLength, unitLength) -
    dashPatternIntegral(reducedPosition - halfFilter, solidLength, unitLength)) / filterWidth;
}
`,

    // if given position is in the gap part of the dashed line
    // dashArray.x: solid stroke length, relative to width
    // dashArray.y: gap length, relative to width
    // alignMode:
    // 0 - no adjustment
    // o----     ----     ----     ---- o----     -o----     ----     o
    // 1 - stretch to fit, draw half dash at each end for nicer joints
    // o--    ----    ----    ----    --o--      --o--     ----     --o
    'fs:#main-start': `
  float dashCoverage = 1.0;
  bool shouldDiscardDash = false;

  float solidLength = vDashArray.x;
  float gapLength = vDashArray.y;
  float unitLength = solidLength + gapLength;

  if (unitLength > 0.0 && gapLength > 0.0) {
    float offset;
    if (pathStyle.dashAlignMode == 0.0) {
      offset = vDashOffset;
    } else {
      // At least one whole period per segment: a segment shorter than half a period rounds
      // to zero periods, which made unitLength infinite and rendered the segment solid.
      unitLength = vPathLength / max(round(vPathLength / unitLength), 1.0);
      // A very short segment can make the justified period shorter than the requested dash.
      // Treat that period as fully solid, matching the hard interval test and keeping the
      // coverage integral and duty cycle bounded by one.
      solidLength = min(solidLength, unitLength);
      offset = solidLength / 2.0;
    }

    float alongPath = vPathPosition.y + offset;
    float unitOffset = mod(alongPath, unitLength);
    float filterWidth = max(fwidth(alongPath), 0.0001);

    // Picking stays a hard in-or-out test. A blended picking colour decodes to the wrong
    // index, and dashGapPickable is defined in terms of whole gaps rather than coverage.
    if (bool(picking.isActive)) {
      bool inGap = unitOffset > solidLength;
      // Only measure the rounded end-cap distance after the hard interval test has found a
      // gap. Inside a solid interval the longitudinal distance is negative; taking its
      // vector length would turn it positive and incorrectly discard the middle of a dash.
      if (inGap && path.capType > 0.5) {
        inGap = length(vec2(
          min(unitOffset - solidLength, unitLength - unitOffset),
          vPathPosition.x
        )) > 1.0;
      }
      if (inGap && !pathStyle.dashGapPickable) {
        shouldDiscardDash = true;
      }
    } else if (path.capType <= 0.5) {
      dashCoverage = dashPatternCoverage(alongPath, solidLength, unitLength, filterWidth);
    } else {
      // Rounded caps: the dash end is an arc, so resolve the 2D distance to the nearer solid
      // end rather than the 1D position along the path. Only filter fragments in the gap;
      // PathLayer already antialiases the ordinary sides of the solid stroke.
      float distanceAlongGap = min(unitOffset - solidLength, unitLength - unitOffset);
      // Clamp before taking the derivative so the distance stays continuous across the
      // wrapped period boundary. Evaluate fwidth for every fragment in the quad; derivatives
      // are undefined inside the non-uniform gap branch below.
      float distanceToEnd = length(vec2(max(distanceAlongGap, 0.0), vPathPosition.x));
      float capEdgePixels = (1.0 - distanceToEnd) / max(fwidth(distanceToEnd), 1e-6);
      if (distanceAlongGap > 0.0) {
        dashCoverage = smoothedge(0.0, capEdgePixels);
      }
      // That smoothstep resolves one dash end at a time, so it stops meaning anything once a
      // whole period fits inside the filter footprint. Start fading only at that boundary;
      // blending resolvable periods would attenuate the solid body of every rounded dash.
      float subPixelBlend = smoothstep(unitLength, 2.0 * unitLength, filterWidth);
      // At sub-pixel scale, preserve the area of the repeated capsule rather than falling
      // back to the rectangular duty cycle. Each scanline contains the solid body plus the
      // two circular cap intrusions, capped when neighboring caps overlap across the gap.
      float boundedSolidLength = min(solidLength, unitLength);
      float effectiveGap = max(unitLength - boundedSolidLength, 0.0);
      float capSpan = 2.0 * sqrt(max(1.0 - vPathPosition.x * vPathPosition.x, 0.0));
      float roundedDutyCycle = clamp(
        (boundedSolidLength + min(effectiveGap, capSpan)) / unitLength,
        0.0,
        1.0
      );
      dashCoverage = mix(dashCoverage, roundedDutyCycle, subPixelBlend);
    }

    dashCoverage = clamp(dashCoverage, 0.0, 1.0);
    // Fully transparent fragments would still write depth and occlude whatever is behind.
    shouldDiscardDash = shouldDiscardDash || dashCoverage <= 0.0;
  }
`,

    'fs:#main-end': `
  // PathLayer computes analytic-edge derivatives in its fragment body. A discard in
  // #main-start can remove helper invocations and make those derivatives undefined, so all
  // dash-related termination is deferred until the layer has completed that work.
  if (shouldDiscardDash) {
    discard;
  }
  fragColor.a *= dashCoverage;
`
  }
};

export const scatterplotDashShaders = {
  inject: {
    'vs:#decl': `
in vec2 instanceDashArrays;
out vec2 vDashArray;
`,

    'vs:#main-end': `
vDashArray = instanceDashArrays;
`,

    'fs:#decl': `
layout(std140) uniform pathStyleUniforms {
  bool dashGapPickable;
} pathStyle;

in vec2 vDashArray;

#define PI 3.141592653589793
`,

    'fs:#main-start': `
  bool inDashGap = false;
  float dashUnitLength = vDashArray.x + vDashArray.y;
  if (dashUnitLength > 0.0 && scatterplot.stroked > 0.5) {
    float _distToCenter = length(unitPosition) * outerRadiusPixels;
    float innerRadius = innerUnitRadius * outerRadiusPixels;
    if (_distToCenter >= innerRadius) {
      float strokeWidth = (1.0 - innerUnitRadius) * outerRadiusPixels;
      float midStrokeRadius = (innerUnitRadius + 1.0) * 0.5 * outerRadiusPixels;
      float angle = atan(unitPosition.y, unitPosition.x) + PI;
      float circumference = 2.0 * PI * midStrokeRadius;
      float posAlongStroke = (angle / (2.0 * PI)) * circumference / strokeWidth;
      float unitOffset = mod(posAlongStroke, dashUnitLength);
      if (unitOffset > vDashArray.x) {
        if (scatterplot.filled > 0.5) {
          inDashGap = true;
        } else {
          if (!(pathStyle.dashGapPickable && bool(picking.isActive))) {
            discard;
          }
        }
      }
    }
  }
`,

    'fs:#main-end': `
  if (inDashGap) {
    float alphaFactor = fragColor.a / max(vLineColor.a, 0.001);
    fragColor = vec4(vFillColor.rgb, vFillColor.a * alphaFactor);
    fragColor = picking_filterPickingColor(fragColor);
    fragColor = picking_filterHighlightColor(fragColor);
  }
`
  }
};

export const textBackgroundDashShaders = {
  inject: {
    'vs:#decl': `
in vec2 instanceDashArrays;
out vec2 vDashArray;
`,

    'vs:#main-end': `
vDashArray = instanceDashArrays;
`,

    'fs:#decl': `
layout(std140) uniform pathStyleUniforms {
  bool dashGapPickable;
} pathStyle;

in vec2 vDashArray;

#define PI 3.141592653589793

// Calculate position along rounded rectangle perimeter in stroke-width units
float getPerimeterPosition(vec2 fragUV, vec2 dims, vec4 radii, float lineWidth) {
  float width = dims.x;
  float height = dims.y;

  float maxRadius = min(width, height) * 0.5;
  float rBL = min(radii.w, maxRadius);
  float rTL = min(radii.z, maxRadius);
  float rTR = min(radii.x, maxRadius);
  float rBR = min(radii.y, maxRadius);

  vec2 p = fragUV * dims;

  float leftLen = height - rBL - rTL;
  float topLen = width - rTL - rTR;
  float rightLen = height - rTR - rBR;
  float bottomLen = width - rBR - rBL;

  float arcBL = PI * 0.5 * rBL;
  float arcTL = PI * 0.5 * rTL;
  float arcTR = PI * 0.5 * rTR;
  float arcBR = PI * 0.5 * rBR;

  float pos = 0.0;

  float distLeft = p.x;
  float distRight = width - p.x;
  float distBottom = p.y;
  float distTop = height - p.y;
  float minDist = min(min(distLeft, distRight), min(distBottom, distTop));

  if (p.x < rBL && p.y < rBL) {
    vec2 c = vec2(rBL, rBL);
    vec2 d = p - c;
    float angle = atan(-d.x, -d.y);
    pos = angle / (PI * 0.5) * arcBL;
  } else if (p.x < rTL && p.y > height - rTL) {
    vec2 c = vec2(rTL, height - rTL);
    vec2 d = p - c;
    float angle = atan(d.y, -d.x);
    pos = arcBL + leftLen + angle / (PI * 0.5) * arcTL;
  } else if (p.x > width - rTR && p.y > height - rTR) {
    vec2 c = vec2(width - rTR, height - rTR);
    vec2 d = p - c;
    float angle = atan(d.x, d.y);
    pos = arcBL + leftLen + arcTL + topLen + angle / (PI * 0.5) * arcTR;
  } else if (p.x > width - rBR && p.y < rBR) {
    vec2 c = vec2(width - rBR, rBR);
    vec2 d = p - c;
    float angle = atan(-d.y, d.x);
    pos = arcBL + leftLen + arcTL + topLen + arcTR + rightLen + angle / (PI * 0.5) * arcBR;
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
float getRectPerimeterPosition(vec2 fragUV, vec2 dims, float lineWidth) {
  float width = dims.x;
  float height = dims.y;

  float distLeft = fragUV.x * width;
  float distRight = (1.0 - fragUV.x) * width;
  float distBottom = fragUV.y * height;
  float distTop = (1.0 - fragUV.y) * height;

  float minDist = min(min(distLeft, distRight), min(distBottom, distTop));

  float pos = 0.0;
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
`,

    'fs:#main-start': `
  bool inDashGap = false;
  float dashUnitLength = vDashArray.x + vDashArray.y;
  if (dashUnitLength > 0.0 && textBackground.stroked) {
    float distToEdge;
    bool hasRoundedCorners = textBackground.borderRadius != vec4(0.0);
    if (hasRoundedCorners) {
      distToEdge = round_rect(uv, dimensions, textBackground.borderRadius);
    } else {
      distToEdge = rect(uv, dimensions);
    }

    if (distToEdge <= vLineWidth && distToEdge >= 0.0) {
      float posAlongStroke;
      if (hasRoundedCorners) {
        posAlongStroke = getPerimeterPosition(uv, dimensions, textBackground.borderRadius, vLineWidth);
      } else {
        posAlongStroke = getRectPerimeterPosition(uv, dimensions, vLineWidth);
      }
      float unitOffset = mod(posAlongStroke, dashUnitLength);
      if (unitOffset > vDashArray.x) {
        if (vFillColor.a > 0.0) {
          inDashGap = true;
        } else {
          if (!(pathStyle.dashGapPickable && bool(picking.isActive))) {
            discard;
          }
        }
      }
    }
  }
`,

    'fs:#main-end': `
  if (inDashGap) {
    float alphaFactor = fragColor.a / max(vLineColor.a, 0.001);
    fragColor = vec4(vFillColor.rgb, vFillColor.a * alphaFactor);
    fragColor = picking_filterPickingColor(fragColor);
    fragColor = picking_filterHighlightColor(fragColor);
  }
`
  }
};

export const offsetShaders = {
  inject: {
    'vs:#decl': `
in float instanceOffsets;
`,
    'vs:DECKGL_FILTER_SIZE': `
  float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
  size *= offsetWidth;
`,
    'vs:#main-end': `
  float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
  float offsetDir = sign(instanceOffsets);
  vPathPosition.x = (vPathPosition.x + offsetDir) * offsetWidth - offsetDir;
  vPathPosition.y *= offsetWidth;
  vPathLength *= offsetWidth;
#ifdef DASH_ENABLED
  // DECKGL_FILTER_SIZE above widened the stroke by offsetWidth, so the three rescalings
  // here restore units of the original half-width. vDashOffset was computed against the
  // widened stroke in the dash block, which merges ahead of this one, so it needs the same
  // correction or a dashed offset line drifts out of phase with an unoffset one.
  vDashOffset *= offsetWidth;
#endif
`,
    'fs:#main-end': `
#ifndef ANTIALIASING
  // With analytic antialiasing, PathLayer evaluates this boundary using the remapped
  // vPathPosition and retains the complete centered coverage ramp. The hard clip remains for
  // the original non-AA path.
  if (abs(vPathPosition.x) > 1.0) {
    discard;
  }
#endif
`
  }
};
