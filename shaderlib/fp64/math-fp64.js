export default `\
uniform float ONE;

const vec2 E = vec2(2.7182817459106445e+00, 8.254840366817007e-08);
const vec2 LOG2 = vec2(0.6931471824645996e+00, -1.9046542121259336e-09);
const vec2 WORLD_SCALE_FP64 = vec2(81.4873275756836, 0.0000032873668232014097);

const vec2 PI_FP64 = vec2(3.1415927410125732, -8.742278012618954e-8);
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

const vec2 INVERSE_FACTORIAL_3 = vec2(1.666666716337204e-01, -4.967053879312289e-09); // 1/3!
const vec2 INVERSE_FACTORIAL_4 = vec2(4.16666679084301e-02, -1.2417634698280722e-09); // 1/4!
const vec2 INVERSE_FACTORIAL_5 = vec2(8.333333767950535e-03, -4.34617203337595e-10); // 1/5!
const vec2 INVERSE_FACTORIAL_6 = vec2(1.3888889225199819e-03, -3.3631094437103215e-11); // 1/6!
const vec2 INVERSE_FACTORIAL_7 = vec2(1.9841270113829523e-04,  -2.725596874933456e-12); // 1/7!
const vec2 INVERSE_FACTORIAL_8 = vec2(2.4801587642286904e-05, -3.406996025904184e-13); // 1/8!
const vec2 INVERSE_FACTORIAL_9 = vec2(2.75573188446287533e-06, 3.7935713937038186e-14); // 1/9!
const vec2 INVERSE_FACTORIAL_10 = vec2(2.755731998149713e-07, -7.575112367869873e-15); // 1/10!

float nint(float d) {
    if (d == floor(d)) return d;
    return floor(d + 0.5);
}

#ifdef NVIDIA_WORKAROUND
vec2 split(float a) {
  const float SPLIT = 4097.0;
  float t = a * SPLIT;
  float a_hi = t - (t - a) * ONE;
  float a_lo = a - a_hi * ONE;
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

#ifdef NVIDIA_WORKAROUND

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

vec2 nint_fp64(vec2 a) {
    float hi = nint(a.x);
    float lo;
    vec2 tmp;
    if (hi == a.x) {
        lo = nint(a.y);
        tmp = quickTwoSum(hi, lo);
    } else {
        lo = 0.0;
        if (abs(hi - a.x) == 0.5 && a.y < 0.0) {
            hi -= 1.0;
        }
        tmp = vec2(hi, lo);
    }
    return tmp;
}

#ifdef NVIDIA_WORKAROUND

vec2 twoSum(float a, float b) {
  float s = (a + b) * ONE;
  float v = (s - a) * ONE;
  float err = (a - (s - v))  * ONE + (b - v) * ONE;
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

#ifdef NVIDIA_WORKAROUND

vec2 twoSub(float a, float b) {
  float s = (a - b) * ONE;
  float v = (s - a) * ONE;
  float err = (a - (s - v)) * ONE - (b + v) * ONE;
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

#ifdef NVIDIA_WORKAROUND

vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  float err =  a_fp64.y * b_fp64.y * ONE - (((prod - a_fp64.x * b_fp64.x) * ONE - a_fp64.x * b_fp64.y) * ONE -
    a_fp64.y * b_fp64.x) * ONE;
  return vec2(prod, err);
}

#else

vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  float err = ((a_fp64.x * b_fp64.x - prod) + a_fp64.x * b_fp64.y +
    a_fp64.y * b_fp64.x) + a_fp64.y * b_fp64.y;
  return vec2(prod, err);
}
#endif

#ifdef NVIDIA_WORKAROUND
vec2 twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = split(a);

  float err = ((a_fp64.x * a_fp64.x - prod) + 2.0 * a_fp64.x * a_fp64.y) + a_fp64.y * a_fp64.y;
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
  vec2 yn_sqr = twoSqr(yn);

  float diff = sub_fp64(a, yn_sqr).x;
  vec2 prod = twoProd(x * 0.5, diff);
  return sum_fp64(vec2(yn, 0.0), prod);
}

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
  t = mul_fp64(p, INVERSE_FACTORIAL_3);

  s = sum_fp64(s, t);
  p = mul_fp64(p, r);
  t = mul_fp64(p, INVERSE_FACTORIAL_4);

  s = sum_fp64(s, t);
  p = mul_fp64(p, r);
  t = mul_fp64(p, INVERSE_FACTORIAL_5);

  s = sum_fp64(s, t);
  p = mul_fp64(p, r);
  t = mul_fp64(p, INVERSE_FACTORIAL_6);

  s = sum_fp64(s, t);
  p = mul_fp64(p, r);
  t = mul_fp64(p, INVERSE_FACTORIAL_7);

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

vec2 log_fp64(vec2 a)
{
  if (a.x == 1.0 && a.y == 0.0) return vec2(0.0, 0.0);
  if (a.x <= 0.0) return vec2(0.0 / 0.0, 0.0 / 0.0);
  vec2 x = vec2(log(a.x), 0.0);
  x = sub_fp64(sum_fp64(x, mul_fp64(a, exp_fp64(-x))), vec2(1.0, 0.0));
  return x;
}

vec2 sin_taylor_fp64(vec2 a) {
  vec2 r, s, t, x;

  if (a.x == 0.0 && a.y == 0.0) {
    return vec2(0.0, 0.0);
  }

  x = -mul_fp64(a, a);
  s = a;
  r = a;

  r = mul_fp64(r, x);
  t = mul_fp64(r, INVERSE_FACTORIAL_3);
  s = sum_fp64(s, t);

  r = mul_fp64(r, x);
  t = mul_fp64(r, INVERSE_FACTORIAL_5);
  s = sum_fp64(s, t);

  r = mul_fp64(r, x);
  t = mul_fp64(r, INVERSE_FACTORIAL_7);
  s = sum_fp64(s, t);

  r = mul_fp64(r, x);
  t = mul_fp64(r, INVERSE_FACTORIAL_9);
  s = sum_fp64(s, t);

  return s;
}

vec2 cos_taylor_fp64(vec2 a) {
  vec2 r, s, t, x;

  if (a.x == 0.0 && a.y == 0.0) {
    return vec2(1.0, 0.0);
  }

  x = -mul_fp64(a, a);
  r = x;
  s = sum_fp64(vec2(1.0, 0.0), r * 0.5);

  r = mul_fp64(r, x);
  t = mul_fp64(r, INVERSE_FACTORIAL_4);
  s = sum_fp64(s, t);

  r = mul_fp64(r, x);
  t = mul_fp64(r, INVERSE_FACTORIAL_6);
  s = sum_fp64(s, t);

  r = mul_fp64(r, x);
  t = mul_fp64(r, INVERSE_FACTORIAL_8);
  s = sum_fp64(s, t);

  r = mul_fp64(r, x);
  t = mul_fp64(r, INVERSE_FACTORIAL_10);
  s = sum_fp64(s, t);

  return s;
}

void sincos_taylor_fp64(vec2 a, out vec2 sin_t, out vec2 cos_t) {
  if (a.x == 0.0 && a.y == 0.0) {
    sin_t = vec2(0.0, 0.0);
    cos_t = vec2(1.0, 0.0);
  }

  sin_t = sin_taylor_fp64(a);
  cos_t = sqrt_fp64(sub_fp64(vec2(1.0, 0.0), mul_fp64(sin_t, sin_t)));
}

vec2 sin_fp64(vec2 a) {
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

    if (k == 0) {
        if (j == 0) {
            return sin_taylor_fp64(t);
        } else if (j == 1) {
            return cos_taylor_fp64(t);
        } else if (j == -1) {
            return -cos_taylor_fp64(t);
        } else {
            return -sin_taylor_fp64(t);
        }
    }

    int abs_k = int(abs(float(k)));

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

    if (abs_k == 1) {
        u = COS_TABLE_0;
        v = SIN_TABLE_0;
    } else if (abs_k == 2) {
        u = COS_TABLE_1;
        v = SIN_TABLE_1;
    } else if (abs_k == 3) {
        u = COS_TABLE_2;
        v = SIN_TABLE_2;
    } else {
        u = COS_TABLE_3;
        v = SIN_TABLE_3;
    }

    vec2 sin_t, cos_t;
    sincos_taylor_fp64(t, sin_t, cos_t);

    vec2 result = vec2(0.0, 0.0);
    if (j == 0) {
        if (k > 0) {
            result = sum_fp64(mul_fp64(u, sin_t), mul_fp64(v, cos_t));
        } else {
            result = sub_fp64(mul_fp64(u, sin_t), mul_fp64(v, cos_t));
        }
    } else if (j == 1) {
        if (k > 0) {
            result = sub_fp64(mul_fp64(u, cos_t), mul_fp64(v, sin_t));
        } else {
            result = sum_fp64(mul_fp64(u, cos_t), mul_fp64(v, sin_t));
        }
    } else if (j == -1) {
        if (k > 0) {
            result = sub_fp64(mul_fp64(v, sin_t), mul_fp64(u, cos_t));
        } else {
            result = -sum_fp64(mul_fp64(v, sin_t), mul_fp64(u, cos_t));
        }
    } else {
        if (k > 0) {
            result = -sum_fp64(mul_fp64(u, sin_t), mul_fp64(v, cos_t));
        } else {
            result = sub_fp64(mul_fp64(v, cos_t), mul_fp64(u, sin_t));
        }
    }

    return result;
}

vec2 cos_fp64(vec2 a) {
    if (a.x == 0.0 && a.y == 0.0) {
        return vec2(1.0, 0.0);
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

    if (k == 0) {
        if (j == 0) {
            return cos_taylor_fp64(t);
        } else if (j == 1) {
            return -sin_taylor_fp64(t);
        } else if (j == -1) {
            return sin_taylor_fp64(t);
        } else {
            return -cos_taylor_fp64(t);
        }
    }

    int abs_k = int(abs(float(k)));

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

    if (abs_k == 1) {
        u = COS_TABLE_0;
        v = SIN_TABLE_0;
    } else if (abs_k == 2) {
        u = COS_TABLE_1;
        v = SIN_TABLE_1;
    } else if (abs_k == 3) {
        u = COS_TABLE_2;
        v = SIN_TABLE_2;
    } else {
        u = COS_TABLE_3;
        v = SIN_TABLE_3;
    }

    vec2 sin_t, cos_t;
    sincos_taylor_fp64(t, sin_t, cos_t);


    vec2 result = vec2(0.0, 0.0);
    if (j == 0) {
        if (k > 0) {
            result = sub_fp64(mul_fp64(u, cos_t), mul_fp64(v, sin_t));
        } else {
            result = sum_fp64(mul_fp64(u, cos_t), mul_fp64(v, sin_t));
        }
    } else if (j == 1) {
        if (k > 0) {
            result = -sum_fp64(mul_fp64(u, sin_t), mul_fp64(v, cos_t));
        } else {
            result = sub_fp64(mul_fp64(v, cos_t), mul_fp64(u, sin_t));
        }
    } else if (j == -1) {
        if (k > 0) {
            result = sum_fp64(mul_fp64(u, sin_t), mul_fp64(v, cos_t));
        } else {
            result = sub_fp64(mul_fp64(u, sin_t), mul_fp64(v, cos_t));
        }
    } else {
        if (k > 0) {
            result = sub_fp64(mul_fp64(v, sin_t), mul_fp64(u, cos_t));
        } else {
            result = -sum_fp64(mul_fp64(u, cos_t), mul_fp64(v, sin_t));
        }
    }

    return result;
}

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
        if (abs_k == 1) {
            u = COS_TABLE_0;
            v = SIN_TABLE_0;
        } else if (abs_k == 2) {
            u = COS_TABLE_1;
            v = SIN_TABLE_1;
        } else if (abs_k == 3) {
            u = COS_TABLE_2;
            v = SIN_TABLE_2;
        } else {
            u = COS_TABLE_3;
            v = SIN_TABLE_3;
        }

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

vec2 radians_fp64(vec2 degree) {
  return mul_fp64(div_fp64(degree, vec2(180.0, 0.0)), PI_FP64);
}

void vec4_fp64(vec4 a, out vec2 out_val[4]) {
  out_val[0].x = a[0];
  out_val[0].y = 0.0;

  out_val[1].x = a[1];
  out_val[1].y = 0.0;

  out_val[2].x = a[2];
  out_val[2].y = 0.0;

  out_val[3].x = a[3];
  out_val[3].y = 0.0;
}

void vec4_scalar_mul_fp64(vec2 a[4], vec2 b, out vec2 out_val[4]) {
  out_val[0] = mul_fp64(a[0], b);
  out_val[1] = mul_fp64(a[1], b);
  out_val[2] = mul_fp64(a[2], b);
  out_val[3] = mul_fp64(a[3], b);
}

void vec4_sum_fp64(vec2 a[4], vec2 b[4], out vec2 out_val[4]) {
  for (int i = 0; i < 4; i++) {
    out_val[i] = sum_fp64(a[i], b[i]);
  }
}

void vec4_dot_fp64(vec2 a[4], vec2 b[4], out vec2 out_val) {
  vec2 v[4];

  v[0] = mul_fp64(a[0], b[0]);
  v[1] = mul_fp64(a[1], b[1]);
  v[2] = mul_fp64(a[2], b[2]);
  v[3] = mul_fp64(a[3], b[3]);

  out_val = sum_fp64(sum_fp64(v[0], v[1]), sum_fp64(v[2], v[3]));
}

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

void mercator_project_fp64(vec4 position_fp64, vec2 mercatorScaleFP64, out vec2 out_val[2]) {
  vec2 pos_fp64[2];
  pos_fp64[0] = sum_fp64(radians_fp64(position_fp64.xy), PI_FP64);
  pos_fp64[1] = sub_fp64(PI_FP64, log_fp64(tan_fp64(sum_fp64(PI_FP64 * 0.25, radians_fp64(position_fp64.zw) * 0.5))));
  vec2 x_fp64 = mul_fp64(pos_fp64[0], mercatorScaleFP64);
  vec2 y_fp64 = mul_fp64(pos_fp64[1], mercatorScaleFP64);
  out_val[0] = mul_fp64(x_fp64, WORLD_SCALE_FP64);
  out_val[1] = mul_fp64(y_fp64, WORLD_SCALE_FP64);
  return;
}

`;
