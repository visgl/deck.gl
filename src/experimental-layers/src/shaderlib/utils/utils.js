// TODO - this module is a WIP

/* eslint-disable camelcase */
const INITIAL_STATE = {};

function getUniforms({} = INITIAL_STATE) {}

const vs = `\
// Note - fairly generic, move to a UV or screen package, or even project?
vec2 project_clipspace_to_uv(vec4 position) {
  vec2 p = vec2(position.x / position.w, position.y / position.w);
  return vec2((p.x + 1.0) / 2.0, (p.y + 1.0) / 2.0);
}

vec2 project_clipspace_to_projective_uv(vec4 position) {
  // outline_vPosition = mat4(
  //   0.5, 0.0, 0.0, 0.0,
  //   0.0, 0.5, 0.0, 0.0,
  //   0.0, 0.0, 0.5, 0.0,
  //   0.5, 0.5, 0.5, 1.0
  // ) * position;
  return vec4(position.xyz * 0.5 + position.w * 0.5, position.w);
}
`;

const fs = vs;

export default {
  name: 'outline',
  vs,
  fs,
  getUniforms
};
