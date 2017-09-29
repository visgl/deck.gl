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
#define SHADER_NAME hexagon-cell-layer-vertex-shader-64

attribute vec3 positions;
attribute vec3 normals;

attribute vec3 instancePositions;
attribute vec2 instancePositions64xyLow;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Picking uniforms
// Set to 1.0 if rendering picking buffer, 0.0 if rendering for display
uniform float renderPickingBuffer;
uniform vec3 selectedPickingColor;

// Custom uniforms
uniform float opacity;
uniform float radius;
uniform float angle;
uniform float extruded;
uniform float coverage;
uniform float elevationScale;

// Result
varying vec4 vColor;

// A magic number to scale elevation so that 1 unit approximate to 1 meter.
#define ELEVATION_SCALE 0.8

float isPicked(vec3 pickingColors, vec3 selectedColor) {
 return float(pickingColors.x == selectedColor.x
 && pickingColors.y == selectedColor.y
 && pickingColors.z == selectedColor.z);
}

void main(void) {

  // rotate primitive position and normal
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

  vec2 rPos = rotationMatrix * positions.xz;
  vec2 rNorm = rotationMatrix * normals.xz;

  vec3 rotatedPositions = vec3(rPos.x, positions.y, rPos.y);
  vec3 rotatedNormals = vec3(rNorm.x, normals.y, rNorm.y);

  // calculate elevation, if 3d not enabled set to 0
  // cylindar gemoetry height are between -0.5 to 0.5, transform it to between 0, 1
  float elevation = 0.0;

  if (extruded > 0.5) {
    elevation = project_scale(instancePositions.z * (positions.y + 0.5) *
      ELEVATION_SCALE * elevationScale);
  }
  
  // if ahpha == 0.0 or z < 0.0, do not render element  
  float noRender = float(instanceColors.a == 0.0 || instancePositions.z < 0.0);
  float dotRadius = radius * mix(coverage, 0.0, noRender);
  
  // project center of hexagon

  vec4 instancePositions64xy = vec4(
    instancePositions.x, instancePositions64xyLow.x,
    instancePositions.y, instancePositions64xyLow.y);

  vec2 projected_coord_xy[2];
  project_position_fp64(instancePositions64xy, projected_coord_xy);

  vec2 vertex_pos_localspace[4];
  vec4_fp64(vec4(rotatedPositions.xz * dotRadius, 0.0, 1.0), vertex_pos_localspace);

  vec2 vertex_pos_modelspace[4];
  vertex_pos_modelspace[0] = sum_fp64(vertex_pos_localspace[0], projected_coord_xy[0]);
  vertex_pos_modelspace[1] = sum_fp64(vertex_pos_localspace[1], projected_coord_xy[1]);
  vertex_pos_modelspace[2] = sum_fp64(vertex_pos_localspace[2], vec2(elevation, 0.0));
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  vec4 position_worldspace = vec4(
    vertex_pos_modelspace[0].x, vertex_pos_modelspace[1].x,
    vertex_pos_modelspace[2].x, vertex_pos_modelspace[3].x);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);

  // render display
  if (renderPickingBuffer < 0.5) {

    // TODO: we should allow the user to specify the color for "selected element"
    // check whether hexagon is currently picked.
    float selected = isPicked(instancePickingColors, selectedPickingColor);

    // Light calculations
    // Worldspace is the linear space after Mercator projection

    vec3 normals_worldspace = rotatedNormals;

    float lightWeight = 1.0;

    if (extruded > 0.5) {
      lightWeight = getLightWeight(
        position_worldspace.xyz, // the w component is always 1.0
        normals_worldspace
      );
    }

    vec3 lightWeightedColor = lightWeight * instanceColors.rgb;

    // Color: Either opacity-multiplied instance color, or picking color
    vec4 color = vec4(lightWeightedColor, opacity * instanceColors.a) / 255.0;

    vColor = color;

  } else {

    vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.0);
    vColor = pickingColor;

  }
}
`;
