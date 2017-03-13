// Copyright (c) 2016 Uber Technologies, Inc.
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
#define SHADER_NAME polygon-layer-vertex-shader

attribute vec3 positions;
attribute vec3 normals;
attribute vec4 colors;
attribute vec3 pickingColors;

uniform float extruded;
uniform float opacity;

uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

// PICKING
uniform float pickingEnabled;
varying vec4 vPickingColor;

void main(void) {
  vec4 position_worldspace = vec4(project_position(positions), 1.0);
  gl_Position = project_to_clipspace(position_worldspace);

  if (pickingEnabled < 0.5) {
    float lightWeight = 1.0;

    if (extruded > 0.5) {
      lightWeight = getLightWeight(
        position_worldspace,
        normals
      );
    }

    vec3 lightWeightedColor = lightWeight * colors.rgb;
    vec4 color = vec4(lightWeightedColor, colors.a * opacity) / 255.0;

    vPickingColor = color;

  } else {
    vPickingColor = vec4(pickingColors.rgb / 255.0, 1.0);
  }
}
