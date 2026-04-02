// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME text-background-layer-fragment-shader

precision highp float;

in vec4 vFillColor;
in vec4 vLineColor;
in float vLineWidth;
in vec2 uv;
in vec2 dimensions;
in vec2 vDashArray;

out vec4 fragColor;

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

float round_rect(vec2 p, vec2 size, vec4 radii) {
  // Convert p and size to center-based coordinates [-0.5, 0.5]
  vec2 pixelPositionCB = (p - 0.5) * size;
  vec2 sizeCB = size * 0.5;

  float maxBorderRadius = min(size.x, size.y) * 0.5;
  vec4 borderRadius = vec4(min(radii, maxBorderRadius));

  // from https://www.shadertoy.com/view/4llXD7
  borderRadius.xy =
      (pixelPositionCB.x > 0.0) ? borderRadius.xy : borderRadius.zw;
  borderRadius.x = (pixelPositionCB.y > 0.0) ? borderRadius.x : borderRadius.y;
  vec2 q = abs(pixelPositionCB) - sizeCB + borderRadius.x;
  return -(min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - borderRadius.x);
}

float rect(vec2 p, vec2 size) {
  vec2 pixelPosition = p * size;
  return min(min(pixelPosition.x, size.x - pixelPosition.x),
             min(pixelPosition.y, size.y - pixelPosition.y));
}

vec4 get_stroked_fragColor(float dist) {
  float isBorder = smoothedge(dist, vLineWidth);
  return mix(vFillColor, vLineColor, isBorder);
}

void main(void) {
  geometry.uv = uv;

  // Dash gap detection
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
          if (!(textBackground.dashGapPickable && bool(picking.isActive))) {
            discard;
          }
        }
      }
    }
  }

  if (textBackground.borderRadius != vec4(0.0)) {
    float distToEdge = round_rect(uv, dimensions, textBackground.borderRadius);
    if (textBackground.stroked) {
      fragColor = get_stroked_fragColor(distToEdge);
    } else {
      fragColor = vFillColor;
    }
    // add border radius
    float shapeAlpha = smoothedge(-distToEdge, 0.0);
    fragColor.a *= shapeAlpha;
  } else {
    if (textBackground.stroked) {
      float distToEdge = rect(uv, dimensions);
      fragColor = get_stroked_fragColor(distToEdge);
    } else {
      fragColor = vFillColor;
    }
  }
  DECKGL_FILTER_COLOR(fragColor, geometry);

  // Override stroke color with fill color in dash gaps
  if (inDashGap) {
    float alphaFactor = fragColor.a / max(vLineColor.a, 0.001);
    fragColor = vec4(vFillColor.rgb, vFillColor.a * alphaFactor);
    fragColor = picking_filterHighlightColor(fragColor);
  }
}
`;
