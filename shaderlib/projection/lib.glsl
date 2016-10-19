const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);

const float PROJECT_LINEAR = 0.;
const float PROJECT_MERCATOR = 1.;
const float PROJECT_MERCATOR_OFFSETS = 2.;

// USE PACKED UNIFORM TO MINIMIZE DEBUGGING
// uniform vec4 projectionParameters[2];
// float projectionMode = projectionParameters[0].x;
// vec2 projectionCenter = projectionParameters[0].zw;
// float projectionScale = projectionParameters[1].x;
// vec3 projectionPixelsPerUnit = projectionParameters[1].yzw;

uniform float projectionMode;
uniform float projectionScale;
uniform vec2 projectionCenter;
uniform vec3 projectionPixelsPerUnit;
uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixUncentered;

#ifdef INTEL_TAN_WORKAROUND
// define _tan_fp64 as workaround for Intel's inaccurate tan() temporarily

// All these functions are for substituting tan() function from Intel GPU only
// so the function/macro names are different from what defined in the complete
// fp64 library to avoid name conflicts
// after the entire fp64 library adopted shaderAssembler, this section
// can be eliminated.

uniform float _ONE;

const vec2 _TWO_PI = vec2(6.2831854820251465, -1.7484556025237907e-7);
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
const vec2 INVERSE_FACTORIAL_5 = vec2(8.333333767950535e-03, -4.34617203337595e-10); // 1/5!
const vec2 INVERSE_FACTORIAL_7 = vec2(1.9841270113829523e-04,  -2.725596874933456e-12); // 1/7!
const vec2 INVERSE_FACTORIAL_9 = vec2(2.75573188446287533e-06, 3.7935713937038186e-14); // 1/9!

vec2 _split(float a) {
  const float split = 4097.0;
  float t = a * split;
  float a_hi = t * _ONE - (t - a);
  float a_lo = a * _ONE - a_hi;
  return vec2(a_hi, a_lo);
}

vec2 _quickTwoSum(float a, float b) {
  float sum = (a + b) * _ONE;
  float err = b - (sum - a) * _ONE;
  return vec2(sum, err);
}

float _nint(float d) {
    if (d == floor(d)) return d;
    return floor(d + 0.5);
}

vec2 _nint_fp64(vec2 a) {
    float hi = _nint(a.x);
    float lo;
    vec2 tmp;
    if (hi == a.x) {
        lo = _nint(a.y);
        tmp = _quickTwoSum(hi, lo);
    } else {
        lo = 0.0;
        if (abs(hi - a.x) == 0.5 && a.y < 0.0) {
            hi -= 1.0;
        }
        tmp = vec2(hi, lo);
    }
    return tmp;
}

vec2 _twoSum(float a, float b) {
  float s = (a + b) * _ONE;
  float v = (s - a);
  float err = (a - (s - v) * _ONE) * _ONE + (b - v);
  return vec2(s, err);
}

vec2 _twoSub(float a, float b) {
  float s = (a - b) * _ONE;
  float v = (s - a);
  float err = (a - (s - v) * _ONE) * _ONE - (b + v);
  return vec2(s, err);
}

vec2 _twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = _split(a);

  float err = ((a_fp64.x * a_fp64.x - prod) * _ONE + 2.0 * a_fp64.x * a_fp64.y * _ONE * _ONE) + a_fp64.y * a_fp64.y * _ONE * _ONE * _ONE;
  return vec2(prod, err);
}

vec2 _twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = _split(a);
  vec2 b_fp64 = _split(b);
  float err = ((a_fp64.x * b_fp64.x - prod) + a_fp64.x * b_fp64.y +
    a_fp64.y * b_fp64.x) + a_fp64.y * b_fp64.y;
  return vec2(prod, err);
}

vec2 _sum_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = _twoSum(a.x, b.x);
  t = _twoSum(a.y, b.y);
  s.y += t.x;
  s = _quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = _quickTwoSum(s.x, s.y);
  return s;
}

vec2 _sub_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = _twoSub(a.x, b.x);
  t = _twoSub(a.y, b.y);
  s.y += t.x;
  s = _quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = _quickTwoSum(s.x, s.y);
  return s;
}

vec2 _mul_fp64(vec2 a, vec2 b) {
  vec2 prod = _twoProd(a.x, b.x);
  // y component is for the error
  prod.y += a.x * b.y;
  prod.y += a.y * b.x;
  prod = _quickTwoSum(prod.x, prod.y);
  return prod;
}

vec2 _div_fp64(vec2 a, vec2 b) {
  float xn = 1.0 / b.x;
  vec2 yn = a * xn;
  float diff = (_sub_fp64(a, _mul_fp64(b, yn))).x;
  vec2 prod = _twoProd(xn, diff);
  return _sum_fp64(yn, prod);
}

vec2 _sqrt_fp64(vec2 a) {

  if (a.x == 0.0 && a.y == 0.0) return vec2(0.0, 0.0);
  if (a.x < 0.0) return vec2(0.0 / 0.0, 0.0 / 0.0);

  float x = 1.0 / sqrt(a.x);
  float yn = a.x * x;
  vec2 yn_sqr = _twoSqr(yn) * _ONE;
  float diff = _sub_fp64(a, yn_sqr).x;
  vec2 prod = _twoProd(x * 0.5, diff);
  return _sum_fp64(vec2(yn, 0.0), prod);
}

