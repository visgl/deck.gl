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

#define SHADER_NAME choropleth-layer-vertex-shader

attribute vec3 positions;
attribute vec4 colors;
attribute vec3 pickingColors;

uniform float opacity;
uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

// PICKING
uniform float pickingEnabled;
varying vec4 vPickingColor;
void picking_setPickColor(vec3 pickingColor) {
  vPickingColor = vec4(pickingColor,  1.);
}
vec4 picking_setNormalAndPickColors(vec4 color, vec3 pickingColor) {
  vec4 pickingColor4 = vec4(pickingColor.rgb, 1.);
  vPickingColor = mix(color, pickingColor4, pickingEnabled);
  return vPickingColor;
}

// PICKING
// vec4 getColor(vec4 color, float opacity, vec3 pickingColor, float renderPickingBuffer) {
//   vec4 color4 = vec4(color.xyz / 255., color.w / 255. * opacity);
//   vec4 pickingColor4 = vec4(pickingColor / 255., 1.);
//   return mix(color4, pickingColor4, renderPickingBuffer);
// }

void main(void) {

  vec4 color = vec4(colors.rgb, colors.a * opacity) / 255.;

  picking_setNormalAndPickColors(
    color,
    pickingColors / 255.
  );

  vec3 p = project_position(positions);
  gl_Position = project_to_clipspace(vec4(p, 1.));
}
