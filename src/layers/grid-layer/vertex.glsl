/* vertex shader for the grid-layer */

attribute vec3 vertices;
attribute vec3 positions;
attribute vec3 colors;
attribute vec3 pickingColors;

uniform float scale;
uniform float radius;
uniform float opacity;
uniform float enablePicking;
uniform vec3 selected;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;

varying vec4 vColor;

void main(void) {
  vColor = vec4(mix(colors / scale, pickingColors / 255., enablePicking), opacity);

  if (pickingColors.x == selected.x &&
      pickingColors.y == selected.y &&
      pickingColors.z == selected.z) {
    vColor = vec4(
      vColor.rgb * mix(vec3(3.0), vec3(1.0), enablePicking),
      vColor.a * mix(0.5, 1.0, enablePicking)
    );
  }

  vec3 p = positions + vertices * radius;
  gl_Position = projectionMatrix * worldMatrix * vec4(p, 1.0);
}
