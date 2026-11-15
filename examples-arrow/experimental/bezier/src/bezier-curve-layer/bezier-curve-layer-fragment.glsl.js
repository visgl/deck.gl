// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME bezier-curve-layer-fragment-shader

precision highp float;

in vec4 vColor;
out vec4 fragColor;

void main(void) {
  fragColor = vColor;

  // use highlight color if this fragment belongs to the selected object.
  fragColor = picking_filterHighlightColor(fragColor);

  // use picking color if rendering to picking FBO.
  fragColor = picking_filterPickingColor(fragColor);
}
`;
