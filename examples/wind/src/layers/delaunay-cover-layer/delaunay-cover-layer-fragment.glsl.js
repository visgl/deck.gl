// Copyright (c) 2017 Uber Technologies, Inc.
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
#define SHADER_NAME delaunay-cover-fragment-shader

varying vec4 vPosition;
varying vec4 vNormal;
varying vec4 vColor;

float getLightWeight(vec4 position_worldspace, vec3 normals_worldspace) {
  float lightWeight = 0.0;

  vec3 position_worldspace_vec3 = position_worldspace.xyz / position_worldspace.w;
  vec3 normals_worldspace_vec3 = normals_worldspace.xzy;

  vec3 camera_pos_worldspace = project_uCameraPosition;
  vec3 view_direction = normalize(camera_pos_worldspace - position_worldspace_vec3);

  vec3 light_position_worldspace = project_position(lightsPosition[0]);
  vec3 light_direction = normalize(light_position_worldspace - position_worldspace_vec3);

  vec3 halfway_direction = normalize(light_direction + view_direction);
  float lambertian = dot(light_direction, normals_worldspace_vec3);
  float specular = 0.0;
  if (lambertian > 0.0) {
    float specular_angle = max(dot(normals_worldspace_vec3, halfway_direction), 0.0);
    specular = pow(specular_angle, 32.0);
  }
  lambertian = max(lambertian, 0.0);
  lightWeight +=
    (ambientRatio + lambertian * diffuseRatio + specular * specularRatio) *
    lightsStrength[0].x;

  return lightWeight;
}

void main(void) {
  float lightWeight = getLightWeight(vPosition, vNormal.xyz);
  gl_FragColor = vec4(vColor.xyz * lightWeight, vColor.a);
}
`;
