export default `
#define SHADER_NAME bitmap-layer-fragment-shader

precision highp float;

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
varying float vBitmapType;

uniform float desaturate;

vec4 color_desaturate(vec4 color) {
  float luminance = (color.r + color.g + color.b) * 0.333333333;
  return mix(color, vec4(luminance, luminance, luminance, color.a), desaturate);
}

void main(void) {
  vec4 bitmapColor;

  if (vBitmapType == float(1)) {
    bitmapColor = texture2D(uBitmap1, vTexCoord);
  } else if (vBitmapType == float(2)) {
    bitmapColor = texture2D(uBitmap2, vTexCoord);
  } else if (vBitmapType == float(3)) {
    bitmapColor = texture2D(uBitmap3, vTexCoord);
  } else if (vBitmapType == float(4)) {
    bitmapColor = texture2D(uBitmap4, vTexCoord);
  } else if (vBitmapType == float(5)) {
    bitmapColor = texture2D(uBitmap5, vTexCoord);
  } else if (vBitmapType == float(6)) {
    bitmapColor = texture2D(uBitmap6, vTexCoord);
  } else if (vBitmapType == float(7)) {
    bitmapColor = texture2D(uBitmap7, vTexCoord);
  } else if (vBitmapType == float(8)) {
    bitmapColor = texture2D(uBitmap8, vTexCoord);
  } else if (vBitmapType == float(9)) {
    bitmapColor = texture2D(uBitmap9, vTexCoord);
  } else if (vBitmapType == float(10)) {
    bitmapColor = texture2D(uBitmap10, vTexCoord);
  } else {
    bitmapColor = texture2D(uBitmap0, vTexCoord);
  }

  if (bitmapColor.rgba == vec4(0., 0., 0., 1.)) {
    discard;
  }

  gl_FragColor = color_desaturate(bitmapColor);
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
