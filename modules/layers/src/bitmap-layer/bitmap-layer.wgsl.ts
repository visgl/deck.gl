// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* wgsl */ `\
struct Attributes {
  @location(0) positions: vec3<f32>,
  @location(1) positions64Low: vec3<f32>,
  @location(2) texCoords: vec2<f32>,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vTexCoord: vec2<f32>,
  @location(1) vTexPos: vec2<f32>,
};

// from degrees to Web Mercator
fn lnglat_to_mercator(lnglat: vec2<f32>) -> vec2<f32> {
  let x = lnglat.x;
  let y = clamp(lnglat.y, -89.9, 89.9);
  return vec2<f32>(
    radians(x) + PI,
    PI + log(tan(PI * 0.25 + radians(y) * 0.5))
  ) * WORLD_SCALE;
}

// from Web Mercator to degrees
fn mercator_to_lnglat(xy: vec2<f32>) -> vec2<f32> {
  let position = xy / WORLD_SCALE;
  return degrees(vec2<f32>(
    position.x - PI,
    atan(exp(position.y - PI)) * 2.0 - PI * 0.5
  ));
}

fn color_desaturate(colorValue: vec3<f32>) -> vec3<f32> {
  let luminance = (colorValue.r + colorValue.g + colorValue.b) * 0.333333333;
  return mix(colorValue, vec3<f32>(luminance), bitmap.desaturate);
}

fn color_tint(colorValue: vec3<f32>) -> vec3<f32> {
  return colorValue * bitmap.tintColor;
}

fn apply_opacity(colorValue: vec3<f32>, alpha: f32) -> vec4<f32> {
  if (bitmap.transparentColor.a == 0.0) {
    return vec4<f32>(colorValue, alpha);
  }
  let blendedAlpha = alpha + bitmap.transparentColor.a * (1.0 - alpha);
  let highLightRatio = alpha / blendedAlpha;
  let blendedRGB = mix(bitmap.transparentColor.rgb, colorValue, highLightRatio);
  return vec4<f32>(blendedRGB, blendedAlpha);
}

fn getUV(position: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(
    (position.x - bitmap.bounds[0]) / (bitmap.bounds[2] - bitmap.bounds[0]),
    (position.y - bitmap.bounds[3]) / (bitmap.bounds[1] - bitmap.bounds[3])
  );
}

// Pack the top 12 bits of two normalized floats into three 8-bit values.
fn packUVsIntoRGB(uv: vec2<f32>) -> vec3<f32> {
  let uv8bit = floor(uv * 256.0);
  let uvFraction = fract(uv * 256.0);
  let uvFraction4bit = floor(uvFraction * 16.0);
  let fractions = uvFraction4bit.x + uvFraction4bit.y * 16.0;
  return vec3<f32>(uv8bit, fractions) / 255.0;
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var output: Varyings;
  geometry.worldPosition = attributes.positions;
  geometry.uv = attributes.texCoords;
  geometry.pickingColor = vec3<f32>(1.0, 0.0, 0.0);

  let projectedPosition = project_position_to_clipspace_and_commonspace(
    attributes.positions,
    attributes.positions64Low,
    vec3<f32>(0.0)
  );
  geometry.position = projectedPosition.commonPosition;
  output.position = projectedPosition.clipPosition;
  output.vTexCoord = attributes.texCoords;
  output.vTexPos = vec2<f32>(0.0);

  if (bitmap.coordinateConversion < -0.5) {
    output.vTexPos = geometry.position.xy + project.commonOrigin.xy;
  } else if (bitmap.coordinateConversion > 0.5) {
    output.vTexPos = geometry.worldPosition.xy;
  }

  return output;
}

@fragment
fn fragmentMain(input: Varyings) -> @location(0) vec4<f32> {
  var uv = input.vTexCoord;
  if (bitmap.coordinateConversion < -0.5) {
    uv = getUV(mercator_to_lnglat(input.vTexPos));
  } else if (bitmap.coordinateConversion > 0.5) {
    uv = getUV(lnglat_to_mercator(input.vTexPos));
  }

  let bitmapColor = textureSample(bitmapTexture, bitmapTextureSampler, uv);
  let colorValue = apply_opacity(
    color_tint(color_desaturate(bitmapColor.rgb)),
    bitmapColor.a * layer.opacity
  );

  geometry.uv = uv;

  if (picking.isActive > 0.5 && picking.isAttribute < 0.5) {
    return vec4<f32>(packUVsIntoRGB(uv), 1.0);
  }

  return deckgl_premultiplied_alpha(colorValue);
}
`;
