declare const _default: '#define SHADER_NAME triangle-layer-fragment-shader\n\nprecision highp float;\n\nuniform float opacity;\nuniform sampler2D texture;\nuniform sampler2D colorTexture;\nuniform float aggregationMode;\n\nvarying vec2 vTexCoords;\nvarying float vIntensityMin;\nvarying float vIntensityMax;\n\nvec4 getLinearColor(float value) {\n  float factor = clamp(value * vIntensityMax, 0., 1.);\n  vec4 color = texture2D(colorTexture, vec2(factor, 0.5));\n  color.a *= min(value * vIntensityMin, 1.0);\n  return color;\n}\n\nvoid main(void) {\n  vec4 weights = texture2D(texture, vTexCoords);\n  float weight = weights.r;\n\n  if (aggregationMode > 0.5) {\n    weight /= max(1.0, weights.a);\n  }\n\n  // discard pixels with 0 weight.\n  if (weight <= 0.) {\n     discard;\n  }\n\n  vec4 linearColor = getLinearColor(weight);\n  linearColor.a *= opacity;\n  gl_FragColor =linearColor;\n}\n';
export default _default;
// # sourceMappingURL=triangle-layer-fragment.glsl.d.ts.map