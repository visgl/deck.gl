export default `\
varying vec4 weightsTexture;
// Epanechnikov function, keeping for reference
// float epanechnikovKDE(float u) {
//   return 0.75 * (1.0 - u * u);
// }
float gaussianKDE(float u){
  return pow(2.71828, -u*u/0.05555)/(1.77245385*0.166666);
}
void main()
{
  float dist = length(gl_PointCoord - vec2(0.5, 0.5));
  if (dist > 0.5) {
    discard;
  }
  gl_FragColor.rgb = weightsTexture.rgb * gaussianKDE(2. * dist);
  gl_FragColor.a = 1.0;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
