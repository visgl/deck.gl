// Copyright (c) 2015 Uber Technologies, Inc.
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
#define SHADER_NAME wind-layer-fragment-shader

varying vec4 vPosition;
varying vec4 vNormal;
varying vec4 vColor;
varying float vAltitude;

void main(void) {
  if (vColor.a == 0.) {
    discard;
  }
  // TODO: this is not needed since we should remove vAltitude,
  // but commenting this out renders wind outside of us too. (check boundingBox prop.)
  // if (vAltitude < -90.) {
  //   discard;
  // }
  float lightWeight = getLightWeight(vPosition.xyz, vNormal.xzy);
  gl_FragColor = vec4(vColor.xyz * lightWeight, 1);
}
`;
