export default `\
#ifdef HAS_UV
  varying vec2 vTEXCOORD_0;
  uniform sampler2D u_BaseColorSampler;
#endif
varying vec4 vColor;

void main(void) {
  #ifdef HAS_UV
    gl_FragColor = (vColor / 255.) * texture2D(u_BaseColorSampler, vTEXCOORD_0);
  #else
    gl_FragColor = vColor / 255.;
  #endif

  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
