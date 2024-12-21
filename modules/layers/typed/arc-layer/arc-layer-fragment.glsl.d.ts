declare const _default: '#define SHADER_NAME arc-layer-fragment-shader\n\nprecision highp float;\n\nvarying vec4 vColor;\nvarying vec2 uv;\nvarying float isValid;\n\nvoid main(void) {\n  if (isValid == 0.0) {\n    discard;\n  }\n\n  gl_FragColor = vColor;\n  geometry.uv = uv;\n\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n';
export default _default;
// # sourceMappingURL=arc-layer-fragment.glsl.d.ts.map
