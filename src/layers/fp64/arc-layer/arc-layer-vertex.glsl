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

#define SHADER_NAME arc-layer-64-vertex-shader

const float N = 49.0;

attribute vec3 positions;
attribute vec4 instanceSourceColors;
attribute vec4 instanceTargetColors;
attribute vec3 instancePickingColors;
attribute vec4 instanceSourcePositionsFP64;
attribute vec4 instanceTargetPositionsFP64;

uniform float opacity;
uniform float renderPickingBuffer;

varying vec4 vColor;

vec2 paraboloid_fp64(vec2 source[2], vec2 target[2], float ratio) {

  vec2 x[2];
  vec2_mix_fp64(source, target, ratio, x);
  vec2 center[2];
  vec2_mix_fp64(source, target, 0.5, center);

  vec2 dSourceCenter = vec2_distance_fp64(source, center);
  vec2 dXCenter = vec2_distance_fp64(x, center);
  return mul_fp64(sum_fp64(dSourceCenter, dXCenter), sub_fp64(dSourceCenter, dXCenter));
}

void main(void) {
  vec2 projectedSourceCoord[2];
  project_position_fp64(instanceSourcePositionsFP64, projectedSourceCoord);
  vec2 projectedTargetCoord[2];
  project_position_fp64(instanceTargetPositionsFP64, projectedTargetCoord);

  float segmentRatio = smoothstep(0.0, 1.0, positions.x / N);

  vec2 mixed_temp[2];

  vec2_mix_fp64(projectedSourceCoord, projectedTargetCoord, segmentRatio, mixed_temp);

  vec2 vertex_pos_modelspace[4];

  vertex_pos_modelspace[0] = mixed_temp[0];
  vertex_pos_modelspace[1] = mixed_temp[1];

  vec2 vertex_height = paraboloid_fp64(projectedSourceCoord, projectedTargetCoord, segmentRatio);
  if (vertex_height.x < 0.0 || (vertex_height.x == 0.0 && vertex_height.y <= 0.0)) vertex_height = vec2(0.0, 0.0);

  vertex_pos_modelspace[2] = sqrt_fp64(vertex_height);
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);

  vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio) / 255.;

  vColor = mix(
    vec4(color.rgb, color.a * opacity),
    vec4(instancePickingColors / 255., 1.),
    renderPickingBuffer
  );
}
