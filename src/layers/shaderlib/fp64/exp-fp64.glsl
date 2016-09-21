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
#pragma glslify: mul_fp64 = require(./mul-fp64)
#pragma glslify: div_fp64 = require(./div-fp64)

vec2 exp_fp64(vec2 a) {

//   //float threshold = 1e-20 * exp(a.x);

  vec2 t;
  vec2 p;
  vec2 f;
  vec2 s;
  vec2 x;
  vec2 m;


  s = sum_fp64(vec2(1.0, 0.0), a);
  p = mul_fp64(a, a);
  m = vec2(2.0, 0.0);
  f = vec2(2.0, 0.0);
  t = p / 2.0;

// The correct way is to loop until t is smaller than a certain
// threshold but since WebGL currently don't support while loop
// we simply loop for a certain amount of time here

//  while (abs(t.x) > threshold) {
  for (int i = 0; i < 20; i++)
  {
    s = sum_fp64(s, t);
    p = mul_fp64(p, a);
    m = sum_fp64(m, vec2(1.0, 0.0));
    f = mul_fp64(f, m);
    t = div_fp64(p, f);
  }

  return sum_fp64(s, t);

  // vec2 tmp_result = vec2(1.0, 0.0);

  // for (int i = 20; i > 0; --i)
  // {
  //   tmp_result = sum_fp64(vec2(1.0, 0.0), div_fp64(mul_fp64(a, tmp_result), vec2(i, 0.0)));
  // }

  // return tmp_result;

}
#pragma glslify: export(exp_fp64)

