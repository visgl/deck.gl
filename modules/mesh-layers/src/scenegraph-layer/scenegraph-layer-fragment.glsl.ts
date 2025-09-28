// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es

#define SHADER_NAME scenegraph-layer-fragment-shader

// Varying
in vec4 vColor;

out vec4 fragColor;

// pbrMaterial contains all the varying definitions needed
#ifndef LIGHTING_PBR
  #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
    in vec2 vTEXCOORD_0;
    uniform sampler2D pbr_baseColorSampler;
  #endif
#endif

void main(void) {
  #ifdef LIGHTING_PBR
    fragColor = vColor * pbr_filterColor(vec4(0));
    geometry.uv = pbr_vUV;
  #else
    #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
      fragColor = vColor * texture(pbr_baseColorSampler, vTEXCOORD_0);
      geometry.uv = vTEXCOORD_0;
    #else
      fragColor = vColor;
    #endif
  #endif

  fragColor.a *= layer.opacity;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
