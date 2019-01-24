export default `
#define SHADER_NAME extruded-choropleth-layer-vertex-shader

attribute vec3 positions;
attribute vec3 colors;
attribute vec3 pickingColors;

uniform float opacity;

varying vec4 vColor;

void main(void) {
  vec2 pos = project_position(positions.xy);
  gl_Position = project_to_clipspace(vec4(pos, positions.z, 1.));

  vColor = vec4(colors / 255., opacity);

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(pickingColors);
}
`;
