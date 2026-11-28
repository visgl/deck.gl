// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME surface-layer-fragment-shader

precision highp float;

in vec4 vColor;
in float shouldDiscard;

out vec4 fragColor;

void main(void) {
  if (shouldDiscard > 0.0) {
    discard;
  }
  fragColor = vColor;
  fragColor = picking_filterPickingColor(fragColor);
}
`;
