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
#define SHADER_NAME multi-icon-layer-fragment-shader

precision highp float;

uniform sampler2D iconsTexture;
uniform float buffer;
uniform bool sdf;
uniform float alphaCutoff;
uniform vec4 backgroundColor;

varying vec4 vColor;
varying vec2 vTextureCoords;
varying float vGamma;
varying vec2 uv;

void main(void) {
  geometry.uv = uv;

  float alpha = texture2D(iconsTexture, vTextureCoords).a;

  // if enable sdf (signed distance fields)
  if (sdf) {
    alpha = smoothstep(buffer - vGamma, buffer + vGamma, alpha);
  }

  // Take the global opacity and the alpha from vColor into account for the alpha component
  float a = alpha * vColor.a;
  
  if (a < alphaCutoff) {
    if (backgroundColor.a < 0.001) {
      discard;
    } else {
      gl_FragColor = vec4(backgroundColor.rgb, backgroundColor.a * vColor.a);
      return;
    }
  }

  if (backgroundColor.a < 0.001) {
    gl_FragColor = vec4(vColor.rgb, a);
  } else {
    gl_FragColor = vec4(mix(backgroundColor.rgb, vColor.rgb, alpha), backgroundColor.a * vColor.a);
  }

  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
