// Copyright (c) 2015 Uber Technologies, Inc.
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

#define SHADER_NAME shadow-effect-fs

#ifdef GL_ES
precision highp float;
#endif

uniform int numShadows;

uniform sampler2D shadowSampler_0;
uniform sampler2D shadowSampler_1;
uniform sampler2D shadowSampler_2;
uniform sampler2D shadowSampler_3;
uniform sampler2D shadowSampler_4;


uniform mat4 shadowMatrix_0;
uniform mat4 shadowMatrix_1;
uniform mat4 shadowMatrix_2;
uniform mat4 shadowMatrix_3;
uniform mat4 shadowMatrix_4;



varying vec4 worldPosition;
varying vec4 clipPosition;

#define EPSILON 0.001;

#define MAG(v, f) (mod((v), float(f)) / float(f))


vec2 uv(mat4 matrix, vec4 pos) {
  vec4 clip = matrix * pos;
  //depth divide
  vec3 ndc = clip.xyz / clip.w;
  if (abs(ndc.x) > 1.0 || abs(ndc.y) > 1.0) return vec2(0,0);
  vec2 uv = 0.5 * vec2(ndc.x + 1.0, 1.0 - ndc.y);
  return uv;
}

float sampledDepth(sampler2D sampler, mat4 matrix, vec4 pos) {
  vec4 clip = matrix * pos;
  //depth divide
  vec3 ndc = clip.xyz / clip.w;
  if (abs(ndc.x) > 1.0 || abs(ndc.y) > 1.0) return 0.0;
  vec2 uv = 0.5 * vec2(1.0 + ndc.x, 1.0 - ndc.y);
  return texture2D(sampler, uv).r;
}

float actualDepth(mat4 matrix, vec4 pos) {
  vec4 clip = matrix * pos;
  //depth divide
  vec3 ndc = clip.xyz / clip.w;
  return ndc.z;
  //return (1.0 - ndc.z) / 2.0;
}

bool cameraOccluded(sampler2D sampler, mat4 matrix, vec4 pos) {
  vec4 clip = matrix * pos;
  //depth divide
  clip = clip / clip.w;
  if (abs(clip.x) > 1.0 || abs(clip.y) > 1.0) return true;
  vec2 uv = 0.5 * (vec2(clip.x + 1.0, 1.0 - clip.y));
  float depth = (1.0 - clip.z) / 2.0;
  return texture2D(sampler, uv).r < depth;
}


void main(void) {
  gl_FragColor = vec4(0, 0, 0, 0.5);
  
  //gl_FragColor.r = sampledDepth(shadowSampler_0, shadowMatrix_0, worldPosition);
  gl_FragColor.r = 1000.0*sampledDepth(shadowSampler_0, shadowMatrix_0, worldPosition)-999.0;
  gl_FragColor.b =  MAG(sampledDepth(shadowSampler_0, shadowMatrix_0, worldPosition), 0.1);
  //gl_FragColor.rg = uv(shadowMatrix_0, worldPosition);
  //gl_FragColor.rgb = clip.xyz;
}
