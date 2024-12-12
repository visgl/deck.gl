// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `#version 300 es
#define SHADER_NAME simple-mesh-layer-fs

precision highp float;

uniform sampler2D sampler;

in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;

out vec4 fragColor;

void main(void) {
  
#ifdef MODULE_PBRMATERIAL

  fragColor = vColor * pbr_filterColor(vec4(0));
  geometry.uv = pbr_vUV;
  fragColor.a *= layer.opacity;

#else

  geometry.uv = vTexCoord;

  vec3 normal;
  if (simpleMesh.flatShading) {

  normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
  } else {
    normal = normals_commonspace;
  }

  vec4 color = simpleMesh.hasTexture ? texture(sampler, vTexCoord) : vColor;
  vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
  fragColor = vec4(lightColor, color.a * layer.opacity);

#endif

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
