// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME surface-layer-vertex-shader

in vec3 positions;
in vec3 positions64Low;
in vec4 colors;
in vec4 pickingColors;

out vec4 vColor;
out float shouldDiscard;

void main(void) {
  vec3 position_commonspace = project_position(positions, positions64Low);
  gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 1.0));

  // cheap way to produce believable front-lit effect.
  // Note: clipsspace depth is nonlinear and deltaZ depends on the near and far values
  // when creating the perspective projection matrix.
  vec4 position_vector = project_common_position_to_clipspace(vec4(position_commonspace, 0.0));
  float fadeFactor = 1.0 - position_vector.z * surface.lightStrength;

  vColor = vec4(colors.rgb * fadeFactor, colors.a * layer.opacity) / 255.0;;

  picking_setPickingColor(pickingColors.xyz);

  shouldDiscard = pickingColors.a;
}
`;
