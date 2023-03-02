/**
 * Pack the top 12 bits of two normalized floats into 3 8-bit (rgb) values
 * This enables addressing 4096x4096 individual pixels
 *
 * returns vec3 encoded RGB colors
 *  result.r - top 8 bits of u
 *  result.g - top 8 bits of v
 *  result.b - next 4 bits of u and v: (u + v * 16)
 */
const packUVsIntoRGB = `
vec3 packUVsIntoRGB(vec2 uv) {
  // Extract the top 8 bits. We want values to be truncated down so we can add a fraction
  vec2 uv8bit = floor(uv * 256.);

  // Calculate the normalized remainders of u and v parts that do not fit into 8 bits
  // Scale and clamp to 0-1 range
  vec2 uvFraction = fract(uv * 256.);
  vec2 uvFraction4bit = floor(uvFraction * 16.);

  // Remainder can be encoded in blue channel, encode as 4 bits for pixel coordinates
  float fractions = uvFraction4bit.x + uvFraction4bit.y * 16.;

  return vec3(uv8bit, fractions) / 255.;
}
`;

export default `
#define SHADER_NAME bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D bitmapTexture;

varying vec2 vTexCoord;
varying vec2 vTexPos;

uniform float desaturate;
uniform vec4 transparentColor;
uniform vec3 tintColor;
uniform float opacity;

uniform float coordinateConversion;
uniform vec4 bounds;

/* projection utils */
const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / PI / 2.0;

// from degrees to Web Mercator
vec2 lnglat_to_mercator(vec2 lnglat) {
  float x = lnglat.x;
  float y = clamp(lnglat.y, -89.9, 89.9);
  return vec2(
    radians(x) + PI,
    PI + log(tan(PI * 0.25 + radians(y) * 0.5))
  ) * WORLD_SCALE;
}

// from Web Mercator to degrees
vec2 mercator_to_lnglat(vec2 xy) {
  xy /= WORLD_SCALE;
  return degrees(vec2(
    xy.x - PI,
    atan(exp(xy.y - PI)) * 2.0 - PI * 0.5
  ));
}
/* End projection utils */

// apply desaturation
vec3 color_desaturate(vec3 color) {
  float luminance = (color.r + color.g + color.b) * 0.333333333;
  return mix(color, vec3(luminance), desaturate);
}

// apply tint
vec3 color_tint(vec3 color) {
  return color * tintColor;
}

// blend with background color
vec4 apply_opacity(vec3 color, float alpha) {
  if (transparentColor.a == 0.0) {
    return vec4(color, alpha);
  }
  float blendedAlpha = alpha + transparentColor.a * (1.0 - alpha);
  float highLightRatio = alpha / blendedAlpha;
  vec3 blendedRGB = mix(transparentColor.rgb, color, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

vec2 getUV(vec2 pos) {
  return vec2(
    (pos.x - bounds[0]) / (bounds[2] - bounds[0]),
    (pos.y - bounds[3]) / (bounds[1] - bounds[3])
  );
}

${packUVsIntoRGB}

void main(void) {
  vec2 uv = vTexCoord;
  if (coordinateConversion < -0.5) {
    vec2 lnglat = mercator_to_lnglat(vTexPos);
    uv = getUV(lnglat);
  } else if (coordinateConversion > 0.5) {
    vec2 commonPos = lnglat_to_mercator(vTexPos);
    uv = getUV(commonPos);
  }
  vec4 bitmapColor = texture2D(bitmapTexture, uv);

  gl_FragColor = apply_opacity(color_tint(color_desaturate(bitmapColor.rgb)), bitmapColor.a * opacity);

  geometry.uv = uv;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);

  if (picking_uActive && !picking_uAttribute) {
    // Since instance information is not used, we can use picking color for pixel index
    gl_FragColor.rgb = packUVsIntoRGB(uv);
  }
}
`;
