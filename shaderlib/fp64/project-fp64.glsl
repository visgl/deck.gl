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
#pragma glslify: sub_fp64 = require(./sub-fp64, ONE=ONE)
#pragma glslify: sum_fp64 = require(./sum-fp64, ONE=ONE)
#pragma glslify: mul_fp64 = require(./mul-fp64, ONE=ONE)
#pragma glslify: radians_fp64 = require(./radians-fp64, ONE=ONE)
#pragma glslify: log_fp64 = require(./log-fp64, ONE=ONE)
#pragma glslify: tan_fp64 = require(./tan-fp64, ONE=ONE)

const vec2 PI_FP64 = vec2(3.1415927410125732, -8.742278012618954e-8);
const vec2 WORLD_SCALE_FP64 = vec2(81.4873275756836, 0.0000032873668232014097);

uniform vec2 projectionScaleFP64;

// non-linear projection: lnglats => unit tile [0-1, 0-1]
void mercatorProject_fp64(vec4 lnglat_fp64, out vec2 out_val[2]) { //longitude: lnglat_fp64.xy; latitude: lnglat_fp64.zw

  out_val[0] = sum_fp64(radians_fp64(lnglat_fp64.xy), PI_FP64);
  out_val[1] = sub_fp64(PI_FP64, log_fp64(tan_fp64(sum_fp64(PI_FP64 * 0.25, radians_fp64(lnglat_fp64.zw) * 0.5))));
  return;
}
void project_fp64(vec4 position_fp64, out vec2 out_val[2]) {

  vec2 pos_fp64[2];
  mercatorProject_fp64(position_fp64, pos_fp64);
  vec2 x_fp64 = mul_fp64(pos_fp64[0], projectionScaleFP64);
  vec2 y_fp64 = mul_fp64(pos_fp64[1], projectionScaleFP64);
  out_val[0] = mul_fp64(x_fp64, WORLD_SCALE_FP64);
  out_val[1] = mul_fp64(y_fp64, WORLD_SCALE_FP64);

  return;
}


#pragma glslify: export(project_fp64)
