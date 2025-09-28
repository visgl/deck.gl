// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
in vec4 weightsTexture;
out vec4 fragColor;
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
  fragColor = weightsTexture * gaussianKDE(2. * dist);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
