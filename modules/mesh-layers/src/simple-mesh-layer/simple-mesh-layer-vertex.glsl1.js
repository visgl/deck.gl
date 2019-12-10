export default `
#define SHADER_NAME simple-mesh-layer-vs

// Scale the model
uniform float sizeScale;
uniform bool composeModelMatrix;

// Primitive attributes
attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;

// Instance attributes
attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute mat3 instanceModelMatrix;
attribute vec3 instanceTranslation;

// Outputs to fragment shader
varying vec2 vTexCoord;
varying vec3 cameraPosition;
varying vec3 normals_commonspace;
varying vec4 position_commonspace;
varying vec4 vColor;

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = texCoords;
  geometry.pickingColor = instancePickingColors;

  vTexCoord = texCoords;
  cameraPosition = project_uCameraPosition;
  normals_commonspace = project_normal(instanceModelMatrix * normals);
  vColor = instanceColors;
  geometry.normal = normals_commonspace;

  vec3 pos = (instanceModelMatrix * positions) * sizeScale + instanceTranslation;
  
  if (composeModelMatrix) {
    DECKGL_FILTER_SIZE(pos, geometry);
    gl_Position = project_position_to_clipspace(pos + instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
  }
  else {
    pos = project_size(pos);
    DECKGL_FILTER_SIZE(pos, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, geometry.position);
  }

  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
