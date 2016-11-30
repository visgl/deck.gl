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

#define SHADER_NAME choropleth-layer-64-vertex-shader

attribute vec4 positionsFP64;
attribute vec2 heightsFP64;

attribute vec3 positions;
attribute vec4 colors;
attribute vec3 pickingColors;

uniform float opacity;
uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

varying vec4 vColor;

vec4 getColor(vec4 color, float opacity, vec3 pickingColor, float renderPickingBuffer) {
  vec4 color4 = vec4(color.xyz / 255., color.w / 255. * opacity);
  vec4 pickingColor4 = vec4(pickingColor / 255., 1.);
  return mix(color4, pickingColor4, renderPickingBuffer);
}

void main(void) {
  // For some reason, need to add one to elevation to show up in untilted mode
  vec2 projectedCoord[2];
  project_position_fp64(positionsFP64, projectedCoord);

  vec2 vertex_pos_modelspace[4];

  vertex_pos_modelspace[0] = projectedCoord[0];
  vertex_pos_modelspace[1] = projectedCoord[1];
  vertex_pos_modelspace[2] = heightsFP64;
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);

  vec4 color = vec4(colors.rgb, colors.a * opacity) / 255.;
  vec4 pickingColor = vec4(pickingColors / 255., 1.);

  vColor = mix(
    color,
    pickingColor,
    renderPickingBuffer
  );
}
