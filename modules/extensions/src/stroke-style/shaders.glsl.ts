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

#ifndef PI
#define PI 3.141592653589793
#endif
`,

    // Calculate if we're in a dash gap and discard if so
    // This runs at the start of main() after geometry.uv is set
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
      if (strokeStyle_unitOffset > strokeStyle_solidLength) {
        // In dash gap - discard unless picking gaps
        if (!(strokeStyle.dashGapPickable && bool(picking.isActive))) {
          discard;
        }
      }
    }
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

#ifndef PI
#define PI 3.141592653589793
#endif

// Calculate position along rounded rectangle perimeter (0 to perimeter length)
// Accounts for corner arcs when borderRadius > 0
// Starting from bottom-left corner, going clockwise (up the left edge first)
float strokeStyle_getPerimeterPosition(vec2 fragUV, vec2 dims, vec4 radii, float lineWidth) {
  float width = dims.x;
  float height = dims.y;

  // Get effective border radius for each corner (clamped to max possible)
  float maxRadius = min(width, height) * 0.5;
  float rBL = min(radii.w, maxRadius);
  float rTL = min(radii.z, maxRadius);
  float rTR = min(radii.x, maxRadius);
  float rBR = min(radii.y, maxRadius);

  // Pixel position from bottom-left corner
  vec2 p = fragUV * dims;

  // Calculate perimeter segment lengths
  float leftLen = height - rBL - rTL;
  float topLen = width - rTL - rTR;
  float rightLen = height - rTR - rBR;
  float bottomLen = width - rBR - rBL;

  float arcBL = PI * 0.5 * rBL;
  float arcTL = PI * 0.5 * rTL;
  float arcTR = PI * 0.5 * rTR;
  float arcBR = PI * 0.5 * rBR;

  float pos = 0.0;

  // Use distance-based edge detection (fixes non-square rectangle issue)
  float distLeft = p.x;
  float distRight = width - p.x;
  float distBottom = p.y;
  float distTop = height - p.y;
  float minDist = min(min(distLeft, distRight), min(distBottom, distTop));

  // Check corner regions first, then edges
  // Bottom-left corner
  if (p.x < rBL && p.y < rBL) {
    vec2 c = vec2(rBL, rBL);
    vec2 d = p - c;
    // Angle: 0 at bottom of arc, PI/2 at left of arc
    // d points from center toward pixel
    // At bottom: d = (0, -r), want angle = 0
    // At left: d = (-r, 0), want angle = PI/2
    float angle = atan(-d.x, -d.y);
    pos = angle / (PI * 0.5) * arcBL;
  }
  // Top-left corner
  else if (p.x < rTL && p.y > height - rTL) {
    vec2 c = vec2(rTL, height - rTL);
    vec2 d = p - c;
    // At left: d = (-r, 0), want angle = 0
    // At top: d = (0, r), want angle = PI/2
    float angle = atan(d.y, -d.x);
    pos = arcBL + leftLen + angle / (PI * 0.5) * arcTL;
  }
  // Top-right corner
  else if (p.x > width - rTR && p.y > height - rTR) {
    vec2 c = vec2(width - rTR, height - rTR);
    vec2 d = p - c;
    // At top: d = (0, r), want angle = 0
    // At right: d = (r, 0), want angle = PI/2
    float angle = atan(d.x, d.y);
    pos = arcBL + leftLen + arcTL + topLen + angle / (PI * 0.5) * arcTR;
  }
  // Bottom-right corner
  else if (p.x > width - rBR && p.y < rBR) {
    vec2 c = vec2(width - rBR, rBR);
    vec2 d = p - c;
    // At right: d = (r, 0), want angle = 0
    // At bottom: d = (0, -r), want angle = PI/2
    float angle = atan(-d.y, d.x);
    pos = arcBL + leftLen + arcTL + topLen + arcTR + rightLen + angle / (PI * 0.5) * arcBR;
  }
  // Left edge
  else if (minDist == distLeft) {
    pos = arcBL + clamp(p.y - rBL, 0.0, leftLen);
  }
  // Top edge
  else if (minDist == distTop) {
    pos = arcBL + leftLen + arcTL + clamp(p.x - rTL, 0.0, topLen);
  }
  // Right edge
  else if (minDist == distRight) {
    pos = arcBL + leftLen + arcTL + topLen + arcTR + clamp(height - rTR - p.y, 0.0, rightLen);
  }
  // Bottom edge
  else {
    pos = arcBL + leftLen + arcTL + topLen + arcTR + rightLen + arcBR + clamp(width - rBR - p.x, 0.0, bottomLen);
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

    // Calculate if we're in a dash gap and discard if so
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
      if (strokeStyle_unitOffset > strokeStyle_solidLength) {
        // In dash gap - discard unless picking gaps
        if (!(strokeStyle.dashGapPickable && bool(picking.isActive))) {
          discard;
        }
      }
    }
  }
}
`
  }
};
