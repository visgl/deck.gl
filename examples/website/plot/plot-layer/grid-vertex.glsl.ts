// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME axes-layer-grid-vertex-shader

in vec3 positions;
in vec3 normals;
in vec2 instancePositions;
in vec3 instanceNormals;
in float instanceIsTitle;

out vec4 vColor;
out float shouldDiscard;

// determines if the grid line is behind or in front of the center
float frontFacing(vec3 v) {
  vec4 v_clipspace = project.viewProjectionMatrix * project.modelMatrix * vec4(v, 0.0);
  return step(v_clipspace.z, 0.0);
}

void main(void) {

  // rotated rectangle to align with slice:
  // for each x tick, draw rectangle on yz plane
  // for each y tick, draw rectangle on zx plane
  // for each z tick, draw rectangle on xy plane

  // offset of each corner of the rectangle from tick on axis
  vec3 gridVertexOffset = mat3(
      vec3(positions.z, positions.xy),
      vec3(positions.yz, positions.x),
      positions
    ) * instanceNormals;

  // normal of each edge of the rectangle from tick on axis
  vec3 gridLineNormal = mat3(
      vec3(normals.z, normals.xy),
      vec3(normals.yz, normals.x),
      normals
    ) * instanceNormals;

  // do not draw grid line in front of the graph
  shouldDiscard = frontFacing(gridLineNormal) + instanceIsTitle;

  vec3 position_modelspace = vec3(instancePositions.x) *
    instanceNormals + gridVertexOffset * axes.gridDims / 2.0 + axes.gridCenter * abs(gridVertexOffset);

  // apply offsets
  position_modelspace += axes.gridOffset * gridLineNormal;

  vec3 position_commonspace = project_position(position_modelspace);
  gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 1.0));

  vColor = axes.strokeColor / 255.0;
}
`;
