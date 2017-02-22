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

#define SHADER_NAME graph-layer-vertex-shader

attribute vec3 positions;
attribute vec3 normals;
attribute vec4 colors;

uniform vec3 center;
uniform float size;
uniform float fade;
uniform float opacity;

varying vec4 vColor;

void main(void) {

  // fit into a unit cube that centers at [0, 0, 0]
  vec4 position_modelspace = vec4((positions - center) / size, 1.0);
  gl_Position = project_to_clipspace(position_modelspace);

  vec4 center_viewspace = project_to_clipspace(vec4(0.0, 0.0, 0.0, 1.0));
  float fadeFactor = 1.0 - (gl_Position.z - center_viewspace.z) * fade;
  vColor = vec4(colors.rgb * fadeFactor, colors.a * opacity) / 255.0;
}
