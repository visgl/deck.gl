export default `
#define SHADER_NAME enhanced-choropleth-layer-vertex-shader

attribute vec3 positions;
attribute vec3 colors;
attribute vec3 pickingColors;

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
  vec2 pos = preproject(positions.xy);
  gl_Position = project(vec4(pos, 0., 1.));

  vec4 color = vec4(colors / 255., opacity);
  vec4 pickingColor = vec4(pickingColors / 255., 1.);
  vColor = mix(color, pickingColor, renderPickingBuffer);
}
`;
