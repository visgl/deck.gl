// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* glsl */ `\
#version 300 es
#define SHADER_NAME screen-grid-layer-vertex-shader
#define RANGE_COUNT 6

in vec2 positions;
in vec2 instancePositions;
in float instanceWeights;
in vec3 instancePickingColors;

uniform sampler2D colorRange;

out vec4 vColor;

vec4 interp(float value, vec2 domain, sampler2D range) {
  float r = (value - domain.x) / (domain.y - domain.x);
  return texture(range, vec2(r, 0.5));
}

void main(void) {
  if (isnan(instanceWeights)) {
    gl_Position = vec4(0.);
    return;
  }

  vec2 pos = instancePositions * screenGrid.gridSizeClipspace + positions * screenGrid.cellSizeClipspace;
  pos.x = pos.x - 1.0;
  pos.y = 1.0 - pos.y;

  gl_Position = vec4(pos, 0., 1.);

  vColor = interp(instanceWeights, screenGrid.colorDomain, colorRange);
  vColor.a *= layer.opacity;

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(instancePickingColors);
}
`;
