// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME line-layer-fragment-shader

precision highp float;

in vec4 vColor;
in vec2 uv;

out vec4 fragColor;

void main(void) {
  geometry.uv = uv;

  fragColor = vColor;

  if (line.antialiasing) {
    // uv.y runs [-1, 1] across the width. Dividing the distance to the edge by the screen-space
    // derivative converts it to device pixels, which stays correct under perspective
    // foreshortening and at any device pixel ratio. Only the across-width silhouette is feathered
    // - the ends butt against neighboring segments in a multi-segment path.
    // Spread the transition over exactly one device pixel, centered on the edge.
    float edgeCoord = abs(uv.y);
    fragColor.a *= clamp((1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6) + 0.5, 0.0, 1.0);
  }

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
