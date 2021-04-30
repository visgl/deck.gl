export default `#version 300 es
#define SHADER_NAME simple-mesh-layer-vs

// Scale the model
uniform float sizeScale;
uniform bool composeModelMatrix;
uniform bool u_pickSegmentation;

// Primitive attributes
in vec3 positions;
in vec3 normals;
in vec3 colors;
in vec2 texCoords;
in vec4 uvRegions;
in vec3 segmentationPickingColors;

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
  #ifdef HAS_UV_REGION
    vec2 uv = fract(texCoords) * (uvRegions.zw - uvRegions.xy) + uvRegions.xy;
  #else
    vec2 uv = texCoords;
  #endif

  geometry.worldPosition = instancePositions;
  geometry.uv = uv;

  if (u_pickSegmentation) {
    geometry.pickingColor = segmentationPickingColors;
  } else {
    geometry.pickingColor = instancePickingColors;
  }

  #ifdef MODULE_PBR
    // set PBR data
    #ifdef HAS_NORMALS
      pbr_vNormal = project_normal(instanceModelMatrix * normals);
      geometry.normal = pbr_vNormal;
    #endif

    #ifdef HAS_UV
      pbr_vUV = uv;
    #else
      pbr_vUV = vec2(0., 0.);
    #endif
    geometry.uv = pbr_vUV;
  #endif

  vTexCoord = uv;
  cameraPosition = project_uCameraPosition;
  normals_commonspace = project_normal(instanceModelMatrix * normals);
  vColor = vec4(colors * instanceColors.rgb, instanceColors.a);
  geometry.normal = normals_commonspace;

  vec3 pos = (instanceModelMatrix * positions) * sizeScale + instanceTranslation;

  if (composeModelMatrix) {
    DECKGL_FILTER_SIZE(pos, geometry);
    gl_Position = project_position_to_clipspace(pos + instancePositions, instancePositions64Low, vec3(0.0), position_commonspace);
  }
  else {
    pos = project_size(pos);
    DECKGL_FILTER_SIZE(pos, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, position_commonspace);
  }

  geometry.position = position_commonspace;

  #ifdef MODULE_PBR
    // set PBR data
    pbr_vPosition = geometry.position.xyz;
  #endif

  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
