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
#define SHADER_NAME icon-layer-vertex-shader

attribute vec2 positions;

attribute vec3 instancePositions;
attribute float instanceSizes;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute vec4 instanceIconFrames;
attribute float instanceColorModes;
attribute vec2 instanceOffsets;

uniform vec2 sizeScale;

uniform float renderPickingBuffer;
uniform vec2 iconsTextureDim;

varying float vColorMode;
varying vec4 vColor;
varying vec2 vTextureCoords;

void main(void) {
  vec3 center = project_position(instancePositions);
  vec2 vertex = (positions + instanceOffsets * 2.0) * sizeScale * instanceSizes;
  gl_Position = project_to_clipspace(vec4(center, 1.0)) + vec4(vertex, 0.0, 0.0);

  vTextureCoords = mix(
    instanceIconFrames.xy,
    instanceIconFrames.xy + instanceIconFrames.zw,
    (positions.xy + 1.0) / 2.0
  ) / iconsTextureDim;

  vTextureCoords.y = 1.0 - vTextureCoords.y;

  vec4 color = instanceColors / 255.;
  vec4 pickingColor = vec4(instancePickingColors / 255., 1.);
  vColor = mix(color, pickingColor, renderPickingBuffer);

  vColorMode = instanceColorModes;
}
