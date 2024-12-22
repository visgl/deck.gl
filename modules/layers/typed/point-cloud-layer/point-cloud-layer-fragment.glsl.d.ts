declare const _default: '#define SHADER_NAME point-cloud-layer-fragment-shader\n\nprecision highp float;\n\nvarying vec4 vColor;\nvarying vec2 unitPosition;\n\nvoid main(void) {\n  geometry.uv = unitPosition;\n\n  float distToCenter = length(unitPosition);\n\n  if (distToCenter > 1.0) {\n    discard;\n  }\n\n  gl_FragColor = vColor;\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n';
export default _default;
// # sourceMappingURL=point-cloud-layer-fragment.glsl.d.ts.map
