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
#define SHADER_NAME graph-layer-axis-vertex-shader

attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;
attribute vec2 instancePositions;
attribute vec3 instanceNormals;
attribute float instanceIsTitle;

uniform vec3 gridDims;
uniform vec3 gridCenter;
uniform float gridOffset;
uniform vec3 labelWidths;
uniform float fontSize;
uniform float labelHeight;
uniform vec2 labelTextureDim;

varying vec2 vTexCoords;
varying float shouldDiscard;

const float LABEL_OFFSET = 0.02;
const float TITLE_OFFSET = 0.06;

float sum2(vec2 v) {
  return v.x + v.y;
}

float sum3(vec3 v) {
  return v.x + v.y + v.z;
}

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
    sum3(vec3(0.0, labelWidths.x, sum2(labelWidths.xy)) * instanceNormals),
    instancePositions.y * labelHeight
  );
  vec2 textureSize = vec2(sum3(labelWidths * instanceNormals), labelHeight);

  vTexCoords = (textureOrigin + textureSize * texCoords) / labelTextureDim;

  vec3 position_modelspace = vec3(instancePositions.x) *
    instanceNormals + gridVertexOffset * gridDims / 2.0 + gridCenter * abs(gridVertexOffset);

  // apply offsets
  position_modelspace += gridOffset * gridLineNormal;
  position_modelspace += (LABEL_OFFSET + (instanceIsTitle * TITLE_OFFSET)) * gridVertexOffset;

  vec3 position_commonspace = project_position(position_modelspace);
  vec4 position_clipspace = project_common_position_to_clipspace(vec4(position_commonspace, 1.0));

  vec2 labelVertexOffset = vec2(texCoords.x - 0.5, 0.5 - texCoords.y) * textureSize;
  // project to clipspace
  labelVertexOffset = project_pixel_size_to_clipspace(labelVertexOffset).xy;
  // scale label to be constant size in pixels
  labelVertexOffset *= fontSize / labelHeight * position_clipspace.w;

  gl_Position = position_clipspace + vec4(labelVertexOffset, 0.0, 0.0);

}
`;
