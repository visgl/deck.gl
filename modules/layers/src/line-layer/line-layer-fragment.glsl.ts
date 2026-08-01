// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME line-layer-fragment-shader

precision highp float;

in vec4 vColor;
in vec2 uv;
in float vHalfWidthDevicePixels;

out vec4 fragColor;

void main(void) {
  geometry.uv = uv;

  fragColor = vColor;

  if (line.antialiasing) {
    // Distance to the edge of the line, in device pixels. Only the across-width silhouette is
    // feathered - the ends butt against neighboring segments in a multi-segment path.
    // Spread the transition over exactly one device pixel, centered on the edge.
    float edgeDistance = (1.0 - abs(uv.y)) * vHalfWidthDevicePixels;
    fragColor.a *= clamp(edgeDistance + 0.5, 0.0, 1.0);
  }

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
