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

/* vertex shader for the grid-layer */

attribute vec3 vertices;
attribute vec3 positions;
attribute vec3 colors;
attribute vec3 pickingColors;

uniform float maxCount;
uniform float opacity;
uniform float enablePicking;
uniform vec3 scale;
uniform vec3 selected;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;

varying vec4 vColor;

void main(void) {
  float alpha = pickingColors == selected ? 0.3 : opacity;
  vColor = vec4(mix(colors / maxCount, pickingColors / 255., enablePicking), alpha);

  vec3 p = positions + vertices * scale;
  gl_Position = projectionMatrix * worldMatrix * vec4(p, 1.0);
}
