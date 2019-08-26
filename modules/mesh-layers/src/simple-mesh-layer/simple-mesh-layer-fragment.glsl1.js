export default `
#define SHADER_NAME simple-mesh-layer-fs

// Note(Tarek): headless-gl supports derivatives, but doesn't report it via getExtension. Awesome!
#ifdef DERIVATIVES
#define FLAT_SHADE_NORMAL normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)))
#else
#define FLAT_SHADE_NORMAL vec3(0.0, 0.0, 1.0)
#endif

precision highp float;

uniform bool hasTexture;
uniform sampler2D sampler;
uniform bool flatShading;
uniform float opacity;

varying vec2 vTexCoord;
varying vec3 cameraPosition;
varying vec3 normals_commonspace;
varying vec4 position_commonspace;
varying vec4 vColor;

void main(void) {
  geometry.uv = vTexCoord;

  vec3 normal;
  if (flatShading) {
    normal = FLAT_SHADE_NORMAL;
  } else {
    normal = normals_commonspace;
  }

  vec4 color = hasTexture ? texture2D(sampler, vTexCoord) : vColor;
  vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
  gl_FragColor = vec4(lightColor, color.a * opacity);

  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
