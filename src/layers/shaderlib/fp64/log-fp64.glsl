
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
#pragma glslify: exp_fp64 = require(./exp-fp64)

bool eq_fp64(vec2 a, vec2 b)
{
  return all(equal(a, b));
}

vec2 log_fp64(vec2 a)
{
  vec2 xi = vec2(0.0, 0.0);
  if (!eq_fp64(a, vec2(1.0, 0.0))) {
    if (a.x <= 0.0) {
      xi = vec2(log(a.x));
    } else {
      xi.x = log(a.x);
      xi = sum_fp64(sum_fp64(xi, mul_fp64(exp_fp64(-xi), a)), vec2(-1.0, 0.0));
    }
  }

  return xi;
}


#pragma glslify: export(log_fp64)

