// Copyright (c) 2016 Uber Technologies, Inc.
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
#pragma glslify: exp_fp64 = require(./exp-fp64, ONE=ONE)

vec2 log_fp64(vec2 a)
{
  if (a.x == 1.0 && a.y == 0.0) return vec2(0.0, 0.0);
  if (a.x <= 0.0) return vec2(0.0 / 0.0, 0.0 / 0.0);
  // The log function used here is accurate on AMD but not on NVIDIA
  // So on NVIDIA machines, log_fp64 only has 32-bit accuracy.
  vec2 x = vec2(log(a.x), 0.0);
  x = sub_fp64(sum_fp64(x, mul_fp64(a, exp_fp64(-x))), vec2(1.0, 0.0));
  return x;
}

#pragma glslify: export(log_fp64)

