// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Shader injections for ScatterplotLayer (circle-based dash calculation)
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

// Shader injections for TextBackgroundLayer (rectangle-based dash calculation)
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
uniform strokeStyleUniforms {
  bool dashGapPickable;
} strokeStyle;

in vec2 vDashArray;
bool strokeStyle_inDashGap = false;

// Calculate position along rectangle perimeter (0 to perimeter length)
// Starting from bottom-left, going clockwise: left edge -> top -> right -> bottom
float strokeStyle_getPerimeterPosition(vec2 uv, vec2 dims, float lineWidth) {
  float width = dims.x;
  float height = dims.y;
  float perimeter = 2.0 * (width + height);

  // Distance from each edge (in pixels)
  float distLeft = uv.x * width;
  float distRight = (1.0 - uv.x) * width;
  float distBottom = uv.y * height;
  float distTop = (1.0 - uv.y) * height;

  // Find minimum distance to determine which edge we're closest to
  float minDist = min(min(distLeft, distRight), min(distBottom, distTop));

  // Calculate position along perimeter based on closest edge
  // Going clockwise from bottom-left corner
  float pos = 0.0;

  if (minDist == distLeft) {
    // Left edge: position goes from bottom (0) to top (height)
    pos = uv.y * height;
  } else if (minDist == distTop) {
    // Top edge: position goes from left (height) to right (height + width)
    pos = height + uv.x * width;
  } else if (minDist == distRight) {
    // Right edge: position goes from top (height + width) to bottom (height + width + height)
    pos = height + width + (1.0 - uv.y) * height;
  } else {
    // Bottom edge: position goes from right (2*height + width) to left (perimeter)
    pos = 2.0 * height + width + (1.0 - uv.x) * width;
  }

  // Convert to stroke-width units
  return pos / lineWidth;
}
`,

    // Calculate if we're in a dash gap based on perimeter position
    'fs:#main-start': `
{
  float strokeStyle_solidLength = vDashArray.x;
  float strokeStyle_gapLength = vDashArray.y;
  float strokeStyle_unitLength = strokeStyle_solidLength + strokeStyle_gapLength;

  if (strokeStyle_unitLength > 0.0 && textBackground.stroked) {
    // Calculate distance to edge
    float strokeStyle_distToEdge;
    if (textBackground.borderRadius != vec4(0.0)) {
      strokeStyle_distToEdge = round_rect(uv, dimensions, textBackground.borderRadius);
    } else {
      strokeStyle_distToEdge = rect(uv, dimensions);
    }

    // Only check dash if we're in the stroke area (near the edge)
    if (strokeStyle_distToEdge <= vLineWidth && strokeStyle_distToEdge >= 0.0) {
      float strokeStyle_positionAlongStroke = strokeStyle_getPerimeterPosition(uv, dimensions, vLineWidth);
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
  // Show fill color through the gap
  color = vFillColor;
  // Re-apply shape alpha for rounded corners
  if (textBackground.borderRadius != vec4(0.0)) {
    float distToEdge = round_rect(uv, dimensions, textBackground.borderRadius);
    float shapeAlpha = smoothedge(-distToEdge, 0.0);
    color.a *= shapeAlpha;
  }
  if (!(strokeStyle.dashGapPickable && bool(picking.isActive)) && color.a < 0.001) {
    discard;
  }
}
`
  }
};

