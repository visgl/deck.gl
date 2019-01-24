export default `
#define SHADER_NAME enhanced-hexagon-layer-vs

attribute vec3 positions;

attribute vec3 instancePositions;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Custom uniforms
uniform float opacity;
uniform vec3 invisibleColor;

// Result
varying vec4 vColor;

void main(void) {
  vec2 pos = project_position(instancePositions.xy + positions.xy);
  gl_Position = project_to_clipspace(vec4(pos, 0., 1.));

  // Hide hexagon if set to invisibleColor
  float alpha = instanceColors.rgb == invisibleColor ? 0. : opacity;
  // vColor: Either opacity-multiplied instance color, or picking color
  vColor = vec4(instanceColors.rgb / 255., alpha * instanceColors.a / 255.);

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(instancePickingColors);

}
`;
