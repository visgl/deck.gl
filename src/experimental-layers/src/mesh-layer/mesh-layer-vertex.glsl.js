export default `
#define SHADER_NAME mesh-layer-vs

// Scale the model
uniform float sizeScale;

// Primitive attributes
attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;

// Instance attributes
attribute vec3 instancePositions;
attribute vec2 instancePositions64xy;
attribute float instanceAngles;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Outputs to fragment shader
varying vec2 vTexCoord;
varying vec4 vColor;
varying float vLightWeight;

void main(void) {
  vec3 instancePos = project_position(instancePositions);

  float angle = instanceAngles;
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

  vec3 pos = positions;
  pos = project_scale(pos * sizeScale);
  pos = vec3(rotationMatrix * pos.xy, pos.z);
  vec4 worldPosition;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xy, pos, worldPosition);

  // TODO - transform normals

  picking_setPickingColor(instancePickingColors);

  vTexCoord = texCoords;
  vColor = instanceColors;
  vLightWeight = lighting_getLightWeight(worldPosition.xyz, project_normal(normals));
}
`;
