attribute vec3 positions;

uniform vec2 a;
uniform float ONE;

varying vec4 vColor;

#pragma glslify: log_fp64 = require(../../layers/shaderlib/fp64/log-fp64, ONE=ONE)

void main(void) {

  gl_Position = vec4(positions, 1.0);
  vec2 result = log_fp64(a);
  vColor = vec4(result.x, result.y, 0.0, 1.0);
}
