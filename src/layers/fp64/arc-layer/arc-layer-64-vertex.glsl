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

attribute vec3 positions;
attribute vec4 instanceSourceColors;
attribute vec4 instanceTargetColors;
attribute vec4 instanceSourcePositions64;
attribute vec4 instanceTargetPositions64;
attribute vec3 instancePickingColors;

uniform float numSegments;
uniform vec2 screenSize;
uniform float strokeWidth;
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

// offset vector by strokeWidth pixels
// offset_direction is -1 (left) or 1 (right)
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * screenSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);

  vec2 offset_screenspace = dir_screenspace * offset_direction * strokeWidth / 2.0;
  vec2 offset_clipspace = offset_screenspace / screenSize * 2.0;

  return offset_clipspace;
}

float getSegmentRatio(float index) {
  return smoothstep(0.0, 1.0, index / (numSegments - 1.0));
}

void get_pos_fp64(vec2 source[2], vec2 target[2], float segmentRatio, out vec2 position[4]) {

  vec2 vertex_height = paraboloid_fp64(source, target, segmentRatio);

  vec2 position_temp[2];

  vec2_mix_fp64(source, target, segmentRatio, position_temp);

  position[0] = position_temp[0];
  position[1] = position_temp[1];

  if (vertex_height.x < 0.0 || (vertex_height.x == 0.0 && vertex_height.y <= 0.0)) vertex_height = vec2(0.0, 0.0);

  position[2] = sqrt_fp64(vertex_height);
  position[3] = vec2(1.0, 0.0);
}

void main(void) {
  vec2 projected_source_coord[2];
  project_position_fp64(instanceSourcePositions64, projected_source_coord);
  vec2 projected_target_coord[2];
  project_position_fp64(instanceTargetPositions64, projected_target_coord);

  float segmentIndex = positions.x;
  float segmentRatio = getSegmentRatio(segmentIndex);

  // if it's the first point, use next - current as direction
  // otherwise use current - prev
  float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));
  float nextSegmentRatio = getSegmentRatio(segmentIndex + indexDir);

  vec2 curr_pos_modelspace[4];

  get_pos_fp64(projected_source_coord, projected_target_coord, segmentRatio, curr_pos_modelspace);

  vec2 next_pos_modelspace[4];

  get_pos_fp64(projected_source_coord, projected_target_coord, nextSegmentRatio, next_pos_modelspace);

  vec4 curr_pos_clipspace = project_to_clipspace_fp64(curr_pos_modelspace);
  vec4 next_pos_clipspace = project_to_clipspace_fp64(next_pos_modelspace);

  vec2 offset = getExtrusionOffset(next_pos_clipspace.xy - curr_pos_clipspace.xy, positions.y);

  gl_Position = curr_pos_clipspace + vec4(offset, 0.0, 0.0);

  vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio) / 255.;

  vColor = mix(
    vec4(color.rgb, color.a * opacity),
    vec4(instancePickingColors / 255., 1.),
    renderPickingBuffer
  );
}
