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
attribute float instancePositions;
attribute vec3 instanceNormals;

uniform float offset;
uniform vec4 strokeColor;

varying vec4 vColor;
varying float shouldDiscard;

void main(void) {

  // rotate rectangle to align with slice
  vec3 vertexPosition = mix(
    mix(
      vec3(positions.x, 0.0, positions.y),
      vec3(0.0, positions.x, positions.y),
      instanceNormals.x
    ),
    positions,
    instanceNormals.z
  ) / 2.0;

  vec3 vertexNormal = mix(
    mix(
      vec3(normals.x, 0.0, normals.y),
      vec3(0.0, normals.x, normals.y),
      instanceNormals.x
    ),
    normals,
    instanceNormals.z
  ) / 2.0;

  // do not draw in front of the graph
  vec4 center_viewspace = project_to_clipspace(vec4(0.0, 0.0, 0.0, 1.0));
  vec4 vertex_viewspace = project_to_clipspace(vec4(vertexNormal, 1.0));
  shouldDiscard = step(vertex_viewspace.z, center_viewspace.z);

  vec4 position_modelspace = vec4(instancePositions * instanceNormals + vertexPosition + offset * vertexNormal, 1.0);
  gl_Position = project_to_clipspace(position_modelspace);

  vColor = strokeColor / 255.0;
}
