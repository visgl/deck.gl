// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* fragment shader for the grid-layer */
export default /* glsl */ `\
#version 300 es
#define SHADER_NAME screen-grid-layer-fragment-shader

precision highp float;

in vec4 vColor;

out vec4 fragColor;

void main(void) {
  fragColor = vColor;

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
