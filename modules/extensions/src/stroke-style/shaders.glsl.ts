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

#ifndef PI
#define PI 3.141592653589793
#endif

// Calculate position along rounded rectangle perimeter (0 to perimeter length)
// Accounts for corner arcs when borderRadius > 0
// Starting from bottom-left corner, going clockwise
float strokeStyle_getPerimeterPosition(vec2 uv, vec2 dims, vec4 radii, float lineWidth) {
  float width = dims.x;
  float height = dims.y;

  // Get effective border radius for each corner (clamped to max possible)
  float maxRadius = min(width, height) * 0.5;
  float rBottomLeft = min(radii.w, maxRadius);
  float rTopLeft = min(radii.z, maxRadius);
  float rTopRight = min(radii.x, maxRadius);
  float rBottomRight = min(radii.y, maxRadius);

  // Pixel position from bottom-left corner
  vec2 pixelPos = uv * dims;

  // Calculate perimeter components
  float leftEdge = height - rBottomLeft - rTopLeft;
  float topEdge = width - rTopLeft - rTopRight;
  float rightEdge = height - rTopRight - rBottomRight;
  float bottomEdge = width - rBottomRight - rBottomLeft;

  float arcBottomLeft = PI * 0.5 * rBottomLeft;
  float arcTopLeft = PI * 0.5 * rTopLeft;
  float arcTopRight = PI * 0.5 * rTopRight;
  float arcBottomRight = PI * 0.5 * rBottomRight;

  float pos = 0.0;

  // Check which region we're in and calculate position
  // Going clockwise from bottom of left edge

  // Bottom-left corner region
  if (pixelPos.x < rBottomLeft && pixelPos.y < rBottomLeft) {
    vec2 cornerCenter = vec2(rBottomLeft, rBottomLeft);
    vec2 toPixel = pixelPos - cornerCenter;
    float angle = atan(toPixel.x, -toPixel.y); // 0 at bottom, PI/2 at left
    pos = (PI * 0.5 - angle) / (PI * 0.5) * arcBottomLeft;
  }
  // Left edge
  else if (pixelPos.x <= min(pixelPos.y, height - pixelPos.y) && pixelPos.y >= rBottomLeft && pixelPos.y <= height - rTopLeft) {
    pos = arcBottomLeft + (pixelPos.y - rBottomLeft);
  }
  // Top-left corner region
  else if (pixelPos.x < rTopLeft && pixelPos.y > height - rTopLeft) {
    vec2 cornerCenter = vec2(rTopLeft, height - rTopLeft);
    vec2 toPixel = pixelPos - cornerCenter;
    float angle = atan(-toPixel.y, -toPixel.x); // 0 at left, PI/2 at top
    pos = arcBottomLeft + leftEdge + angle / (PI * 0.5) * arcTopLeft;
  }
  // Top edge
  else if (pixelPos.y >= max(pixelPos.x, width - pixelPos.x) && pixelPos.x >= rTopLeft && pixelPos.x <= width - rTopRight) {
    pos = arcBottomLeft + leftEdge + arcTopLeft + (pixelPos.x - rTopLeft);
  }
  // Top-right corner region
  else if (pixelPos.x > width - rTopRight && pixelPos.y > height - rTopRight) {
    vec2 cornerCenter = vec2(width - rTopRight, height - rTopRight);
    vec2 toPixel = pixelPos - cornerCenter;
    float angle = atan(toPixel.x, toPixel.y); // 0 at top, PI/2 at right
    pos = arcBottomLeft + leftEdge + arcTopLeft + topEdge + angle / (PI * 0.5) * arcTopRight;
  }
  // Right edge
  else if (pixelPos.x >= max(pixelPos.y, height - pixelPos.y) && pixelPos.y >= rBottomRight && pixelPos.y <= height - rTopRight) {
    pos = arcBottomLeft + leftEdge + arcTopLeft + topEdge + arcTopRight + (height - rTopRight - pixelPos.y);
  }
  // Bottom-right corner region
  else if (pixelPos.x > width - rBottomRight && pixelPos.y < rBottomRight) {
    vec2 cornerCenter = vec2(width - rBottomRight, rBottomRight);
    vec2 toPixel = pixelPos - cornerCenter;
    float angle = atan(-toPixel.y, toPixel.x); // 0 at right, PI/2 at bottom
    pos = arcBottomLeft + leftEdge + arcTopLeft + topEdge + arcTopRight + rightEdge + angle / (PI * 0.5) * arcBottomRight;
  }
  // Bottom edge
  else {
    pos = arcBottomLeft + leftEdge + arcTopLeft + topEdge + arcTopRight + rightEdge + arcBottomRight + (width - rBottomRight - pixelPos.x);
  }

  // Convert to stroke-width units
  return pos / lineWidth;
}

// Simple rectangular perimeter calculation (no rounded corners)
float strokeStyle_getRectPerimeterPosition(vec2 uv, vec2 dims, float lineWidth) {
  float width = dims.x;
  float height = dims.y;

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
    pos = uv.y * height;
  } else if (minDist == distTop) {
    pos = height + uv.x * width;
  } else if (minDist == distRight) {
    pos = height + width + (1.0 - uv.y) * height;
  } else {
    pos = 2.0 * height + width + (1.0 - uv.x) * width;
  }

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
    bool strokeStyle_hasRoundedCorners = textBackground.borderRadius != vec4(0.0);

    if (strokeStyle_hasRoundedCorners) {
      strokeStyle_distToEdge = round_rect(uv, dimensions, textBackground.borderRadius);
    } else {
      strokeStyle_distToEdge = rect(uv, dimensions);
    }

    // Only check dash if we're in the stroke area (near the edge)
    if (strokeStyle_distToEdge <= vLineWidth && strokeStyle_distToEdge >= 0.0) {
      // Use appropriate perimeter calculation based on corner style
      float strokeStyle_positionAlongStroke;
      if (strokeStyle_hasRoundedCorners) {
        strokeStyle_positionAlongStroke = strokeStyle_getPerimeterPosition(uv, dimensions, textBackground.borderRadius, vLineWidth);
      } else {
        strokeStyle_positionAlongStroke = strokeStyle_getRectPerimeterPosition(uv, dimensions, vLineWidth);
      }
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
