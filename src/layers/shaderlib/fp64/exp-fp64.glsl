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
#pragma glslify: sum_fp64 = require(./sum-fp64, ONE=ONE)
#pragma glslify: sub_fp64 = require(./sub-fp64, ONE=ONE)
#pragma glslify: mul_fp64 = require(./mul-fp64, ONE=ONE)
#pragma glslify: div_fp64 = require(./div-fp64, ONE=ONE)

const vec2 E = vec2(2.7182817459106445e+00, 8.254840366817007e-08);
const vec2 LOG2 = vec2(0.6931471824645996e+00, -1.9046542121259336e-09);

const vec2 inv_fact0 = vec2(1.666666716337204e-01, -4.967053879312289e-09);
const vec2 inv_fact1 = vec2(4.16666679084301e-02, -1.2417634698280722e-09);
const vec2 inv_fact2 = vec2(8.333333767950535e-03, -4.34617203337595e-10);
const vec2 inv_fact3 = vec2(1.3888889225199819e-03, -3.3631094437103215e-11);
const vec2 inv_fact4 = vec2(1.9841270113829523e-04,  -2.725596874933456e-12);

vec2 exp_fp64(vec2 a) {


  const float k = 512.0;
  const float inv_k = 1.0 / k;

  if (a.x <= -88.0) return vec2(0.0, 0.0);
  if (a.x >= 88.0) return vec2(1.0 / 0.0, 1.0 / 0.0);
  if (a.x == 0.0 && a.y == 0.0) return vec2(1.0, 0.0);
  if (a.x == 1.0 && a.y == 0.0) return E;

  // Range reduction using assume a = kr + m * log(2), k and m being integers.
  // Set k = 9 (we can choose other k to trade accuracy with performance.
  // we only need to calculate exp(r) and using exp(a) = 2^m * exp(r)^k

  float m = floor(a.x / LOG2.x + 0.5);
  vec2 r = sub_fp64(a, mul_fp64(LOG2, vec2(m, 0.0))) * inv_k;
  vec2 s, t, p;

  p = mul_fp64(r, r);
  s = sum_fp64(r, p * 0.5);
  p = mul_fp64(p, r);
  t = mul_fp64(p, inv_fact0);

  s = sum_fp64(s, t);
  p = mul_fp64(p, r);
  t = mul_fp64(p, inv_fact1);

  s = sum_fp64(s, t);
  p = mul_fp64(p, r);
  t = mul_fp64(p, inv_fact2);

  s = sum_fp64(s, t);
  p = mul_fp64(p, r);
  t = mul_fp64(p, inv_fact3);

  s = sum_fp64(s, t);
  p = mul_fp64(p, r);
  t = mul_fp64(p, inv_fact4);

  s = sum_fp64(s, t);

  // At this point, s = exp(r) - 1; but after following 4 recursions, we will get exp(r) ^ 512 - 1.

  s = sum_fp64(s * 2.0, mul_fp64(s, s));
  s = sum_fp64(s * 2.0, mul_fp64(s, s));
  s = sum_fp64(s * 2.0, mul_fp64(s, s));
  s = sum_fp64(s * 2.0, mul_fp64(s, s));

  // We can add more iterations here and increase k.
  s = sum_fp64(s * 2.0, mul_fp64(s, s));
  s = sum_fp64(s * 2.0, mul_fp64(s, s));
  s = sum_fp64(s * 2.0, mul_fp64(s, s));
  s = sum_fp64(s * 2.0, mul_fp64(s, s));
  s = sum_fp64(s * 2.0, mul_fp64(s, s));

  s = sum_fp64(s, vec2(1.0, 0.0));

  return s * pow(2.0, m);
//   return r;

}
#pragma glslify: export(exp_fp64)

