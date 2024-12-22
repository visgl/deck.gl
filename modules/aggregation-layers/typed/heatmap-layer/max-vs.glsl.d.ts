declare const _default: 'attribute vec4 inTexture;\nvarying vec4 outTexture;\n\nvoid main()\n{\noutTexture = inTexture;\ngl_Position = vec4(0, 0, 0, 1.);\n// Enforce default value for ANGLE issue (https://bugs.chromium.org/p/angleproject/issues/detail?id=3941)\ngl_PointSize = 1.0;\n}\n';
export default _default;
// # sourceMappingURL=max-vs.glsl.d.ts.map
