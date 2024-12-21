declare const _default: 'varying vec4 weightsTexture;\n// Epanechnikov function, keeping for reference\n// float epanechnikovKDE(float u) {\n//   return 0.75 * (1.0 - u * u);\n// }\nfloat gaussianKDE(float u){\n  return pow(2.71828, -u*u/0.05555)/(1.77245385*0.166666);\n}\nvoid main()\n{\n  float dist = length(gl_PointCoord - vec2(0.5, 0.5));\n  if (dist > 0.5) {\n    discard;\n  }\n  gl_FragColor = weightsTexture * gaussianKDE(2. * dist);\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n';
export default _default;
// # sourceMappingURL=weights-fs.glsl.d.ts.map
