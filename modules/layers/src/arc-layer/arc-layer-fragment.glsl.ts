// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME arc-layer-fragment-shader

precision highp float;

in vec4 vColor;
in vec2 uv;
in float isValid;

out vec4 fragColor;

void main(void) {
  float edgePixels = 0.0;
  if (arc.antialiasing) {
    float edgeCoord = abs(uv.y);
    edgePixels = (1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6);
  }

  if (isValid == 0.0) {
    discard;
  }

  fragColor = vColor;
  geometry.uv = uv;

  if (arc.antialiasing) {
    // Feather one device pixel across the width. Arc segments meet lengthwise, so only soften the
    // two outer edges of the strip.
    fragColor.a *= smoothedge(0.0, edgePixels);
  }

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
