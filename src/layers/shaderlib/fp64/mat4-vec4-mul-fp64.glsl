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
#pragma glslify: vec4_dot_fp64 = require(./vec4-dot-fp64, ONE=ONE)
#pragma glslify: mul_fp64 = require(./mul-fp64, ONE=ONE)

void mat4_vec4_mul_fp64(vec2 b[16], vec2 a[4], out vec2 out_val[4]) {
  vec2 tmp[4];

  for (int i = 0; i < 4; i++)
  {
    for (int j = 0; j < 4; j++)
    {
      tmp[j] = b[j + i * 4];
    }
    vec4_dot_fp64(a, tmp, out_val[i]);
  }
}

#pragma glslify: export(mat4_vec4_mul_fp64)
