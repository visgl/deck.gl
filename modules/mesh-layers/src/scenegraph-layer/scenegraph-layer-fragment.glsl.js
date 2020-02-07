export default `\
#version 300 es

// Uniforms
uniform float opacity;

// Varying
in vec4 vColor;

out vec4 fragmentColor;

// MODULE_PBR contains all the varying definitions needed
#ifndef MODULE_PBR
  #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
    in vec2 vTEXCOORD_0;
    uniform sampler2D u_BaseColorSampler;
  #endif
#endif

void main(void) {
  #ifdef MODULE_PBR
    fragmentColor = vColor * pbr_filterColor(vec4(0));
    geometry.uv = pbr_vUV;
  #else
    #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
      fragmentColor = vColor * texture2D(u_BaseColorSampler, vTEXCOORD_0);
      geometry.uv = vTEXCOORD_0;
    #else
      fragmentColor = vColor;
    #endif
  #endif

  fragmentColor.a *= opacity;
  DECKGL_FILTER_COLOR(fragmentColor, geometry);
}
`;
