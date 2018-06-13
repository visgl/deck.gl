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
