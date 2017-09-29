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

// Inspired by screen-grid-layer vertex shader in deck.gl

export default `\
#define SHADER_NAME grid-cell-layer-vertex-shader

attribute vec3 positions;
attribute vec3 normals;

attribute vec4 instancePositions;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Picking uniforms
// Set to 1.0 if rendering picking buffer, 0.0 if rendering for display
uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

// Custom uniforms
uniform float extruded;
uniform float cellSize;
uniform float coverage;
uniform float opacity;
uniform float elevationScale;

// A magic number to scale elevation so that 1 unit approximate to 1 meter
#define ELEVATION_SCALE 0.8

// Result
varying vec4 vColor;

// whether is point picked
float isPicked(vec3 pickingColors, vec3 selectedColor) {
 return float(pickingColors.x == selectedColor.x
 && pickingColors.y == selectedColor.y
 && pickingColors.z == selectedColor.z);
}

void main(void) {

  vec2 topLeftPos = project_position(instancePositions.xy);

  // if ahpha == 0.0 or z < 0.0, do not render element
  float noRender = float(instanceColors.a == 0.0 || instancePositions.w < 0.0);
  float finalCellSize = cellSize * mix(1.0, 0.0, noRender);

  // cube gemoetry vertics are between -1 to 1, scale and transform it to between 0, 1
  vec2 pos = topLeftPos + vec2(
  (positions.x * coverage + 1.0) / 2.0 * finalCellSize,
  (positions.y * coverage - 1.0) / 2.0 * finalCellSize);

  float elevation = 0.0;

  if (extruded > 0.5) {
    elevation = project_scale(instancePositions.w  * (positions.z + 1.0) *
      ELEVATION_SCALE * elevationScale);
  }

  // extrude positions
  vec3 extrudedPosition = vec3(pos.xy, elevation + 1.0);
  vec4 position_worldspace = vec4(extrudedPosition, 1.0);
  gl_Position = project_to_clipspace(position_worldspace);

  if (renderPickingBuffer < 0.5) {

    // TODO: we should allow the user to specify the color for "selected element"
    // check whether a bar is currently picked.
    float selected = isPicked(instancePickingColors, selectedPickingColor);

    float lightWeight = 1.0;

    if (extruded > 0.5) {
      lightWeight = getLightWeight(
        position_worldspace.xyz, // the w component is always 1.0
        normals
      );
    }

    vec3 lightWeightedColor = lightWeight * instanceColors.rgb;
    vec4 color = vec4(lightWeightedColor, instanceColors.a * opacity) / 255.0;
    vColor = color;

  } else {

    vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.0);
     vColor = pickingColor;

  }
}
`;
