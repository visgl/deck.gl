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

#define SHADER_NAME column-layer-vertex-shader

attribute vec3 positions;
attribute vec3 normals;

attribute vec3 instancePositions;
attribute float instanceElevations;
attribute vec2 instancePositions64xyLow;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Custom uniforms
uniform float opacity;
uniform float radius;
uniform float angle;
uniform vec2 offset;
uniform bool extruded;
uniform float coverage;
uniform float elevationScale;

// Result
varying vec4 vColor;

void main(void) {

  // rotate primitive position and normal
  mat2 rotationMatrix = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));

  // calculate elevation, if 3d not enabled set to 0
  // cylindar gemoetry height are between -1.0 to 1.0, transform it to between 0, 1
  float elevation = 0.0;

  if (extruded) {
    elevation = instanceElevations * (positions.z + 1.0) / 2.0 * elevationScale;
  }

  // if ahpha == 0.0 or z < 0.0, do not render element
  float shouldRender = float(instanceColors.a > 0.0 && instanceElevations >= 0.0);
  float dotRadius = radius * coverage * shouldRender;

  // project center of column
  vec3 centroidPosition = vec3(instancePositions.xy, instancePositions.z + elevation);
  vec2 centroidPosition64xyLow = instancePositions64xyLow;
  vec3 pos = vec3(project_size(rotationMatrix * positions.xy + offset) * dotRadius, 0.);

  vec4 position_commonspace;
  gl_Position = project_position_to_clipspace(centroidPosition, centroidPosition64xyLow, pos, position_commonspace);

  // Light calculations
  // Worldspace is the linear space after Mercator projection

  vec3 normals_commonspace = project_normal(vec3(rotationMatrix * normals.xy, normals.z));

  if (extruded) {
    vec3 lightColor = lighting_getLightColor(instanceColors.rgb, project_uCameraPosition, position_commonspace.xyz, normals_commonspace);
    vColor = vec4(lightColor, instanceColors.a * opacity) / 255.0;
  } else {
    vColor = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.0;
  }

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(instancePickingColors);
}
`;
