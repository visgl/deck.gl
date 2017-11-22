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
#define SHADER_NAME solid-polygon-layer-vertex-shader

attribute vec3 positions;
attribute vec3 normals;
attribute vec4 colors;
attribute vec3 pickingColors;

uniform float extruded;
uniform float elevationScale;
uniform float opacity;

uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

// PICKING
uniform float pickingEnabled;
varying vec4 vPickingColor;

void main(void) {
  
  vec4 position_worldspace = vec4(project_position(
    vec3(positions.x, positions.y, positions.z * elevationScale)),
    1.0
  );
  gl_Position = project_to_clipspace(position_worldspace);

  if (pickingEnabled < 0.5) {
    float lightWeight = 1.0;

    if (extruded > 0.5) {
      // Here, the input parameters should be
      // position_worldspace.xyz / position_worldspace.w.
      // However, this calculation generates all zeros on
      // MacBook Pro with Intel Iris Pro GPUs for unclear reasons.
      // (see https://github.com/uber/deck.gl/issues/559)
      // Since the w component is always 1.0 in our shaders,
      // we decided to just provide xyz component of position_worldspace
      // to the getLightWeight() function
      lightWeight = getLightWeight(
        position_worldspace.xyz,
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
`;
