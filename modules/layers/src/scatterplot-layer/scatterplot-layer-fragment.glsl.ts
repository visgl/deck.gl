// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* glsl */ `\
#version 300 es
#define SHADER_NAME scatterplot-layer-fragment-shader

precision highp float;

in vec4 vFillColor;
in vec4 vLineColor;
in vec2 unitPosition;
in float innerUnitRadius;
in float outerRadiusPixels;
in vec2 vDashArray;

out vec4 fragColor;

#define PI 3.141592653589793

void main(void) {
  geometry.uv = unitPosition;

  float distToCenter = length(unitPosition) * outerRadiusPixels;
  float inCircle = scatterplot.antialiasing ?
    smoothedge(distToCenter, outerRadiusPixels) :
    step(distToCenter, outerRadiusPixels);

  if (inCircle == 0.0) {
    discard;
  }

  // Dash gap detection
  bool inDashGap = false;
  float dashUnitLength = vDashArray.x + vDashArray.y;
  if (dashUnitLength > 0.0 && scatterplot.stroked > 0.5) {
    float innerRadius = innerUnitRadius * outerRadiusPixels;
    if (distToCenter >= innerRadius) {
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
          if (!(scatterplot.dashGapPickable && bool(picking.isActive))) {
            discard;
          }
        }
      }
    }
  }

  if (scatterplot.stroked > 0.5) {
    float isLine = scatterplot.antialiasing ?
      smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter) :
      step(innerUnitRadius * outerRadiusPixels, distToCenter);

    if (scatterplot.filled > 0.5) {
      fragColor = mix(vFillColor, vLineColor, isLine);
    } else {
      if (isLine == 0.0) {
        discard;
      }
      fragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);
    }
  } else if (scatterplot.filled < 0.5) {
    discard;
  } else {
    fragColor = vFillColor;
  }

  fragColor.a *= inCircle;
  DECKGL_FILTER_COLOR(fragColor, geometry);

  // Override stroke color with fill color in dash gaps for filled circles
  if (inDashGap) {
    float alphaFactor = fragColor.a / max(vLineColor.a, 0.001);
    fragColor = vec4(vFillColor.rgb, vFillColor.a * alphaFactor);
    fragColor = picking_filterHighlightColor(fragColor);
  }
}
`;
