export default `
#define SHADER_NAME point-cloud-layer-vs

attribute vec3 pointPositions;
attribute vec3 pointColors;
attribute vec3 instancePickingColors;

uniform vec2 radius;
uniform float opacity;
uniform float pointSize;

varying vec4 vColor;
varying vec2 uv;
uniform float renderPickingBuffer;

void main(void) {
  vec4 color = vec4(pointColors / 255.0, 1.);
  vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.);
  vColor = mix(color, pickingColor, renderPickingBuffer);

  vec3 pos = preproject(pointPositions);
  gl_Position = project(vec4(pos, 1.0)) +
  	vec4(uv * radius, 0.0, 0.0);
  gl_PointSize = pointSize;
}
`;
