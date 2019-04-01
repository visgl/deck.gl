export default `\
// Instance attributes
attribute vec3 instancePositions;
attribute vec2 instancePositions64xy;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute mat3 instanceModelMatrix;
attribute vec3 instanceTranslation;

// Uniforms
uniform float sizeScale;

// Attributes
attribute vec4 POSITION;

#ifdef HAS_UV
  attribute vec2 TEXCOORD_0;
  varying vec2 vTEXCOORD_0;
#endif
varying vec4 vColor;

void main(void) {
  #ifdef HAS_UV
    vTEXCOORD_0 = TEXCOORD_0;
  #endif
  vColor = instanceColors;

  vec3 pos = (instanceModelMatrix * POSITION.xyz) * sizeScale + instanceTranslation;
  pos = project_size(pos);

  vec4 position_commonspace;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xy, pos, position_commonspace);
  picking_setPickingColor(instancePickingColors);
}
`;
