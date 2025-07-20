// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME axes-layer-label-vertex-shader

in vec3 positions;
in vec3 normals;
in vec2 texCoords;
in vec2 instancePositions;
in vec3 instanceNormals;
in float instanceOffsets;

uniform sampler2D labelTexture;

out vec2 vTexCoords;
out float shouldDiscard;

float sum2(vec2 v) {
  return v.x + v.y;
}

float sum3(vec3 v) {
  return v.x + v.y + v.z;
}

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
  // do not draw label behind the graph
  shouldDiscard = frontFacing(gridLineNormal) + (1.0 - frontFacing(gridVertexOffset));

  // get bounding box of texture in pixels
  //  +----------+----------+----------+
  //  | xlabel0  | ylabel0  | zlabel0  |
  //  +----------+----------+----------+
  //  | xlabel1  | ylabel1  | zlabel1  |
  //  +----------+----------+----------+
  //  | ...      | ...      | ...      |
  vec2 textureOrigin = vec2(
    sum3(vec3(0.0, axes.labelWidths.x, sum2(axes.labelWidths.xy)) * instanceNormals),
    instancePositions.y * axes.labelHeight
  );
  vec2 labelSize = vec2(sum3(axes.labelWidths * instanceNormals), axes.labelHeight);
  vTexCoords = (textureOrigin + labelSize * texCoords) / vec2(textureSize(labelTexture, 0));

  vec3 position_modelspace = vec3(instancePositions.x) *
    instanceNormals + gridVertexOffset * axes.gridDims / 2.0 + axes.gridCenter * abs(gridVertexOffset);

  // apply offsets
  position_modelspace += axes.gridOffset * gridLineNormal;
  position_modelspace += project_pixel_size(axes.fontSize * instanceOffsets) * gridVertexOffset;

  vec3 position_commonspace = project_position(position_modelspace);
  vec4 position_clipspace = project_common_position_to_clipspace(vec4(position_commonspace, 1.0));

  vec2 labelVertexOffset = vec2(texCoords.x - 0.5, 0.5 - texCoords.y) * labelSize;
  // project to clipspace
  labelVertexOffset = project_pixel_size_to_clipspace(labelVertexOffset).xy;
  // scale label to be constant size in pixels
  labelVertexOffset *= axes.fontSize / axes.labelHeight * position_clipspace.w;

  gl_Position = position_clipspace + vec4(labelVertexOffset, 0.0, 0.0);

}
`;
