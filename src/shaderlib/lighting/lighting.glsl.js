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

// lighting

export default `\
#define NUM_OF_LIGHTS 2
uniform vec3 cameraPos;
uniform vec3 lightsPosition[16];
uniform vec2 lightsStrength[16];
uniform float ambientRatio;
uniform float diffuseRatio;
uniform float specularRatio;

float getLightWeight(vec3 position_worldspace_vec3, vec3 normals_worldspace) {
  float lightWeight = 0.0;

  vec3 normals_worldspace_vec3 = normals_worldspace.xzy;

  vec3 camera_pos_worldspace = cameraPos;
  vec3 view_direction = normalize(camera_pos_worldspace - position_worldspace_vec3);

  for (int i = 0; i < NUM_OF_LIGHTS; i++) {
    vec3 light_position_worldspace = project_position(lightsPosition[i]);
    vec3 light_direction = normalize(light_position_worldspace - position_worldspace_vec3);

    vec3 halfway_direction = normalize(light_direction + view_direction);
    float lambertian = dot(light_direction, normals_worldspace_vec3);
    float specular = 0.0;
    if (lambertian > 0.0) {
      float specular_angle = max(dot(normals_worldspace_vec3, halfway_direction), 0.0);
      specular = pow(specular_angle, 32.0);
    }
    lambertian = max(lambertian, 0.0);
    lightWeight += (ambientRatio + lambertian * diffuseRatio + specular * specularRatio) *
      lightsStrength[i].x;

  }

  return lightWeight;
}
`;
