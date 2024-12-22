declare const _default: 'varying vec4 outTexture;\nvoid main() {\n  gl_FragColor = outTexture;\n  gl_FragColor.g = outTexture.r / max(1.0, outTexture.a);\n}\n';
export default _default;
// # sourceMappingURL=max-fs.glsl.d.ts.map
