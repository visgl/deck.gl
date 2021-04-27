export default `#version 300 es
#define SHADER_NAME simple-mesh-layer-fs

precision highp float;

uniform bool hasTexture;
uniform sampler2D sampler;
uniform bool flatShading;
uniform float opacity;

in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;

out vec4 fragColor;

void main(void) {
  
#ifdef MODULE_PBR

  fragColor = vColor * pbr_filterColor(vec4(0));
  geometry.uv = pbr_vUV;
  fragColor.a *= opacity;

#else

  geometry.uv = vTexCoord;

  vec3 normal;
  if (flatShading) {

// NOTE(Tarek): This is necessary because
// headless.gl reports the extension as
// available but does not support it in
// the shader.
#ifdef DERIVATIVES_AVAILABLE
    normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
#else
    normal = vec3(0.0, 0.0, 1.0);
#endif
  } else {
    normal = normals_commonspace;
  }

  vec4 color = texture(sampler, vTexCoord) * vColor;
  vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
  fragColor = vec4(lightColor, color.a * opacity);

#endif

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