vec2 _sin_taylor_fp64(vec2 a) {
  vec2 r, s, t, x;

  if (a.x == 0.0 && a.y == 0.0) {
    return vec2(0.0, 0.0);
  }

  x = -_mul_fp64(a, a);
  s = a;
  r = a;

  r = _mul_fp64(r, x);
  t = _mul_fp64(r, INVERSE_FACTORIAL_3);
  s = _sum_fp64(s, t);

  r = _mul_fp64(r, x);
  t = _mul_fp64(r, INVERSE_FACTORIAL_5);
  s = _sum_fp64(s, t);

  r = _mul_fp64(r, x);
  t = _mul_fp64(r, INVERSE_FACTORIAL_7);
  s = _sum_fp64(s, t);

  r = _mul_fp64(r, x);
  t = _mul_fp64(r, INVERSE_FACTORIAL_9);
  s = _sum_fp64(s, t);

  return s;
}

void _sincos_taylor_fp64(vec2 a, out vec2 sin_t, out vec2 cos_t) {
  if (a.x == 0.0 && a.y == 0.0) {
    sin_t = vec2(0.0, 0.0);
    cos_t = vec2(1.0, 0.0);
  }
  sin_t = _sin_taylor_fp64(a);
  cos_t = _sqrt_fp64(_sub_fp64(vec2(1.0, 0.0), _mul_fp64(sin_t, sin_t)));
}

vec2 _tan_fp64(vec2 a) {
    vec2 sin_a;
    vec2 cos_a;

    if (a.x == 0.0 && a.y == 0.0) {
        return vec2(0.0, 0.0);
    }

    // 2pi range reduction
    vec2 z = _nint_fp64(_div_fp64(a, _TWO_PI));
    vec2 r = _sub_fp64(a, _mul_fp64(_TWO_PI, z));

    vec2 t;
    float q = floor(r.x / PI_2.x + 0.5);
    int j = int(q);

    if (j < -2 || j > 2) {
        return vec2(0.0 / 0.0, 0.0 / 0.0);
    }

    t = _sub_fp64(r, _mul_fp64(PI_2, vec2(q, 0.0)));

    q = floor(t.x / PI_16.x + 0.5);
    int k = int(q);
    int abs_k = int(abs(float(k)));

    // We just can't get PI/16 * 3.0 very accurately.
    // so let's just store it
    if (abs_k > 4) {
        return vec2(0.0 / 0.0, 0.0 / 0.0);
    } else if (k == 3) {
        t = _sub_fp64(t, PI_16_3);
    } else if (k == -3) {
        t = _sum_fp64(t, PI_16_3);
    } else {
        t = _sub_fp64(t, _mul_fp64(PI_16, vec2(q, 0.0)));
    }


    vec2 u = vec2(0.0, 0.0);
    vec2 v = vec2(0.0, 0.0);

    vec2 sin_t, cos_t;
    vec2 s, c;
    _sincos_taylor_fp64(t, sin_t, cos_t);

    if (k == 0) {
        s = sin_t;
        c = cos_t;
    } else {
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
        if (k > 0) {
            s = _sum_fp64(_mul_fp64(u, sin_t), _mul_fp64(v, cos_t));
            c = _sub_fp64(_mul_fp64(u, cos_t), _mul_fp64(v, sin_t));
        } else {
            s = _sub_fp64(_mul_fp64(u, sin_t), _mul_fp64(v, cos_t));
            c = _sum_fp64(_mul_fp64(u, cos_t), _mul_fp64(v, sin_t));
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
    return _div_fp64(sin_a, cos_a);
}
#endif

//
// Scaling offsets
//

float scale(float meters) {
  return meters * projectionPixelsPerUnit.x;
}

vec2 scale(vec2 meters) {
  return vec2(
    meters.x * projectionPixelsPerUnit.x,
    meters.y * projectionPixelsPerUnit.x
  );
}

vec3 scale(vec3 meters) {
  return vec3(
    meters.x * projectionPixelsPerUnit.x,
    meters.y * projectionPixelsPerUnit.x,
    meters.z * projectionPixelsPerUnit.x
  );
}

vec4 scale(vec4 meters) {
  return vec4(
    meters.x * projectionPixelsPerUnit.x,
    meters.y * projectionPixelsPerUnit.x,
    meters.z * projectionPixelsPerUnit.x,
    meters.w
  );
}

//
// Projecting positions
//

// non-linear projection: lnglats => unit tile [0-1, 0-1]
vec2 mercatorProject(vec2 lnglat) {
  return vec2(
    radians(lnglat.x) + PI,
#ifdef INTEL_TAN_WORKAROUND
        PI - log(_tan_fp64(vec2(PI * 0.25 + radians(lnglat.y) * 0.5, 0.0)).x)
#else
        PI - log(tan(PI * 0.25 + radians(lnglat.y) * 0.5))
#endif
  );
}

vec2 preproject(vec2 position) {
  if (projectionMode == PROJECT_LINEAR) {
    return (position + vec2(TILE_SIZE / 2.0)) * projectionScale;
  }
  if (projectionMode == PROJECT_MERCATOR_OFFSETS) {
    return scale(position) + projectionCenter;
  }
  // projectionMode == PROJECT_MERCATOR
  return mercatorProject(position) * WORLD_SCALE * projectionScale;
}

vec3 preproject(vec3 position) {
  return vec3(preproject(position.xy), scale(position.z) + .1);
}

vec4 preproject(vec4 position) {
  return vec4(preproject(position.xyz), position.w);
}

//

vec4 project(vec4 position) {
  if (projectionMode == PROJECT_LINEAR) {
    return projectionMatrix * position;
  }
  if (projectionMode == PROJECT_MERCATOR_OFFSETS) {
    return projectionMatrixUncentered * position;
  }
  // projectionMode == PROJECT_MERCATOR
  return projectionMatrix * position;
}
