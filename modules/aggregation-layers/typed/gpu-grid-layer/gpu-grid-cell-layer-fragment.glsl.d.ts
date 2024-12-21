declare const _default: '#version 300 es\n#define SHADER_NAME gpu-grid-cell-layer-fragment-shader\n\nprecision highp float;\n\nin vec4 vColor;\n\nout vec4 fragColor;\n\nvoid main(void) {\n  fragColor = vColor;\n  fragColor = picking_filterColor(fragColor);\n}\n';
export default _default;
// # sourceMappingURL=gpu-grid-cell-layer-fragment.glsl.d.ts.map
