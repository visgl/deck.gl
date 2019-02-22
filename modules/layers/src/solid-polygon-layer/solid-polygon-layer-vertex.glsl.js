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

attribute vec2 vertexPositions;

#ifdef IS_SIDE_VERTEX
attribute vec3 instancedPositions;
attribute vec2 instancedPositions64xyLow;
attribute vec3 nextPositions;
attribute vec2 nextPositions64xyLow;
attribute float instancedElevations;
attribute vec4 instancedFillColors;
attribute vec4 instancedLineColors;
attribute vec3 instancedPickingColors;
attribute float vertexValid;
#else
attribute vec3 positions;
attribute vec2 positions64xyLow;
attribute float elevations;
attribute vec4 fillColors;
attribute vec4 lineColors;
attribute vec3 pickingColors;
#endif

uniform bool extruded;
uniform bool isWireframe;
uniform float elevationScale;
uniform float opacity;

varying vec4 vColor;
varying float isValid;

void main(void) {
#ifdef IS_SIDE_VERTEX
  vec3 positions = instancedPositions;
  vec2 positions64xyLow = instancedPositions64xyLow;
  float elevations = instancedElevations;
  vec4 fillColors = instancedFillColors;
  vec4 lineColors = instancedLineColors;
  vec3 pickingColors = instancedPickingColors;
#endif

  vec3 pos;
  vec2 pos64xyLow;
  vec3 normal;
  vec4 colors = isWireframe ? lineColors : fillColors;

#ifdef IS_SIDE_VERTEX
  pos = mix(positions, nextPositions, vertexPositions.x);
  pos64xyLow = mix(positions64xyLow, nextPositions64xyLow, vertexPositions.x);
  isValid = vertexValid;
#else
  pos = positions;
  pos64xyLow = positions64xyLow;
  isValid = 1.0;
#endif

  if (extruded) {
    pos.z += elevations * vertexPositions.y;
  }
  pos.z *= elevationScale;

  vec4 position_worldspace;
  gl_Position = project_position_to_clipspace(pos, pos64xyLow, vec3(0.), position_worldspace);

  if (extruded) {
#ifdef IS_SIDE_VERTEX
    normal = vec3(positions.y - nextPositions.y, nextPositions.x - positions.x, 0.0);
    normal = project_normal(normal);
#else
    normal = vec3(0.0, 0.0, 1.0);
#endif

    vec3 lightColor = lighting_getLightColor(colors.rgb, project_uCameraPosition, position_worldspace.xyz, normal);
    vColor = vec4(lightColor, colors.a * opacity) / 255.0;
  } else {
    vColor = vec4(colors.rgb, colors.a * opacity) / 255.0;
  }

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(pickingColors);
}
`;
