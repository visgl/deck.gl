/* fragment shader for the scatterplot-layer */

#ifdef GL_ES
precision highp float;
#endif

varying vec3 vColor;
uniform float opacity;

void main(void) {
  gl_FragColor = vec4(vColor, opacity);
}
