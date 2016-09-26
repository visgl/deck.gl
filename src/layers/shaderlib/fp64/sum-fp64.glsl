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

vec2 quickTwoSum(float a, float b) {
  float sum = a + b;
  float err = b - (sum - a);
  return vec2(sum, err);
}

// ri: real and imaginary components in vec2
vec4 twoSumComp(vec2 a_ri, vec2 b_ri) {
  vec2 sum = a_ri + b_ri;
  vec2 v = sum - a_ri;
  vec2 err = (a_ri - (sum - v)) + (b_ri - v);
  return vec4(sum.x, err.x, sum.y, err.y);
}

vec2 sum_fp64(vec2 a, vec2 b) {
  vec4 st;
  st = twoSumComp(a, b);
  st.y += st.z;
  st.xy = quickTwoSum(st.x, st.y);
  st.y += st.w;
  st.xy = quickTwoSum(st.x, st.y);
  return st.xy;
}

#pragma glslify: export(sum_fp64)
