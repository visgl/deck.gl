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
#define SHADER_NAME extruded-choropleths-layer-vertex-shader

attribute vec4 positions;
attribute vec2 heights;
attribute vec3 normals;
attribute vec4 colors;

uniform float opacity;
uniform float elevation;

uniform vec3 uAmbientColor;
uniform float uPointLightAmbientCoefficient;
uniform vec3 uPointLightLocation;
uniform vec3 uPointLightColor;
uniform float uPointLightAttenuation;

uniform vec3 uMaterialSpecularColor;
uniform float uMaterialShininess;

varying vec4 vColor;

vec3 applyLighting(vec3 position_modelspace, vec3 normal_modelspace, vec3 color) {

  vec3 pointLightLocation_modelspace = vec3(project_position(uPointLightLocation));
  vec3 lightDirection = normalize(pointLightLocation_modelspace - position_modelspace);

  vec3 ambient = uPointLightAmbientCoefficient * color / 255.0 * uAmbientColor / 255.0;

  float diffuseCoefficient = max(dot(normal_modelspace, lightDirection), 0.0);
  vec3 diffuse = diffuseCoefficient * uPointLightColor / 255. * color / 255.;

  return ambient + uPointLightAttenuation * diffuse;
}

void main(void) {
  vec2 projected_xy[2];
  project_position_fp64(positions, projected_xy);
  vec2 scaled_height = mul_fp64(heights, vec2(projectionPixelsPerUnit.x * elevation, 0.0));

  vec2 vertex_pos_modelspace[4];
  vertex_pos_modelspace[0] = projected_xy[0];
  vertex_pos_modelspace[1] = projected_xy[1];
  vertex_pos_modelspace[2] = sum_fp64(scaled_height, vec2(1.0, 0.0));
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);

  vec3 color = applyLighting(
  	vec3(
  	  vertex_pos_modelspace[0].x,
  	  vertex_pos_modelspace[1].x,
  	  vertex_pos_modelspace[2].x),
  	normals,
  	colors.rgb
  );
  vColor = vec4(color, opacity);
}
`;
