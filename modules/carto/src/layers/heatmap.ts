// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderPass} from '@luma.gl/shadertools';
import {Texture} from '@luma.gl/core';

/**
 * @filter       Heatmap
 * @param radiusPixels Blur radius in pixels, controls smoothness of heatmap
 * @param colorDomain Domain to apply to values prior to applying color scale
 * @param colorTexture 1D RGB lookup texture for color scale
 * @param intensity Multiplier to apply to value
 * @param opacity Output opacity
 */

const fs = /* glsl */ `\
uniform heatmapUniforms {
  vec2 colorDomain;
  vec2 delta;
  float intensity;
  float opacity;
  float radiusPixels;
} heatmap;

uniform sampler2D colorTexture;

vec3 colorGradient(float value) {
  return texture(colorTexture, vec2(value, 0.5)).rgb;
}

const vec3 SHIFT = vec3(1.0, 256.0, 256.0 * 256.0);
const float MAX_VAL = SHIFT.z * 255.0;
const float SCALE = MAX_VAL / 8.0;
vec4 pack(float value) {
  return vec4(mod(vec3(value, floor(value / SHIFT.yz)), 256.0), 255.0) / 255.0;
}
float unpack(vec3 color) {
  return 255.0 * dot(color, SHIFT);
}

vec4 heatmap_sampleColor(sampler2D source, vec2 texSize, vec2 texCoord) {
  bool firstPass = (heatmap.delta.y < 0.5);
  float accumulator = 0.0;

  // Controls quality of heatmap, larger values increase quality at expense of performance
  float SUPPORT = clamp(heatmap.radiusPixels / 2.0, 8.0, 32.0);

  // Gaussian normalization parameters
  float sigma = SUPPORT / 3.0;
  float a = -0.5 / (sigma * sigma);
  float w0 = 0.3989422804014327 / sigma; // 1D normalization
  for (float t = -SUPPORT; t <= SUPPORT; t++) {
    vec2 percent = (t * heatmap.delta - 0.5) / SUPPORT;
    vec2 delta = percent * heatmap.radiusPixels / texSize;
    vec4 offsetColor = texture(source, texCoord + delta);

    // Unpack float
    float value = unpack(offsetColor.rgb);

    // Gaussian
    float weight = w0 * exp(a * t * t);
    
    accumulator += value * weight;
  }

  if (firstPass) {
    return pack(accumulator);
  }

  // Undo scaling to obtain normalized density
  float density = 10.0 * heatmap.intensity * accumulator / SCALE;
 
  // Domain also in normalized density units
  vec2 domain = heatmap.colorDomain;

  // Apply domain
  float f = (density - domain[0]) / (domain[1] - domain[0]);

  // sqrt/log scaling??
  // float f = (log(density) - log(domain[0] + 1.0)) / (log(domain[1] + 1.0) - log(domain[0] + 1.0));
  // f = sqrt(f);

  // Color map
  vec4 color = vec4(0.0);
  color.rgb = colorGradient(f);

  color.a = smoothstep(0.0, 0.1, f);
  color.a = pow(color.a, 1.0 / 2.2);
  color.a *= heatmap.opacity;

  return color;
}
`;

export type HeatmapProps = {
  /**
   * Radius of the heatmap blur in pixels, to which the weight of a cell is distributed.
   *
   * @default 20
   */
  radiusPixels?: number;
  /**
   * Controls how weight values are mapped to the colors in `colorTexture`, as an array of two numbers [`minValue`, `maxValue`].
   *
   * @default [0, 1]
   */
  colorDomain?: [number, number];
  /**
   * Value that is multiplied with the total weight at a pixel to obtain the final weight. A value larger than 1 biases the output color towards the higher end of the spectrum, and a value less than 1 biases the output color towards the lower end of the spectrum.
   */
  intensity?: number;
  /**
   * Color LUT for color gradient
   */
  colorTexture: Texture;
  opacity: number;
};

type PassProps = {
  delta: [number, number];
};

export const heatmap = {
  name: 'heatmap',
  uniformPropTypes: {
    colorDomain: {value: [0, 1]},
    delta: {value: [0, 1]},
    intensity: {value: 1, min: 0.1, max: 10},
    opacity: {value: 1, min: 0, max: 1},
    radiusPixels: {value: 20, min: 0, softMax: 100}
  },
  uniformTypes: {
    colorDomain: 'vec2<f32>',
    delta: 'vec2<f32>',
    intensity: 'f32',
    opacity: 'f32',
    radiusPixels: 'f32'
  },
  // @ts-ignore TODO v9.1
  getUniforms: opts => {
    if (!opts) return {};
    const {
      colorDomain = [0, 1],
      colorTexture,
      delta = [1, 0],
      intensity = 1,
      opacity = 1,
      radiusPixels = 20
    } = opts;
    return {
      colorDomain,
      colorTexture,
      delta,
      intensity,
      opacity,
      radiusPixels
    };
  },
  fs,
  passes: [
    // @ts-expect-error Seems typing in luma.gl should be Partial<>
    {sampler: true, uniforms: {delta: [1, 0]}},
    // @ts-expect-error Seems typing in luma.gl should be Partial<>
    {sampler: true, uniforms: {delta: [0, 1]}}
  ]
} as const satisfies ShaderPass<HeatmapProps & PassProps>;
