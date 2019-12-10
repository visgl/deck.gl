export default `\
#if (__VERSION__ < 300)
  #define _attribute attribute
  #define _varying varying
#else
  #define _attribute in
#define _varying out
#endif

// Instance attributes
_attribute vec3 instancePositions;
_attribute vec3 instancePositions64Low;
_attribute vec4 instanceColors;
_attribute vec3 instancePickingColors;
_attribute mat3 instanceModelMatrix;
_attribute vec3 instanceTranslation;

// Uniforms
uniform float sizeScale;
uniform float sizeMinPixels;
uniform float sizeMaxPixels;
uniform mat4 sceneModelMatrix;
uniform bool composeModelMatrix;

// Attributes
_attribute vec4 POSITION;

#ifdef HAS_UV
  _attribute vec2 TEXCOORD_0;
#endif

#ifdef MODULE_PBR
  #ifdef HAS_NORMALS
    _attribute vec4 NORMAL;
  #endif
#endif

// Varying
_varying vec4 vColor;

// MODULE_PBR contains all the varying definitions needed
#ifndef MODULE_PBR
  #ifdef HAS_UV
    _varying vec2 vTEXCOORD_0;
  #endif
#endif

// Main
void main(void) {
  #if defined(HAS_UV) && !defined(MODULE_PBR)
    vTEXCOORD_0 = TEXCOORD_0;
    geometry.uv = vTEXCOORD_0;
  #endif

  geometry.worldPosition = instancePositions;
  geometry.pickingColor = instancePickingColors;

  #ifdef MODULE_PBR
    // set PBR data
    #ifdef HAS_NORMALS
      pbr_vNormal = project_normal(instanceModelMatrix * (sceneModelMatrix * vec4(NORMAL.xyz, 0.0)).xyz);
      geometry.normal = pbr_vNormal;
    #endif

    #ifdef HAS_UV
      pbr_vUV = TEXCOORD_0;
    #else
      pbr_vUV = vec2(0., 0.);
    #endif    
    geometry.uv = pbr_vUV;
  #endif

  float originalSize = project_size_to_pixel(sizeScale);
  float clampedSize = clamp(originalSize, sizeMinPixels, sizeMaxPixels);

  vec3 pos = (instanceModelMatrix * (sceneModelMatrix * POSITION).xyz) * sizeScale * (clampedSize / originalSize) + instanceTranslation;
  if(composeModelMatrix) {
    DECKGL_FILTER_SIZE(pos, geometry);
    gl_Position = project_position_to_clipspace(pos + instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
  }
  else {
    pos = project_size(pos);
    DECKGL_FILTER_SIZE(pos, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, geometry.position);
  }
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  #ifdef MODULE_PBR
    // set PBR data
    pbr_vPosition = geometry.position.xyz;
  #endif

  vColor = instanceColors;
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
