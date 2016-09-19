export default `
/* fragment shader for the point-cloud-layer */
#define SHADER_NAME point-cloud-layer-fs

#ifdef GL_ES
precision highp float;
#endif

varying vec4 vColor;
varying vec2 uv;

void main(void) {
  // float distanceToCenter = length(uv);
  // float alpha = distanceToCenter > 1.0 ? 0.0 : 1.0;

  gl_FragColor = vec4(vColor.rgb, vColor.a);
}
`;
