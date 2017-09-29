/* eslint-disable camelcase */
const INITIAL_STATE = {};

function getUniforms({} = INITIAL_STATE) {}

const vs = `\
vec2 utils_clipspace_to_uv(vec4 position) {
  vec2 p = vec2(position.x / position.w, position.y / position.w);
  return vec2((p.x + 1.0) / 2.0, (p.y + 1.0) / 2.0);
}
`;

const fs = vs;

export default {
  name: 'outline',
  vs,
  fs,
  getUniforms
};
