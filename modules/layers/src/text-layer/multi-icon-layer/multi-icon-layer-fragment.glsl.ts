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

uniform float opacity;
uniform sampler2D iconsTexture;
uniform float gamma;
uniform bool sdf;
uniform float alphaCutoff;
uniform float sdfBuffer;
uniform float outlineBuffer;
uniform vec4 outlineColor;

varying vec4 vColor;
varying vec2 vTextureCoords;
varying vec2 uv;

void main(void) {
  geometry.uv = uv;

  if (!picking_uActive) {
    float alpha = texture2D(iconsTexture, vTextureCoords).a;
    vec4 color = vColor;

    // if enable sdf (signed distance fields)
    if (sdf) {
      float distance = alpha;
      alpha = smoothstep(sdfBuffer - gamma, sdfBuffer + gamma, distance);

      if (outlineBuffer > 0.0) {
        float inFill = alpha;
        float inBorder = smoothstep(outlineBuffer - gamma, outlineBuffer + gamma, distance);
        color = mix(outlineColor, vColor, inFill);
        alpha = inBorder;
      }
    }

    // Take the global opacity and the alpha from color into account for the alpha component
    float a = alpha * color.a;
    
    if (a < alphaCutoff) {
      discard;
    }

    gl_FragColor = vec4(color.rgb, a * opacity);
  }

  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
