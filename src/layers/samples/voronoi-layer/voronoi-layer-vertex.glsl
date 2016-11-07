// Copyright (c) 2016 Uber Technologies, Inc.
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

#define SHADER_NAME voronoi-layer-vertex-shader

attribute vec3 positions;

attribute vec4 instancePositions;
attribute vec3 instanceColors;
attribute vec3 instancePickingColors;

uniform float opacity;
uniform float radius;
uniform float renderPickingBuffer;
uniform mat4 flatMatrix;

varying vec4 vColor;
varying float vFragDepth;

void main(void) {
  vec3 center = project_position(instancePositions.xyz);
  vec3 vertex = positions * scale(radius * instancePositions.w);
  vec4 position =
    project_to_clipspace(vec4(center, 1.0)) +
    project_to_clipspace(vec4(vertex, 0.0));
  vec4 positionFlat =
    project_to_clipspace(vec4(center.xy, 0.0, 1.0)) +
    project_to_clipspace(vec4(vertex.xy, 0.0, 0.0));

  gl_Position = positionFlat;
  vFragDepth = position.z / position.w;

  vec4 color = vec4(instanceColors / 255.0, opacity);
  vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.);
  vColor = mix(color, pickingColor, renderPickingBuffer);
}
