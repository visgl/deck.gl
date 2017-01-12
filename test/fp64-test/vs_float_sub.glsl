attribute vec3 positions;

uniform vec2 a;
uniform vec2 b;
varying vec4 vColor;

void main(void) {

  gl_Position = vec4(positions, 1.0);
  vec2 result = sub_fp64(a, b);
  vColor = vec4(result.x, result.y, 0.0, 1.0);
}
