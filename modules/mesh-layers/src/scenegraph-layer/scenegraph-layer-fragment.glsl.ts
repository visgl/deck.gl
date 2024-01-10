export default `\
#version 300 es

#define SHADER_NAME scenegraph-layer-fragment-shader

// Uniforms
uniform float opacity;

// Varying
in vec4 vColor;

out vec4 fragColor;

// MODULE_PBR contains all the varying definitions needed
#ifndef MODULE_PBR
  #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
    in vec2 vTEXCOORD_0;
    uniform sampler2D u_BaseColorSampler;
  #endif
#endif

void main(void) {
  #ifdef MODULE_PBR
    fragColor = vColor * pbr_filterColor(vec4(0));
    geometry.uv = pbr_vUV;
  #else
    #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
      fragColor = vColor * texture(u_BaseColorSampler, vTEXCOORD_0);
      geometry.uv = vTEXCOORD_0;
    #else
      fragColor = vColor;
    #endif
  #endif

  fragColor.a *= opacity;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
