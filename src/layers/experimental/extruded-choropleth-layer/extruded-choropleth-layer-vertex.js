import mercatorProject from '../../shaderlib/mercator-project';

export default `
#define SHADER_NAME extruded-choropleth-layer-vertex-shader

uniform float mercatorScale;
${mercatorProject}

attribute vec3 positions;
attribute vec3 colors;
attribute vec3 pickingColors;

uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;

uniform float opacity;
uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

varying vec4 vColor;

vec4 getColor(
  vec4 color, float opacity, vec3 pickingColor, float renderPickingBuffer
) {
  vec4 color4 = vec4(color.rgb / 255., color.a / 255. * opacity);
  vec4 pickingColor4 = vec4(pickingColor / 255., 1.);
  return mix(color4, pickingColor4, renderPickingBuffer);
}

void main(void) {
  vec2 pos = mercatorProject(positions.xy, mercatorScale);
  vec3 p = vec3(pos, positions.z + 1.);
  gl_Position = projectionMatrix * worldMatrix * vec4(p, 1.);

  vec4 color = vec4(colors / 255., opacity);
  vec4 pickingColor = vec4(pickingColors / 255., 1.);
  vColor = mix(color, pickingColor, renderPickingBuffer);

  // float alpha = pickingColors == selectedPickingColor ? 0.5 : opacity;
  // vColor =
  // vec4(mix(colors / 255., pickingColors / 255., renderPickingBuffer), alpha);
}
`;
