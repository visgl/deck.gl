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
  if (isValid == 0.0) {
    discard;
  }

  fragColor = vColor;
  geometry.uv = uv;

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
