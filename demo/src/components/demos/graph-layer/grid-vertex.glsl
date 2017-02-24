// Copyright (c) 2015 Uber Technologies, Inc.
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

#define SHADER_NAME graph-layer-axis-vertex-shader

attribute vec3 positions;
attribute vec3 normals;
attribute vec2 instancePositions;
attribute vec3 instanceNormals;

uniform vec3 center;
uniform vec3 dim;
uniform float offset;
uniform vec4 strokeColor;

varying vec4 vColor;
varying float shouldDiscard;

float frontFacing(vec3 v) {
  vec4 p0_viewspace = project_to_clipspace(vec4(0.0, 0.0, 0.0, 1.0));
  vec4 p1_viewspace = project_to_clipspace(vec4(v, 1.0));
  return step(p1_viewspace.z, p0_viewspace.z);
}

void main(void) {

  // rotate rectangle to align with slice
  vec3 vertexPosition = mat3(
      vec3(positions.z, positions.xy),
      vec3(positions.yz, positions.x),
      positions
    ) * instanceNormals * dim / 2.0;

  vec3 vertexNormal = mat3(
      vec3(normals.z, normals.xy),
      vec3(normals.yz, normals.x),
      normals
    ) * instanceNormals;

  // do not draw in front of the graph
  shouldDiscard = frontFacing(vertexNormal);

  // fit into a unit cube that centers at [0, 0, 0]
  float scale = 1.0 / max(dim.x, max(dim.y, dim.z));
  vec4 position_modelspace = vec4(
    ((vec3(instancePositions.x) - center) * instanceNormals + vertexPosition) * scale + offset * vertexNormal,
    1.0
  );
  gl_Position = project_to_clipspace(position_modelspace);

  vColor = strokeColor / 255.0;
}
