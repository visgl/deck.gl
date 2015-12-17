/* vertex shader for the choropleth-layer */

attribute vec3 vertices;
attribute vec3 colors;
attribute vec3 pickingColors;

uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;

uniform float opacity;
uniform float enablePicking;
uniform vec3 selected;

varying vec4 vColor;

void main(void) {
  vec3 color = mix(colors / 255.0, pickingColors / 255.0, enablePicking);
  float alpha = opacity;

  if (pickingColors.x == selected.x &&
      pickingColors.y == selected.y &&
      pickingColors.z == selected.z) {
    alpha = 0.2;
  }

  gl_Position = projectionMatrix * worldMatrix * vec4(vertices, 1.0);
  vColor = vec4(color, alpha);
}
