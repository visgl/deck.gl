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

/* vertex shader for the arc-layer */

#define N 49.0

attribute vec3 vertices;
attribute vec4 positions;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;

varying float ratio;

float paraboloid(float index, float delta, vec2 from, vec2 to) {
  delta /= N;
  vec2 a = mix(from, to, 0.5);
  float b = (from.x - a.x) * (from.x - a.x) + (from.y - a.y) * (from.y - a.y);
  vec2 x = mix(from, to, delta);
  return (-((x.x - a.x) * (x.x - a.x) + (x.y - a.y) * (x.y - a.y)) + b);
}

void main(void) {
  float index = vertices.x;

  // non-timeline, delta === 0.5
  float delta = index;

  // dist between [x0, y0] and [x1, y1]
  float dist = distance(positions.xy, positions.zw);

  vec3 p = vec3(0);
  // linear interpolate [x, y]
  p.xy = mix(positions.xy, positions.zw, delta / N);
  // paraboloid interpolate [x, y]
  p.z = sqrt(paraboloid(index, delta, positions.xy, positions.zw));

  ratio = clamp(dist / 1000., 0., 1.);

  gl_Position = projectionMatrix * worldMatrix * vec4(p, 1.0);
}
