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

#define SHADER_NAME scatterplot-layer-64-vertex-shader

attribute vec3 positions;
attribute vec4 instancePositionsFP64;
attribute vec2 layerHeight;
attribute float instanceRadius;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Only one-dimensional arrays may be declared in GLSL ES 1.0. specs p.24
uniform float opacity;
uniform vec2 zoomRadiusFP64;
uniform float radiusMinPixels;
uniform float radiusMaxPixels;
uniform float renderPickingBuffer;

varying vec4 vColor;

void main(void) {
  // For some reason, need to add one to elevation to show up in untilted mode

  vec2 projected_coord_xy[2];
  project_position_fp64(instancePositionsFP64, projected_coord_xy);

  vec2 pos_mul_radius[4];
  vec4_fp64(vec4(positions * instanceRadius, 0.0), pos_mul_radius);

  vec2 vertex_pos_localspace[4];
  vec4_scalar_mul_fp64(pos_mul_radius, zoomRadiusFP64, vertex_pos_localspace);

  vec2 vertex_pos_modelspace[4];

  vertex_pos_modelspace[0] = sum_fp64(vertex_pos_localspace[0], projected_coord_xy[0]);
  vertex_pos_modelspace[1] = sum_fp64(vertex_pos_localspace[1], projected_coord_xy[1]);
  vertex_pos_modelspace[2] = sum_fp64(vertex_pos_localspace[2], vec2(layerHeight.x + 1.0, layerHeight.y));
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);

  vec4 color = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;
  vec4 pickingColor = vec4(instancePickingColors / 255., 1.);

  vColor = mix(
    color,
    pickingColor,
    renderPickingBuffer
  );
}
