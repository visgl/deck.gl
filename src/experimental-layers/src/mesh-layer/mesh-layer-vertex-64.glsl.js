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
#define SHADER_NAME mesh-layer-vs-64

// Scale the model
uniform float sizeScale;

// Primitive attributes
attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;

// Instance attributes
attribute vec3 instancePositions;
attribute vec2 instancePositions64xy;
attribute float instanceAngles;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Outputs to fragment shader
varying vec4 vColor;
varying vec2 vTexCoord;
varying float vLightWeight;

void main(void) {
  // Calculate arrow offset (from instance position)
  float angle = instanceAngles;
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

  vec3 offset = positions;
  offset = project_scale(offset * sizeScale);
  offset = vec3(rotationMatrix * offset.xy, offset.z);

  gl_Position = project_position_and_offset_to_clipspace_fp64(
    instancePositions, instancePositions64xy, offset
  );

  picking_setPickingColor(instancePickingColors);

  vTexCoord = texCoords;
  vColor = instanceColors;

  //   lightWeight = getLightWeight(
  //     position_worldspace.xyz, // the w component is always 1.0
  //     normals
  //   );
  // vLightWeight = getLightWeight(pos, normals);
}
`;
