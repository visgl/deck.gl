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
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute vec4 instanceModelMatrixColumn1;
attribute vec4 instanceModelMatrixColumn2;
attribute vec4 instanceModelMatrixColumn3;
attribute vec4 instanceModelMatrixColumn4;

// Outputs to fragment shader
varying vec2 vTexCoord;
varying vec4 vColor;
varying float vLightWeight;

void main(void) {
  mat4 modelMat = mat4(
    instanceModelMatrixColumn1,
    instanceModelMatrixColumn2,
    instanceModelMatrixColumn3,
    instanceModelMatrixColumn4
  );

  vec3 pos = (modelMat * vec4(positions, 1.0)).xyz;
  pos = project_scale(pos * sizeScale);
  // TODO - backward compatibility, remove in next major release
  if (project_uPixelsPerMeter.y < 0.0) {
    pos.y = -pos.y;
  }

  vec4 worldPosition;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xy, pos, worldPosition);

  // TODO - transform normals

  picking_setPickingColor(instancePickingColors);

  vTexCoord = texCoords;
  vColor = instanceColors;
  vLightWeight = lighting_getLightWeight(worldPosition.xyz, project_normal(normals));
}
`;
