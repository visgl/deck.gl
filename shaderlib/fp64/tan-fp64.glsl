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
#pragma glslify: div_fp64 = require(./div-fp64, ONE=ONE)
#pragma glslify: sincos_taylor_fp64 = require(./sincos-taylor-fp64, ONE=ONE)
#pragma glslify: nint_fp64 = require(./nint-fp64, ONE=ONE)

const vec2 TWO_PI = vec2(6.2831854820251465, -1.7484556025237907e-7);
const vec2 PI_2 = vec2(1.5707963705062866, -4.371139006309477e-8);
const vec2 PI_16 = vec2(0.19634954631328583, -5.463923757886846e-9);
const vec2 PI_16_2 = vec2(0.39269909262657166, -1.0927847515773692e-8);
const vec2 PI_16_3 = vec2(0.5890486240386963, -1.4906100798128818e-9);

const vec2 SIN_TABLE_0 = vec2(0.19509032368659973, -1.6704714833615242e-9);
const vec2 SIN_TABLE_1 = vec2(0.3826834261417389, 6.22335089017767e-9);
const vec2 SIN_TABLE_2 = vec2(0.5555702447891235, -1.1769521357507529e-8);
const vec2 SIN_TABLE_3 = vec2(0.7071067690849304, 1.2101617041793133e-8);

const vec2 COS_TABLE_0 = vec2(0.9807852506637573, 2.9739473106360492e-8);
const vec2 COS_TABLE_1 = vec2(0.9238795042037964, 2.8307490351764386e-8);
const vec2 COS_TABLE_2 = vec2(0.8314695954322815, 1.6870263741530778e-8);
const vec2 COS_TABLE_3 = vec2(0.7071067690849304, 1.2101617152815436e-8);

vec2 tan_fp64(vec2 a) {
    vec2 sin_a;
    vec2 cos_a;

    if (a.x == 0.0 && a.y == 0.0) {
        return vec2(0.0, 0.0);
    }

    // 2pi range reduction
    vec2 z = nint_fp64(div_fp64(a, TWO_PI));
    vec2 r = sub_fp64(a, mul_fp64(TWO_PI, z));

    vec2 t;
    float q = floor(r.x / PI_2.x + 0.5);
    int j = int(q);

    if (j < -2 || j > 2) {
        return vec2(0.0 / 0.0, 0.0 / 0.0);
    }

    t = sub_fp64(r, mul_fp64(PI_2, vec2(q, 0.0)));

    q = floor(t.x / PI_16.x + 0.5);
    int k = int(q);
    int abs_k = int(abs(float(k)));

    // We just can't get PI/16 * 3.0 very accurately.
    // so let's just store it
    if (abs_k > 4) {
        return vec2(0.0 / 0.0, 0.0 / 0.0);
    } else if (k == 3) {
        t = sub_fp64(t, PI_16_3);
    } else if (k == -3) {
        t = sum_fp64(t, PI_16_3);
    } else {
        t = sub_fp64(t, mul_fp64(PI_16, vec2(q, 0.0)));
    }


    vec2 u = vec2(0.0, 0.0);
    vec2 v = vec2(0.0, 0.0);

    vec2 sin_t, cos_t;
    vec2 s, c;
    sincos_taylor_fp64(t, sin_t, cos_t);

    if (k == 0) {
        s = sin_t;
        c = cos_t;
    } else {
#if defined(NVIDIA_EQUATION_WORKAROUND) || defined(INTEL_EQUATION_WORKAROUND)
        if (abs(float(abs_k) - 1.0) < 0.5) {
            u = COS_TABLE_0;
            v = SIN_TABLE_0;
        } else if (abs(float(abs_k) - 2.0) < 0.5) {
            u = COS_TABLE_1;
            v = SIN_TABLE_1;
        } else if (abs(float(abs_k) - 3.0) < 0.5) {
            u = COS_TABLE_2;
            v = SIN_TABLE_2;
        } else if (abs(float(abs_k) - 4.0) < 0.5) {
            u = COS_TABLE_3;
            v = SIN_TABLE_3;
        }
#else
        if (abs_k == 1) {
            u = COS_TABLE_0;
            v = SIN_TABLE_0;
        } else if (abs_k == 2) {
            u = COS_TABLE_1;
            v = SIN_TABLE_1;
        } else if (abs_k == 3) {
            u = COS_TABLE_2;
            v = SIN_TABLE_2;
        } else if (abs_k == 4) {
            u = COS_TABLE_3;
            v = SIN_TABLE_3;
        }
#endif

        if (k > 0) {
            s = sum_fp64(mul_fp64(u, sin_t), mul_fp64(v, cos_t));
            c = sub_fp64(mul_fp64(u, cos_t), mul_fp64(v, sin_t));
        } else {
            s = sub_fp64(mul_fp64(u, sin_t), mul_fp64(v, cos_t));
            c = sum_fp64(mul_fp64(u, cos_t), mul_fp64(v, sin_t));
        }
    }

    if (j == 0) {
        sin_a = s;
        cos_a = c;
    } else if (j == 1) {
        sin_a = c;
        cos_a = -s;
    } else if (j == -1) {
        sin_a = -c;
        cos_a = s;
    } else {
        sin_a = -s;
        cos_a = -c;
    }
    return div_fp64(sin_a, cos_a);
}
#pragma glslify: export(tan_fp64)
