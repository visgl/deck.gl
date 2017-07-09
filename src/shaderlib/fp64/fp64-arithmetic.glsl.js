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
uniform float ONE;

#if defined(NVIDIA_FP64_WORKAROUND) || defined(INTEL_FP64_WORKAROUND)
vec2 split(float a) {
  const float SPLIT = 4097.0;
  float t = a * SPLIT;
  float a_hi = t * ONE - (t - a);
  float a_lo = a * ONE - a_hi;
  return vec2(a_hi, a_lo);
}
#else
vec2 split(float a) {
  const float SPLIT = 4097.0;
  float t = a * SPLIT;
  float a_hi = t - (t - a);
  float a_lo = a - a_hi;
  return vec2(a_hi, a_lo);
}
#endif

#if defined(NVIDIA_EQUATION_WORKAROUND) || defined(INTEL_EQUATION_WORKAROUND)
vec2 quickTwoSum(float a, float b) {
  float sum = (a + b) * ONE;
  float err = b - (sum - a) * ONE;
  return vec2(sum, err);
}
#else
vec2 quickTwoSum(float a, float b) {
  float sum = a + b;
  float err = b - (sum - a);
  return vec2(sum, err);
}
#endif

#if defined(NVIDIA_EQUATION_WORKAROUND) || defined(INTEL_EQUATION_WORKAROUND)

/* The purpose of this workaround is to prevent shader compilers from
optimizing away necessary arithmetic operations by swapping their sequences
or transform the equation to some 'equivalent' from.

The method is to multiply an artifical variable, ONE, which will be known to
the compiler to be 1 only at runtime. The whole expression is then represented
as a polynomial with respective to ONE. In the coefficients of all terms, only one a
and one b should appear

err = (a + b) * ONE^6 - a * ONE^5 - (a + b) * ONE^4 + a * ONE^3 - b - (a + b) * ONE^2 + a * ONE
*/

vec2 twoSum(float a, float b) {
  float s = (a + b);
  float v = (s * ONE - a) * ONE;
  float err = (a - (s - v) * ONE) * ONE * ONE * ONE + (b - v);
  return vec2(s, err);
}
#else
vec2 twoSum(float a, float b) {
  float s = a + b;
  float v = s - a;
  float err = (a - (s - v)) + (b - v);
  return vec2(s, err);
}
#endif

#if defined(NVIDIA_EQUATION_WORKAROUND) || defined(INTEL_EQUATION_WORKAROUND)
/* Same thing as in twoSum() */
vec2 twoSub(float a, float b) {
  float s = (a - b);
  float v = (s * ONE - a) * ONE;
  float err = (a - (s - v) * ONE) * ONE * ONE * ONE - (b + v);
  return vec2(s, err);
}
#else
vec2 twoSub(float a, float b) {
  float s = a - b;
  float v = s - a;
  float err = (a - (s - v)) - (b + v);
  return vec2(s, err);
}
#endif

#if defined(NVIDIA_EQUATION_WORKAROUND) || defined(INTEL_EQUATION_WORKAROUND)
vec2 twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = split(a);

  float err = ((a_fp64.x * a_fp64.x - prod) * ONE + 2.0 * a_fp64.x *
    a_fp64.y * ONE * ONE) + a_fp64.y * a_fp64.y * ONE * ONE * ONE;
  return vec2(prod, err);
}
#else
vec2 twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = split(a);

  float err = ((a_fp64.x * a_fp64.x - prod) + 2.0 * a_fp64.x * a_fp64.y) + a_fp64.y * a_fp64.y;
  return vec2(prod, err);
}
#endif

vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  float err = ((a_fp64.x * b_fp64.x - prod) + a_fp64.x * b_fp64.y +
    a_fp64.y * b_fp64.x) + a_fp64.y * b_fp64.y;
  return vec2(prod, err);
}

vec2 sum_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSum(a.x, b.x);
  t = twoSum(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 sub_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSub(a.x, b.x);
  t = twoSub(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 mul_fp64(vec2 a, vec2 b) {
  vec2 prod = twoProd(a.x, b.x);
  // y component is for the error
  prod.y += a.x * b.y;
  prod.y += a.y * b.x;
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

vec2 div_fp64(vec2 a, vec2 b) {
  float xn = 1.0 / b.x;
  vec2 yn = a * xn;
  float diff = (sub_fp64(a, mul_fp64(b, yn))).x;
  vec2 prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

vec2 sqrt_fp64(vec2 a) {
  if (a.x == 0.0 && a.y == 0.0) return vec2(0.0, 0.0);
  if (a.x < 0.0) return vec2(0.0 / 0.0, 0.0 / 0.0);

  float x = 1.0 / sqrt(a.x);
  float yn = a.x * x;
#if defined(NVIDIA_FP64_WORKAROUND) || defined(INTEL_FP64_WORKAROUND)
  vec2 yn_sqr = twoSqr(yn) * ONE;
#else
  vec2 yn_sqr = twoSqr(yn);
#endif
  float diff = sub_fp64(a, yn_sqr).x;
  vec2 prod = twoProd(x * 0.5, diff);
  return sum_fp64(vec2(yn, 0.0), prod);
}
`;
