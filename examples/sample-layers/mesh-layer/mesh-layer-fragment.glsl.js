export default `
#define SHADER_NAME mesh-layer-fs

#ifdef GL_ES
precision highp float;
#endif

// uniform bool hasTexture1;
uniform sampler2D sampler1;
varying vec2 vTexCoord;

varying vec3 vColor;
uniform float opacity;

void main(void) {
  gl_FragColor = texture2D(sampler1, vTexCoord);
  // gl_FragColor = vec4(texture2D(sampler1, vec2(vTexCoord.s, vTexCoord.t)).xyz, 1.0);
  // gl_FragColor = vec4(1., 0., 0., 1.);
}
`;
