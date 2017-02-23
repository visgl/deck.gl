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

attribute vec4 positions;
attribute vec4 colors;
attribute vec3 pickingColors;

uniform vec3 center;
uniform vec3 dim;
uniform float fade;
uniform float opacity;
uniform float renderPickingBuffer;

varying vec4 vColor;
varying float shouldDiscard;

void main(void) {

  // fit into a unit cube that centers at [0, 0, 0]
  float scale = 1.0 / max(dim.x, max(dim.y, dim.z));
  vec4 position_modelspace = vec4((positions.xyz - center) * scale, 1.0);
  gl_Position = project_to_clipspace(position_modelspace);

  vec4 center_viewspace = project_to_clipspace(vec4(0.0, 0.0, 0.0, 1.0));
  float fadeFactor = 1.0 - (gl_Position.z - center_viewspace.z) * fade;
  
  vec4 color = vec4(colors.rgb * fadeFactor, colors.a * opacity) / 255.0;
  vec4 pickingColor = vec4(pickingColors / 255.0, 1.0);

  vColor = mix(color, pickingColor, renderPickingBuffer);
  shouldDiscard = positions.w;
}
