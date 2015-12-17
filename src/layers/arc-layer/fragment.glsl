/* fragment shader for the arc-layer */

#ifdef GL_ES
precision highp float;
#endif

uniform vec3 color0;
uniform vec3 color1;
uniform float opacity;

varying float ratio;

void main(void) {
  gl_FragColor = vec4(mix(color0 / 255.0, color1 / 255.0, ratio), opacity);
}
