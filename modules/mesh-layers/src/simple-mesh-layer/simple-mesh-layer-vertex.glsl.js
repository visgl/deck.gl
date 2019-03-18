export default `
#define SHADER_NAME simple-mesh-layer-vs

// Scale the model
uniform float sizeScale;

// Primitive attributes
attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;

// Instance attributes
attribute vec3 instancePositions;
attribute vec2 instancePositions64xy;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute mat3 instanceModelMatrix;

// Outputs to fragment shader
varying vec2 vTexCoord;
varying vec4 vColor;

void main(void) {
  vec3 pos = instanceModelMatrix * positions;
  pos = project_scale(pos * sizeScale);

  vec4 worldPosition;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xy, pos, worldPosition);

  // TODO - transform normals

  vTexCoord = texCoords;
  vColor = instanceColors;
  // vLightWeight = lighting_getLightWeight(worldPosition.xyz, project_normal(normals));

  picking_setPickingColor(instancePickingColors);
}
`;
