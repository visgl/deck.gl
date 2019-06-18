export default `
#define SHADER_NAME bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uBitmap0;
uniform sampler2D uBitmap1;
uniform sampler2D uBitmap2;
uniform sampler2D uBitmap3;
uniform sampler2D uBitmap4;
uniform sampler2D uBitmap5;
uniform sampler2D uBitmap6;
uniform sampler2D uBitmap7;
uniform sampler2D uBitmap8;
uniform sampler2D uBitmap9;
uniform sampler2D uBitmap10;

varying vec2 vTexCoord;
varying float vBitmapIndex;
varying vec4 vPickingColor;
varying vec4 vInstanceColor;

uniform float desaturate;
uniform vec4 transparentColor;
uniform vec3 tintColor;
uniform float opacity;

// apply desaturation
vec3 color_desaturate(vec3 color) {
  float luminance = (color.r + color.g + color.b) * 0.333333333;
  return mix(color, vec3(luminance), desaturate);
}

// apply tint
vec3 color_tint(vec3 color) {
  return color * tintColor / 255.0;
}

// blend with background color
vec4 apply_opacity(vec3 color, float alpha) {
  return mix(transparentColor / 255.0, vec4(color, 1.0), alpha);
}

void main(void) {
  vec4 bitmapColor;

  if (vBitmapIndex == float(1)) {
    bitmapColor = texture2D(uBitmap1, vTexCoord);
  } else if (vBitmapIndex == float(2)) {
    bitmapColor = texture2D(uBitmap2, vTexCoord);
  } else if (vBitmapIndex == float(3)) {
    bitmapColor = texture2D(uBitmap3, vTexCoord);
  } else if (vBitmapIndex == float(4)) {
    bitmapColor = texture2D(uBitmap4, vTexCoord);
  } else if (vBitmapIndex == float(5)) {
    bitmapColor = texture2D(uBitmap5, vTexCoord);
  } else if (vBitmapIndex == float(6)) {
    bitmapColor = texture2D(uBitmap6, vTexCoord);
  } else if (vBitmapIndex == float(7)) {
    bitmapColor = texture2D(uBitmap7, vTexCoord);
  } else if (vBitmapIndex == float(8)) {
    bitmapColor = texture2D(uBitmap8, vTexCoord);
  } else if (vBitmapIndex == float(9)) {
    bitmapColor = texture2D(uBitmap9, vTexCoord);
  } else if (vBitmapIndex == float(10)) {
    bitmapColor = texture2D(uBitmap10, vTexCoord);
  } else {
    bitmapColor = texture2D(uBitmap0, vTexCoord);
  }

  if (bitmapColor == vec4(0., 0., 0., 1.)) {
    discard;
  }

  gl_FragColor = apply_opacity(color_tint(color_desaturate(bitmapColor.rgb)), bitmapColor.a * opacity);
}
`;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaXRtYXAtbGF5ZXIvYml0bWFwLWxheWVyLWZyYWdtZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGVBQWdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FBaEIiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBgXG4jZGVmaW5lIFNIQURFUl9OQU1FIGJpdG1hcC1sYXllci1mcmFnbWVudC1zaGFkZXJcblxuI2lmZGVmIEdMX0VTXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XG4jZW5kaWZcblxudW5pZm9ybSBzYW1wbGVyMkQgdUJpdG1hcDA7XG51bmlmb3JtIHNhbXBsZXIyRCB1Qml0bWFwMTtcbnVuaWZvcm0gc2FtcGxlcjJEIHVCaXRtYXAyO1xudW5pZm9ybSBzYW1wbGVyMkQgdUJpdG1hcDM7XG51bmlmb3JtIHNhbXBsZXIyRCB1Qml0bWFwNDtcbnVuaWZvcm0gc2FtcGxlcjJEIHVCaXRtYXA1O1xudW5pZm9ybSBzYW1wbGVyMkQgdUJpdG1hcDY7XG51bmlmb3JtIHNhbXBsZXIyRCB1Qml0bWFwNztcbnVuaWZvcm0gc2FtcGxlcjJEIHVCaXRtYXA4O1xudW5pZm9ybSBzYW1wbGVyMkQgdUJpdG1hcDk7XG51bmlmb3JtIHNhbXBsZXIyRCB1Qml0bWFwMTA7XG5cbnZhcnlpbmcgdmVjMiB2VGV4Q29vcmQ7XG52YXJ5aW5nIGZsb2F0IHZCaXRtYXBJbmRleDtcbnZhcnlpbmcgdmVjNCB2UGlja2luZ0NvbG9yO1xudmFyeWluZyB2ZWM0IHZJbnN0YW5jZUNvbG9yO1xuXG51bmlmb3JtIGZsb2F0IGRlc2F0dXJhdGU7XG51bmlmb3JtIHZlYzQgdHJhbnNwYXJlbnRDb2xvcjtcbnVuaWZvcm0gdmVjMyB0aW50Q29sb3I7XG51bmlmb3JtIGZsb2F0IG9wYWNpdHk7XG5cbi8vIGFwcGx5IGRlc2F0dXJhdGlvblxudmVjMyBjb2xvcl9kZXNhdHVyYXRlKHZlYzMgY29sb3IpIHtcbiAgZmxvYXQgbHVtaW5hbmNlID0gKGNvbG9yLnIgKyBjb2xvci5nICsgY29sb3IuYikgKiAwLjMzMzMzMzMzMztcbiAgcmV0dXJuIG1peChjb2xvciwgdmVjMyhsdW1pbmFuY2UpLCBkZXNhdHVyYXRlKTtcbn1cblxuLy8gYXBwbHkgdGludFxudmVjMyBjb2xvcl90aW50KHZlYzMgY29sb3IpIHtcbiAgcmV0dXJuIGNvbG9yICogdGludENvbG9yIC8gMjU1LjA7XG59XG5cbi8vIGJsZW5kIHdpdGggYmFja2dyb3VuZCBjb2xvclxudmVjNCBhcHBseV9vcGFjaXR5KHZlYzMgY29sb3IsIGZsb2F0IGFscGhhKSB7XG4gIHJldHVybiBtaXgodHJhbnNwYXJlbnRDb2xvciAvIDI1NS4wLCB2ZWM0KGNvbG9yLCAxLjApLCBhbHBoYSk7XG59XG5cbnZvaWQgbWFpbih2b2lkKSB7XG4gIHZlYzQgYml0bWFwQ29sb3I7XG5cbiAgaWYgKHZCaXRtYXBJbmRleCA9PSBmbG9hdCgxKSkge1xuICAgIGJpdG1hcENvbG9yID0gdGV4dHVyZTJEKHVCaXRtYXAxLCB2VGV4Q29vcmQpO1xuICB9IGVsc2UgaWYgKHZCaXRtYXBJbmRleCA9PSBmbG9hdCgyKSkge1xuICAgIGJpdG1hcENvbG9yID0gdGV4dHVyZTJEKHVCaXRtYXAyLCB2VGV4Q29vcmQpO1xuICB9IGVsc2UgaWYgKHZCaXRtYXBJbmRleCA9PSBmbG9hdCgzKSkge1xuICAgIGJpdG1hcENvbG9yID0gdGV4dHVyZTJEKHVCaXRtYXAzLCB2VGV4Q29vcmQpO1xuICB9IGVsc2UgaWYgKHZCaXRtYXBJbmRleCA9PSBmbG9hdCg0KSkge1xuICAgIGJpdG1hcENvbG9yID0gdGV4dHVyZTJEKHVCaXRtYXA0LCB2VGV4Q29vcmQpO1xuICB9IGVsc2UgaWYgKHZCaXRtYXBJbmRleCA9PSBmbG9hdCg1KSkge1xuICAgIGJpdG1hcENvbG9yID0gdGV4dHVyZTJEKHVCaXRtYXA1LCB2VGV4Q29vcmQpO1xuICB9IGVsc2UgaWYgKHZCaXRtYXBJbmRleCA9PSBmbG9hdCg2KSkge1xuICAgIGJpdG1hcENvbG9yID0gdGV4dHVyZTJEKHVCaXRtYXA2LCB2VGV4Q29vcmQpO1xuICB9IGVsc2UgaWYgKHZCaXRtYXBJbmRleCA9PSBmbG9hdCg3KSkge1xuICAgIGJpdG1hcENvbG9yID0gdGV4dHVyZTJEKHVCaXRtYXA3LCB2VGV4Q29vcmQpO1xuICB9IGVsc2UgaWYgKHZCaXRtYXBJbmRleCA9PSBmbG9hdCg4KSkge1xuICAgIGJpdG1hcENvbG9yID0gdGV4dHVyZTJEKHVCaXRtYXA4LCB2VGV4Q29vcmQpO1xuICB9IGVsc2UgaWYgKHZCaXRtYXBJbmRleCA9PSBmbG9hdCg5KSkge1xuICAgIGJpdG1hcENvbG9yID0gdGV4dHVyZTJEKHVCaXRtYXA5LCB2VGV4Q29vcmQpO1xuICB9IGVsc2UgaWYgKHZCaXRtYXBJbmRleCA9PSBmbG9hdCgxMCkpIHtcbiAgICBiaXRtYXBDb2xvciA9IHRleHR1cmUyRCh1Qml0bWFwMTAsIHZUZXhDb29yZCk7XG4gIH0gZWxzZSB7XG4gICAgYml0bWFwQ29sb3IgPSB0ZXh0dXJlMkQodUJpdG1hcDAsIHZUZXhDb29yZCk7XG4gIH1cblxuICBpZiAoYml0bWFwQ29sb3IgPT0gdmVjNCgwLiwgMC4sIDAuLCAxLikpIHtcbiAgICBkaXNjYXJkO1xuICB9XG5cbiAgZ2xfRnJhZ0NvbG9yID0gYXBwbHlfb3BhY2l0eShjb2xvcl90aW50KGNvbG9yX2Rlc2F0dXJhdGUoYml0bWFwQ29sb3IucmdiKSksIGJpdG1hcENvbG9yLmEgKiBvcGFjaXR5KTtcbn1cbmA7XG4iXX0=