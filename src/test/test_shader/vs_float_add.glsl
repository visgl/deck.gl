attribute vec3 positions;

uniform vec2 a;
uniform vec2 b;
uniform float ONE;
varying vec4 vColor;

#pragma glslify: sum_fp64 = require(../../../shaderlib/fp64/sum-fp64, ONE=ONE)

void main(void) {

  gl_Position = vec4(positions, 1.0);
  vec2 result = sum_fp64(a, b);
  vColor = vec4(result.x, result.y, 0.0, 1.0);
}
