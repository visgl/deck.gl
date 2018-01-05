/* eslint-disable camelcase */
const INITIAL_STATE = {};

function getUniforms({} = INITIAL_STATE) {
  const uniforms = {};
  return uniforms;
}

const vs = `\
vec4 project_position_and_offset_to_clipspace_fp64(
  vec3 position64xyzHi, vec2 position64xyLow, vec3 offset, out vec4 worldPosition
) {
  // This is the local offset to the instance position
  vec2 offset64[4];
  vec4_fp64(vec4(offset, 0.0), offset64);

  // The 64 bit xy vertex position
  vec4 position64xy = vec4(
    position64xyzHi.x, position64xyLow.x,
    position64xyzHi.y, position64xyLow.y
  );

  float z = project_scale(position64xyzHi.z);

  // Apply web mercator projection (depends on coordinate system imn use)
  vec2 projectedPosition64xy[2];
  project_position_fp64(position64xy, projectedPosition64xy);

  vec2 worldPosition64[4];
  worldPosition64[0] = sum_fp64(offset64[0], projectedPosition64xy[0]);
  worldPosition64[1] = sum_fp64(offset64[1], projectedPosition64xy[1]);
  worldPosition64[2] = sum_fp64(offset64[2], vec2(z, 0.0));
  worldPosition64[3] = vec2(1.0, 0.0);

  worldPosition = vec4(projectedPosition64xy[0].x, projectedPosition64xy[1].x, z, 1.0);

  return project_to_clipspace_fp64(worldPosition64);
}

vec4 project_position_and_offset_to_clipspace_fp64(
  vec3 position64xyzHi, vec2 position64xyLow, vec3 offset
) {
  vec4 worldPosition;
  return project_position_and_offset_to_clipspace_fp64(
    position64xyzHi, position64xyLow, offset, worldPosition
  );
}
`;

export default {
  name: 'project64utils',
  dependencies: ['project64'],
  vs,
  fs: null,
  getUniforms
};
