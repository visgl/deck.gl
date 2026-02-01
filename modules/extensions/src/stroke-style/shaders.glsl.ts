// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export const dashShaders = {
  inject: {
    'vs:#decl': `
in vec2 instanceDashArrays;
out vec2 vDashArray;
`,

    'vs:#main-end': `
vDashArray = instanceDashArrays;
`,

    'fs:#decl': `
uniform strokeStyleUniforms {
  bool dashGapPickable;
} strokeStyle;

in vec2 vDashArray;
bool strokeStyle_inDashGap = false;

#ifndef PI
#define PI 3.141592653589793
#endif
`,

    // Calculate if we're in a dash gap based on the angle around the circle
    // This runs at the start of main() to set strokeStyle_inDashGap
    'fs:#main-start': `
{
  float strokeStyle_solidLength = vDashArray.x;
  float strokeStyle_gapLength = vDashArray.y;
  float strokeStyle_unitLength = strokeStyle_solidLength + strokeStyle_gapLength;

  if (strokeStyle_unitLength > 0.0 && scatterplot.stroked > 0.5) {
    float strokeStyle_distToCenter = length(unitPosition) * outerRadiusPixels;
    float strokeStyle_innerRadius = innerUnitRadius * outerRadiusPixels;

    // Only check dash if we're in the stroke area
    if (strokeStyle_distToCenter >= strokeStyle_innerRadius) {
      // Calculate stroke width in pixels
      float strokeStyle_strokeWidth = (1.0 - innerUnitRadius) * outerRadiusPixels;
      // Calculate the radius at the center of the stroke
      float strokeStyle_midStrokeRadius = (innerUnitRadius + 1.0) * 0.5 * outerRadiusPixels;
      // Calculate angle from unit position (0 to 2*PI)
      float strokeStyle_angle = atan(unitPosition.y, unitPosition.x) + PI;
      // Calculate position along circumference in stroke-width units
      float strokeStyle_circumference = 2.0 * PI * strokeStyle_midStrokeRadius;
      float strokeStyle_positionAlongStroke = (strokeStyle_angle / (2.0 * PI)) * strokeStyle_circumference / strokeStyle_strokeWidth;
      // Determine if in gap
      float strokeStyle_unitOffset = mod(strokeStyle_positionAlongStroke, strokeStyle_unitLength);
      strokeStyle_inDashGap = strokeStyle_unitOffset > strokeStyle_solidLength;
    }
  }
}
`,

    // Modify the final color based on dash gap status
    'fs:DECKGL_FILTER_COLOR': `
if (strokeStyle_inDashGap) {
  if (scatterplot.filled > 0.5) {
    // Show fill color through the gap
    float strokeStyle_distToCenter = length(unitPosition) * outerRadiusPixels;
    float strokeStyle_inCircle = scatterplot.antialiasing ?
      smoothedge(strokeStyle_distToCenter, outerRadiusPixels) :
      step(strokeStyle_distToCenter, outerRadiusPixels);
    color = vFillColor;
    color.a *= strokeStyle_inCircle;
  } else if (!(strokeStyle.dashGapPickable && bool(picking.isActive))) {
    discard;
  }
}
`
  }
};
