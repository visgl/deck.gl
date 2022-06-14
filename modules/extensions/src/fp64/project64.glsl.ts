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

const vec2 WORLD_SCALE_FP64 = vec2(81.4873275756836, 0.0000032873668232014097);

uniform vec2 project_uViewProjectionMatrixFP64[16];

// longitude: lnglat_fp64.xy; latitude: lnglat_fp64.zw
void mercatorProject_fp64(vec4 lnglat_fp64, out vec2 out_val[2]) {

#if defined(NVIDIA_FP64_WORKAROUND)
  out_val[0] = sum_fp64(radians_fp64(lnglat_fp64.xy), PI_FP64 * ONE);
#else
  out_val[0] = sum_fp64(radians_fp64(lnglat_fp64.xy), PI_FP64);
#endif
  out_val[1] = sum_fp64(PI_FP64,
    log_fp64(tan_fp64(sum_fp64(PI_4_FP64, radians_fp64(lnglat_fp64.zw) / 2.0))));
  return;
}

void project_position_fp64(vec4 position_fp64, out vec2 out_val[2]) {
  vec2 pos_fp64[2];
  mercatorProject_fp64(position_fp64, pos_fp64);
  out_val[0] = mul_fp64(pos_fp64[0], WORLD_SCALE_FP64);
  out_val[1] = mul_fp64(pos_fp64[1], WORLD_SCALE_FP64);

  return;
}

void project_position_fp64(vec2 position, vec2 position64xyLow, out vec2 out_val[2]) {
  vec4 position64xy = vec4(
    position.x, position64xyLow.x,
    position.y, position64xyLow.y);

  project_position_fp64(position64xy, out_val);
}

vec4 project_common_position_to_clipspace_fp64(vec2 vertex_pos_modelspace[4]) {
  vec2 vertex_pos_clipspace[4];
  mat4_vec4_mul_fp64(project_uViewProjectionMatrixFP64, vertex_pos_modelspace,
    vertex_pos_clipspace);
  return vec4(
    vertex_pos_clipspace[0].x,
    vertex_pos_clipspace[1].x,
    vertex_pos_clipspace[2].x,
    vertex_pos_clipspace[3].x
    );
}

vec4 project_position_to_clipspace(
  vec3 position, vec3 position64xyLow, vec3 offset, out vec4 commonPosition
) {
  // This is the local offset to the instance position
  vec2 offset64[4];
  vec4_fp64(vec4(offset, 0.0), offset64);

  float z = project_size(position.z);

  // Apply web mercator projection (depends on coordinate system imn use)
  vec2 projectedPosition64xy[2];
  project_position_fp64(position.xy, position64xyLow.xy, projectedPosition64xy);

  vec2 commonPosition64[4];
  commonPosition64[0] = sum_fp64(offset64[0], projectedPosition64xy[0]);
  commonPosition64[1] = sum_fp64(offset64[1], projectedPosition64xy[1]);
  commonPosition64[2] = sum_fp64(offset64[2], vec2(z, 0.0));
  commonPosition64[3] = vec2(1.0, 0.0);

  commonPosition = vec4(projectedPosition64xy[0].x, projectedPosition64xy[1].x, z, 1.0);

  return project_common_position_to_clipspace_fp64(commonPosition64);
}

vec4 project_position_to_clipspace(
  vec3 position, vec3 position64xyLow, vec3 offset
) {
  vec4 commonPosition;
  return project_position_to_clipspace(
    position, position64xyLow, offset, commonPosition
  );
}
`;
