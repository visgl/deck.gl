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
#define MAX_LIGHTS 5

struct AmbientLight {
 vec3 color;
 float intensity;
};

struct PointLight {
 vec3 color;
 float intensity;
 vec3 position;
};

struct DirectionalLight {
  vec3 color;
  float intensity;
  vec3 direction;
};
 
uniform AmbientLight lighting_ambientLight;
uniform PointLight lighting_pointLight[MAX_LIGHTS];
uniform DirectionalLight lighting_directionalLight[MAX_LIGHTS];
uniform int lighting_pointLightNumber;
uniform int lighting_directionalLightNumber;
`;
