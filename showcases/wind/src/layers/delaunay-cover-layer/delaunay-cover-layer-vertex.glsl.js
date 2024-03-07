// Copyright (c) 2017 Uber Technologies, Inc.
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
#define SHADER_NAME delaunay-cover-vertex-shader
#define HEIGHT_FACTOR 25.

uniform vec2 bounds;

attribute vec3 positions;
attribute vec3 next;
attribute vec3 next2;

varying vec4 vPosition;
varying vec4 vNormal;
varying vec4 vColor;

vec4 getWorldSpacePos(vec3 positions) {
  vec2 pos = project_position(positions.xy);
  float elevation = project_scale(positions.z * 100.);
  vec3 extrudedPosition = vec3(pos.xy, elevation + 1.0);
  vec4 position_worldspace = vec4(extrudedPosition, 1.0);
  return position_worldspace;
}

void main(void) {
  vec4 position_worldspace = getWorldSpacePos(positions);
  gl_Position = project_to_clipspace(position_worldspace);

  vec4 pos2 = getWorldSpacePos(next);
  vec4 pos3 = getWorldSpacePos(next2);

  vec4 a = pos2 - position_worldspace;
  vec4 b = pos3 - position_worldspace;
  vec3 normal = normalize(cross(a.xyz, b.xyz));

  vPosition = position_worldspace;
  vNormal = vec4(normal, 1);
  // vColor = vec4(1, 0.25, 0.4, (positions.z - bounds.x) / (bounds.y - bounds.x));
  vColor = vec4(15./70., 26./70., 36./70., (positions.z - bounds.x) / (bounds.y - bounds.x));
}
`;
