declare const _default: '#define SHADER_NAME gpu-aggregation-to-grid-fs\n\nprecision highp float;\n\nvarying vec3 vWeights;\n\nvoid main(void) {\n  gl_FragColor = vec4(vWeights, 1.0);\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n';
export default _default;
// # sourceMappingURL=aggregate-to-grid-fs.glsl.d.ts.map
