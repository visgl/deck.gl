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
attribute vec4 instanceSourcePositions64;
attribute vec4 instanceTargetPositions64;
attribute vec2 instanceElevations;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

uniform vec2 screenSize;
uniform float strokeWidth;
uniform float opacity;
uniform float renderPickingBuffer;

varying vec4 vColor;

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

void main(void) {
  // Position
  vec2 projected_source_coord[2];
  project_position_fp64(instanceSourcePositions64, projected_source_coord);
  vec2 projected_target_coord[2];
  project_position_fp64(instanceTargetPositions64, projected_target_coord);

  vec2 source_pos_modelspace[4];
  source_pos_modelspace[0] =  projected_source_coord[0];
  source_pos_modelspace[1] =  projected_source_coord[1];
  source_pos_modelspace[2] = vec2(project_scale(instanceElevations.x), 0.0);
  source_pos_modelspace[3] = vec2(1.0, 0.0);

  vec4 source_pos_clipspace = project_to_clipspace_fp64(source_pos_modelspace);

  vec2 target_pos_modelspace[4];
  target_pos_modelspace[0] =  projected_target_coord[0];
  target_pos_modelspace[1] =  projected_target_coord[1];
  target_pos_modelspace[2] = vec2(project_scale(instanceElevations.y), 0.0);
  target_pos_modelspace[3] = vec2(1.0, 0.0);

  vec4 target_pos_clipspace = project_to_clipspace_fp64(target_pos_modelspace);

  float segmentIndex = positions.x;
  vec4 p = mix(source_pos_clipspace, target_pos_clipspace, segmentIndex);

  vec2 offset = getExtrusionOffset(target_pos_clipspace.xy - source_pos_clipspace.xy, positions.y);

  gl_Position = p + vec4(offset, 0.0, 0.0);

  // Color
  vec4 color = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;
  vec4 pickingColor = vec4(instancePickingColors / 255., 1.);

  vColor = mix(
    color,
    pickingColor,
    renderPickingBuffer
  );
}
