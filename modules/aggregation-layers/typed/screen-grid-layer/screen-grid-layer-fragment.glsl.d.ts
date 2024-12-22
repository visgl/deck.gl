declare const _default: '#define SHADER_NAME screen-grid-layer-fragment-shader\n\nprecision highp float;\n\nvarying vec4 vColor;\nvarying float vSampleCount;\n\nvoid main(void) {\n  if (vSampleCount <= 0.0) {\n    discard;\n  }\n  gl_FragColor = vColor;\n\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n';
export default _default;
// # sourceMappingURL=screen-grid-layer-fragment.glsl.d.ts.map
