/* fragment shader for the hexagon-layer */

attribute vec3 vertices;
attribute vec3 positions;
attribute vec3 colors;
attribute vec3 pickingColors;

uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;

uniform float radius;
uniform float opacity;
uniform float angle;

uniform float enablePicking;
uniform vec3 selected;
varying vec4 vColor;

void main(void) {
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec3 rotatedVertices = vec3(rotationMatrix * vertices.xy * radius, vertices.z);
  vec4 vPosition = worldMatrix * vec4(rotatedVertices, 1.0);
  gl_Position = projectionMatrix * vec4((vPosition.xyz + positions), vPosition.w);

  float alpha = opacity;
  if (pickingColors.x == selected.x &&
      pickingColors.y == selected.y &&
      pickingColors.z == selected.z) {
    alpha = 0.5;
  }

  vColor = vec4(mix(colors / 255., pickingColors / 255., enablePicking), alpha);
}
