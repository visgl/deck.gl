/* vertex shader for the scatterplot-layer */

attribute vec3 vertices;
attribute vec3 positions;
attribute vec3 colors;

uniform float radius;
uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;

varying vec3 vColor;

void main(void) {
  vColor = colors / 255.;

  vec3 p = positions + vertices * radius;
  gl_Position = projectionMatrix * worldMatrix * vec4(p, 1.0);
}
