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

/* vertex shader for the choropleth-layer */
#define SHADER_NAME choropleth-layer-vertex-shader

#pragma glslify: mercatorProject = require(../../../shaderlib/mercator-project)
uniform float mercatorScale;

attribute vec3 positions;
attribute vec3 colors;
attribute vec3 pickingColors;

uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;

uniform float opacity;
uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

varying vec4 vColor;

vec4 getColor(vec4 color, float opacity, vec3 pickingColor, float renderPickingBuffer) {
  vec4 color4 = vec4(color.xyz / 255., color.w / 255. * opacity);
  vec4 pickingColor4 = vec4(pickingColor / 255., 1.);
  return mix(color4, pickingColor4, renderPickingBuffer);
}

void main(void) {
  vec2 pos = mercatorProject(positions.xy, mercatorScale);
  // For some reason, need to add one to elevation to show up in untilted mode
  vec3 p = vec3(pos.xy, positions.z + 1.);
  gl_Position = projectionMatrix * vec4(p, 1.);

  vec4 color = vec4(colors / 255., opacity);
  vec4 pickingColor = vec4(pickingColors / 255., 1.);
  vColor = mix(color, pickingColor, renderPickingBuffer);

  // float alpha = pickingColors == selectedPickingColor ? 0.5 : opacity;
  // vColor = vec4(mix(colors / 255., pickingColors / 255., renderPickingBuffer), alpha);
}
