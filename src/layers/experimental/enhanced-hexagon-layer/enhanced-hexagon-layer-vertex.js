import mercatorProject from '../../shaderlib/mercator-project';

export default `
#define SHADER_NAME enhanced-hexagon-layer-vs

${mercatorProject}

// Standard matrix uniforms
uniform mat4 projectionMatrix;

attribute vec3 positions;

attribute vec3 instancePositions;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Picking uniforms
// Set to 1.0 if rendering picking buffer, 0.0 if rendering for display
uniform float renderPickingBuffer;

// Custom uniforms
uniform float opacity;
uniform vec3 invisibleColor;

// Result
varying vec4 vColor;

void main(void) {
  vec2 mercatorPos =
  	mercatorProject(instancePositions.xy + positions.xy, mercatorScale);
  gl_Position = projectionMatrix * vec4(mercatorPos.xy, 1., 1.);

  // Hide hexagon if set to invisibleColor
  float alpha = instanceColors.rgb == invisibleColor ? 0. : opacity;

  // Color: Either opacity-multiplied instance color, or picking color
  vec4 color = vec4(instanceColors.rgb / 255., alpha * instanceColors.a / 255.);
  // vec4 pickingColor = vec4(instancePickingColors / 255., 1.);
  vec4 pickingColor = vec4(1., 1., 1., 1.);
  vColor = mix(color, pickingColor, renderPickingBuffer);
}
`;
