export default `#version 300 es
#define SHADER_NAME simple-mesh-layer-vs

// Scale the model
uniform float sizeScale;
uniform bool composeModelMatrix;

// Primitive attributes
in vec3 positions;
in vec3 normals;
in vec3 colors;
in vec2 texCoords;

// Instance attributes
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceColors;
in vec3 instancePickingColors;
in mat3 instanceModelMatrix;
in vec3 instanceTranslation;

// Outputs to fragment shader
out vec2 vTexCoord;
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = texCoords;
  geometry.pickingColor = instancePickingColors;

  vTexCoord = texCoords;
  cameraPosition = project_uCameraPosition;
  vColor = vec4(colors * instanceColors.rgb, instanceColors.a);

  vec3 pos = (instanceModelMatrix * positions) * sizeScale + instanceTranslation;

  if (composeModelMatrix) {
    DECKGL_FILTER_SIZE(pos, geometry);
    // using instancePositions as world coordinates
    // when using globe mode, this branch does not re-orient the model to align with the surface of the earth
    // call project_normal before setting position to avoid rotation
    normals_commonspace = project_normal(instanceModelMatrix * normals);
    geometry.worldPosition += pos;
    gl_Position = project_position_to_clipspace(pos + instancePositions, instancePositions64Low, vec3(0.0), position_commonspace);
    geometry.position = position_commonspace;
  }
  else {
    pos = project_size(pos);
    DECKGL_FILTER_SIZE(pos, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, position_commonspace);
    geometry.position = position_commonspace;
    normals_commonspace = project_normal(instanceModelMatrix * normals);
  }

  geometry.normal = normals_commonspace;
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
