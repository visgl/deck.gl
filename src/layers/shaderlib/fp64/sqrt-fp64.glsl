
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
#pragma glslify: sum_fp64 = require(./sum-fp64)
#pragma glslify: sub_fp64 = require(./sub-fp64)
#pragma glslify: mul_fp64 = require(./mul-fp64)

vec2 split(float a) {
  const float SPLIT = 4097.0;
  float t = a * SPLIT;
  float a_hi = t - (t - a);
  float a_lo = a - a_hi;
  return vec2(a_hi, a_lo);
}

vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  float err = ((a_fp64.x * b_fp64.x - prod) + a_fp64.x * b_fp64.y +
    a_fp64.y * b_fp64.x) + a_fp64.y * b_fp64.y;
  return vec2(prod, err);
}

vec2 twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = split(a);

  float err = ((a_fp64.x * a_fp64.x - prod) + a_fp64.x * a_fp64.y + a_fp64.x * a_fp64.y) + a_fp64.y * a_fp64.y;
  return vec2(prod, err);
}

vec2 sqrt_fp64(vec2 a) {

  float xn = inversesqrt(a.x);
  vec2 yn = a * xn;
  vec2 yn_sqr = twoSqr(yn.x);

  float diff = sub_fp64(a, yn_sqr).x;
  vec2 prod = twoProd(xn, diff) / 2.0;
  return sum_fp64(yn, prod);

}


#pragma glslify: export(sqrt_fp64)

