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

out vec4 fragColor;

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
}
`;
