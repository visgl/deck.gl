// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME axes-layer-label-fragment-shader

precision highp float;

uniform sampler2D labelTexture;

in vec2 vTexCoords;
in float shouldDiscard;

out vec4 fragColor;

void main(void) {
  if (shouldDiscard > 0.0) {
    discard;
  }
  vec4 color = texture(labelTexture, vTexCoords);
  if (color.a == 0.0) {
    discard;
  }
  fragColor = color;
}
`;
