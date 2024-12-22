declare const _default: '#define SHADER_NAME line-layer-fragment-shader\n\nprecision highp float;\n\nvarying vec4 vColor;\nvarying vec2 uv;\n\nvoid main(void) {\n  geometry.uv = uv;\n\n  gl_FragColor = vColor;\n\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n';
export default _default;
// # sourceMappingURL=line-layer-fragment.glsl.d.ts.map
