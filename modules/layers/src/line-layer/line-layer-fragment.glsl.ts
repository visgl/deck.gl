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

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
