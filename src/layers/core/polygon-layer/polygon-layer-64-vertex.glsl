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
#define SHADER_NAME polygon-layer-vertex-shader

attribute vec3 positions;
attribute vec2 positions64xyLow;
attribute vec3 normals;
attribute vec4 colors;
attribute vec3 pickingColors;

uniform float extruded;
uniform float opacity;

uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

// PICKING
uniform float pickingEnabled;
varying vec4 vPickingColor;

void main(void) {
  vec4 positions64xy = vec4(positions.x, positions64xyLow.x, positions.y, positions64xyLow.y);

  vec2 projected_coord_xy[2];
  project_position_fp64(positions64xy, projected_coord_xy);

  vec2 vertex_pos_modelspace[4];
  vertex_pos_modelspace[0] = projected_coord_xy[0];
  vertex_pos_modelspace[1] = projected_coord_xy[1];
  vertex_pos_modelspace[2] = vec2(project_scale(positions.z), 0.0);
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);

  vec4 position_worldspace = vec4(vertex_pos_modelspace[0].x, vertex_pos_modelspace[1].x, vertex_pos_modelspace[2].x, vertex_pos_modelspace[3].x);

  if (pickingEnabled < 0.5) {
    float lightWeight = 1.0;

    if (extruded > 0.5) {
      lightWeight = getLightWeight(
        position_worldspace,
        normals
      );
    }

    vec3 lightWeightedColor = lightWeight * colors.rgb;
    vec4 color = vec4(lightWeightedColor, colors.a * opacity) / 255.0;

    vPickingColor = color;

  } else {
    vPickingColor = vec4(pickingColors.rgb / 255.0, 1.0);
  }
}
