// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* wgsl */ `\
const WORLD_SCALE_FP64 = vec2f(81.4873275756836, 0.0000032873668232014097);

struct Project64Uniforms {
  scale: vec2f,
  viewProjectionMatrix: mat4x4f,
  viewProjectionMatrix64Low: mat4x4f,
};
@group(0) @binding(auto) var<uniform> project64: Project64Uniforms;

struct ProjectResult {
  clipPosition: vec4f,
  commonPosition: vec4f,
};

fn project_position_fp64(position: vec2f, position64Low: vec2f) -> array<vec2f, 2> {
  let longitude = vec2f(position.x, position64Low.x);
  let latitude = vec2f(position.y, position64Low.y);
  let x = sum_fp64(radians_fp64(longitude), PI_FP64);
  let angle = sum_fp64(PI_4_FP64, mul_fp64(radians_fp64(latitude), vec2f(0.5, 0.0)));
  let y = sum_fp64(PI_FP64, log_fp64(tan_fp64(angle)));
  return array<vec2f, 2>(mul_fp64(x, WORLD_SCALE_FP64), mul_fp64(y, WORLD_SCALE_FP64));
}

fn project_common_position_to_clipspace_fp64(position: array<vec2f, 4>) -> vec4f {
  var matrix: array<vec2f, 16>;
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      matrix[4 * i + j] = vec2f(
        project64.viewProjectionMatrix[j][i],
        project64.viewProjectionMatrix64Low[j][i]
      );
    }
  }
  let clipPosition = mat4_vec4_mul_fp64(matrix, position);
  // Projection matrices use WebGL's [-w, w] depth range; WebGPU uses [0, w].
  return vec4f(clipPosition[0].x, clipPosition[1].x,
    (clipPosition[2].x + clipPosition[3].x) * 0.5, clipPosition[3].x);
}

fn project_position_to_clipspace_and_commonspace(
  position: vec3f, position64Low: vec3f, offset: vec3f
) -> ProjectResult {
  let projectedPosition = project_position_fp64(position.xy, position64Low.xy);
  let z = project_size_float(position.z);
  let commonPosition = array<vec2f, 4>(
    sum_fp64(vec2f(offset.x, 0.0), projectedPosition[0]),
    sum_fp64(vec2f(offset.y, 0.0), projectedPosition[1]),
    sum_fp64(vec2f(offset.z, 0.0), vec2f(z, 0.0)),
    vec2f(1.0, 0.0)
  );
  return ProjectResult(
    project_common_position_to_clipspace_fp64(commonPosition),
    vec4f(projectedPosition[0].x, projectedPosition[1].x, z, 1.0)
  );
}

fn project_position_to_clipspace(
  position: vec3f, position64Low: vec3f, offset: vec3f
) -> vec4f {
  return project_position_to_clipspace_and_commonspace(position, position64Low, offset).clipPosition;
}
`;
