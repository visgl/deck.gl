// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export default `\
#version 300 es
#define SHADER_NAME axes-layer-grid-vertex-shader

in vec3 positions;
in vec3 normals;
in vec2 instancePositions;
in vec3 instanceNormals;
in float instanceIsTitle;

uniform vec3 gridDims;
uniform vec3 gridCenter;
uniform float gridOffset;
uniform vec4 strokeColor;

out vec4 vColor;
out float shouldDiscard;

// determines if the grid line is behind or in front of the center
float frontFacing(vec3 v) {
  vec4 v_clipspace = project_uViewProjectionMatrix * project_uModelMatrix * vec4(v, 0.0);
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
    instanceNormals + gridVertexOffset * gridDims / 2.0 + gridCenter * abs(gridVertexOffset);

  // apply offsets
  position_modelspace += gridOffset * gridLineNormal;

  vec3 position_commonspace = project_position(position_modelspace);
  gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 1.0));

  vColor = strokeColor / 255.0;
}
`;
