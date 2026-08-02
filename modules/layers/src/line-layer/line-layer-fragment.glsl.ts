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
    // Feather one device pixel across the width, from the derivative of uv.y. The ends are left
    // hard - they abut neighboring segments. See dev-docs/RFCs/v9.4/path-line-antialiasing-rfc.md
    float edgeCoord = abs(uv.y);
    fragColor.a *= clamp((1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6) + 0.5, 0.0, 1.0);
  }

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
