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
#version 300 es
#define SHADER_NAME surface-layer-vertex-shader

in vec3 positions;
in vec3 positions64Low;
in vec4 colors;
in vec4 pickingColors;

uniform float lightStrength;
uniform float opacity;

out vec4 vColor;
out float shouldDiscard;

void main(void) {
  vec3 position_commonspace = project_position(positions, positions64Low);
  gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 1.0));

  // cheap way to produce believable front-lit effect.
  // Note: clipsspace depth is nonlinear and deltaZ depends on the near and far values
  // when creating the perspective projection matrix.
  vec4 position_vector = project_common_position_to_clipspace(vec4(position_commonspace, 0.0));
  float fadeFactor = 1.0 - position_vector.z * lightStrength;

  vColor = vec4(colors.rgb * fadeFactor, colors.a * opacity) / 255.0;;

  picking_setPickingColor(pickingColors.xyz);

  shouldDiscard = pickingColors.a;
}
`;
