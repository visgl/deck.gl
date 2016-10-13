export default `
// See: npm glsl-shader-name
#define SHADER_NAME enhanced-hexagon-layer-fs

#ifdef GL_ES
precision highp float;
#endif

varying vec4 vColor;

void main(void) {
  gl_FragColor = vColor;
}
`;
