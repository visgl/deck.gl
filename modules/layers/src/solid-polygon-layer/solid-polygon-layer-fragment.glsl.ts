// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME solid-polygon-layer-fragment-shader

precision highp float;

in vec4 vColor;

out vec4 fragColor;

void main(void) {
  fragColor = vColor;
  // Fails to compile on some Android devices if geometry is never assigned (#8411)
  geometry.uv = vec2(0.);

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
