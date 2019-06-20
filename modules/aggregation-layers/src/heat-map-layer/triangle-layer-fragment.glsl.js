// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export default `\
#define SHADER_NAME heat-map-layer-fragment-shader

precision highp float;
#define EPSILON 0. // 0.00001
#define RANGE_COUNT 6

uniform sampler2D texture;
uniform bool hasTexture;
varying vec2 vTexCoords;
uniform vec4 colorRange[RANGE_COUNT];
uniform vec4 maxValues;


vec4 quantizeScale(vec2 domain, vec4 range[RANGE_COUNT], float value) {
  vec4 outColor = vec4(0., 0., 0., 0.);
  if (value >= (domain.x - EPSILON) && value <= (domain.y + EPSILON)) {
  // if (value >= (domain.x - EPSILON)) {
    // value = clamp(value, domain.x, domain.y);
    float domainRange = domain.y - domain.x;
    if (domainRange <= 0.) {
      outColor = vec4(1, 0, 0, 1); // range[0];
    } else {
      float rangeCount = float(RANGE_COUNT);
      float rangeStep = domainRange / rangeCount;
      float idx = floor((value - domain.x) / rangeStep);
      idx = clamp(idx, 0., rangeCount - 1.);
      int intIdx = int(idx);
      if (intIdx == 0) {
        outColor = range[0];
      } else if (intIdx == 1) {
        outColor = range[1];
      } else if (intIdx == 2) {
        outColor = range[2];
      } else if (intIdx == 3) {
        outColor = range[3];
      } else if (intIdx == 4) {
        outColor = range[4];
      } else if (intIdx == 5) {
        outColor = range[5];
      } else {
        outColor = vec4(0, 0, 0, 1);
      }
      // outColor = range[intIdx];
    }
  }
  return outColor;
}

void main(void) {
  vec4 weight = texture2D(texture, vTexCoords);
  vec4 color = quantizeScale(vec2(1, maxValues[0]), colorRange, weight.r);
  gl_FragColor = hasTexture ? color / 255. : vec4(1., 0., 0, 1.);

  // gl_FragColor = texture2D(heatTexture, vTexCoords); // / 20.;
  // gl_FragColor = vec4(vTexCoords, 0, 1.);
  // gl_FragColor = vec4(1., 0., 0, 1.);
  // gl_FragColor = weight;
  // gl_FragColor.a = 1.;
}
`;
