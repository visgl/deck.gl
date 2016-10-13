import project from '../../shaderlib/project';

export default `
#define SHADER_NAME point-cloud-layer-vs

${project}

uniform float pixelPerMeter;

attribute vec3 pointPositions;
attribute vec3 pointColors;
attribute vec3 instancePickingColors;

uniform vec2 radius;
uniform float opacity;
uniform float pointSize;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;

varying vec4 vColor;
varying vec2 uv;
uniform float renderPickingBuffer;

void main(void) {
  vec4 color = vec4(pointColors / 255.0, 1.);
  vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.);
  vColor = mix(color, pickingColor, renderPickingBuffer);

  vec2 pos = mercatorProject(pointPositions.xy, mercatorScale);
  // For some reason, need to add one to elevation to show up in untilted mode
  gl_Position = projectionMatrix *
  	vec4(pos, pointPositions.z * pixelPerMeter, 1.0) +
  	vec4(uv * radius, 0.0, 0.0);
  gl_PointSize = pointSize;
}
`;
