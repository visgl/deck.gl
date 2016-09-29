#pragma glslify: sub_fp64 = require(./sub-fp64, ONE=ONE)
#pragma glslify: mul_fp64 = require(./mul-fp64, ONE=ONE)
#pragma glslify: sqrt_fp64 = require(./sqrt-fp64, ONE=ONE)
#pragma glslify: sin_taylor_fp64 = require(./sin-taylor-fp64, ONE=ONE)
#pragma glslify: cos_taylor_fp64 = require(./cos-taylor-fp64, ONE=ONE)

void sincos_taylor_fp64(vec2 a, out vec2 sin_t, out vec2 cos_t) {
  if (a.x == 0.0 && a.y == 0.0) {
    sin_t = vec2(0.0, 0.0);
    cos_t = vec2(1.0, 0.0);
  }

  sin_t = sin_taylor_fp64(a);
  cos_t = sqrt_fp64(sub_fp64(vec2(1.0, 0.0), mul_fp64(sin_t, sin_t)));
}
#pragma glslify: export(sincos_taylor_fp64)
