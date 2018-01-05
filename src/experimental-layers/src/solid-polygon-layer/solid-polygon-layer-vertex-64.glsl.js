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
#define SHADER_NAME solid-polygon-layer-vertex-shader-64

attribute vec2 vertexPositions;
attribute vec3 positions;
attribute vec2 positions64xyLow;
attribute vec3 nextPositions;
attribute vec2 nextPositions64xyLow;
attribute float elevations;
attribute vec4 colors;
attribute vec3 pickingColors;

uniform float isSideVertex;
uniform float extruded;
uniform float elevationScale;
uniform float opacity;

varying vec4 vColor;

void main(void) {

  vec3 pos;
  vec2 pos64xyLow;
  vec3 normal;

  if (isSideVertex > 0.5) {
    pos = mix(positions, nextPositions, vertexPositions.x);
    pos64xyLow = mix(positions64xyLow, nextPositions64xyLow, vertexPositions.x);
  } else {
    pos = positions;
    pos64xyLow = positions64xyLow;
  }
  if (extruded > 0.5) {
    pos.z += elevations * vertexPositions.y;
  }

  vec4 positions64xy = vec4(pos.x, pos64xyLow.x, pos.y, pos64xyLow.y);

  vec2 projected_coord_xy[2];
  project_position_fp64(positions64xy, projected_coord_xy);

  vec2 vertex_pos_modelspace[4];
  vertex_pos_modelspace[0] = projected_coord_xy[0];
  vertex_pos_modelspace[1] = projected_coord_xy[1];
  vertex_pos_modelspace[2] = vec2(project_scale(pos.z * elevationScale), 0.0);
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);

  vec4 position_worldspace = vec4(
    vertex_pos_modelspace[0].x, vertex_pos_modelspace[1].x,
    vertex_pos_modelspace[2].x, vertex_pos_modelspace[3].x);

  float lightWeight = 1.0;

  if (extruded > 0.5) {
    if (isSideVertex > 0.5) {
      normal = vec3(positions.y - nextPositions.y, nextPositions.x - positions.x, 0.0);
      normal = project_normal(normal);
    } else {
      normal = vec3(0.0, 0.0, 1.0);
    }

    lightWeight = getLightWeight(position_worldspace.xyz, normal);
  }

  vec3 lightWeightedColor = lightWeight * colors.rgb;
  vColor = vec4(lightWeightedColor, colors.a * opacity) / 255.0;

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(pickingColors);
}
`;
