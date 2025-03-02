// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME point-cloud-layer-fragment-shader

precision highp float;

in vec4 vColor;
in vec2 unitPosition;

out vec4 fragColor;

void main(void) {
  geometry.uv = unitPosition.xy;

  float distToCenter = length(unitPosition);

  if (distToCenter > 1.0) {
    discard;
  }

  fragColor = vColor;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
