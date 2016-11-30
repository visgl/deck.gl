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

#define SHADER_NAME line-layer-64-vertex-shader

attribute vec3 positions;
attribute vec4 instanceSourcePositionsFP64;
attribute vec4 instanceTargetPositionsFP64;
attribute vec2 instanceElevations;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

uniform float opacity;
uniform float renderPickingBuffer;

varying vec4 vColor;

void main(void) {
  // Position
  vec2 projectedSourceCoord[2];
  project_position_fp64(instanceSourcePositionsFP64, projectedSourceCoord);
  vec2 projectedTargetCoord[2];
  project_position_fp64(instanceTargetPositionsFP64, projectedTargetCoord);

  // linear interpolation of source & target to pick right coord
  float segmentIndex = positions.x;
  vec2 mixed_temp[2];

  vec2_mix_fp64(projectedSourceCoord, projectedTargetCoord, segmentIndex, mixed_temp);

  float mixedElevation =
    mix(instanceElevations.x, instanceElevations.y, segmentIndex);

  vec2 vertex_pos_modelspace[4];

  vertex_pos_modelspace[0] = mixed_temp[0];
  vertex_pos_modelspace[1] = mixed_temp[1];
  vertex_pos_modelspace[2] = vec2(project_scale(mixedElevation), 0.0);
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);

  // Color
  vec4 color = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;
  vec4 pickingColor = vec4(instancePickingColors / 255., 1.);

  vColor = mix(
    color,
    pickingColor,
    renderPickingBuffer
  );
}
