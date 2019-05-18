export default `\
#if (__VERSION__ < 300)
  #define _varying varying
  #define fragmentColor gl_FragColor
  #define _texture2D texture2D 
#else
  #define _varying in
  out vec4 fragmentColor;
  #define _texture2D texture
#endif

// Uniforms
uniform vec3 project_uCameraPosition;

// Varying
// MODULE_PBR contains all the varying definitions needed
#ifndef MODULE_PBR
  _varying vec4 vColor;

  #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
    _varying vec2 vTEXCOORD_0;
    uniform sampler2D u_BaseColorSampler;
  #endif

  #if defined(HAS_NORMALS) && defined(MODULE_PHONG)
    _varying vec3 vNormal;
    _varying vec3 vPosition;
  #endif
#endif

void main(void) {
  #ifdef MODULE_PBR
    fragmentColor = pbr_filterColor(vec4(0));
  #else
    #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
      fragmentColor = vColor * _texture2D(u_BaseColorSampler, vTEXCOORD_0);
    #else
      fragmentColor = vColor;
    #endif

    #if defined(HAS_NORMALS) && defined(MODULE_PHONG)
      vec3 lightColor = lighting_getLightColor(fragmentColor.rgb * 255., project_uCameraPosition, vPosition, vNormal);
      fragmentColor = vec4(lightColor / 255., fragmentColor.a);
    #endif
  #endif

  fragmentColor = picking_filterPickingColor(fragmentColor);
}
`;
