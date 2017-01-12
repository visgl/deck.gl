attribute vec3 positions;

uniform vec2 a;
varying vec4 vColor;

void main(void) {
  gl_Position = vec4(positions, 1.0);
  vec2 result = sin_fp64(a);
  vColor = vec4(result.x, result.y, 0.0, 1.0);
}
