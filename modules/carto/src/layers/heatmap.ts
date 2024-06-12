import type {ShaderPass} from '@luma.gl/shadertools';
import {Color} from '@deck.gl/core';
const glsl = (s: TemplateStringsArray) => `${s}`;

/**
 * @filter       Heatmap
 * @param radiusPixels Blur radius in pixels, controls smoothness of heatmap
 * @param colorDomain Domain to apply to values prior to applying color scale
 * @param color1-6 Colors to use in color scale
 */

const fs = glsl`\
uniform heatmapUniforms {
  vec2 delta;
  float radiusPixels;
  vec2 colorDomain;
  vec3 color1;
  vec3 color2;
  vec3 color3;
  vec3 color4;
  vec3 color5;
  vec3 color6;
  float intensity;
  float opacity;
} heatmap;

const vec4 STOPS = vec4(0.2, 0.4, 0.6, 0.8);

vec3 colorGradient(float value) {
  vec3 c1;
  vec3 c2;
  vec2 range;
  if (value < STOPS.x) {
    range = vec2(0.0, STOPS.x);
    c1 = heatmap.color1; c2 = heatmap.color2;
  } else if (value < STOPS.y) {
    range = STOPS.xy;
    c1 = heatmap.color2; c2 = heatmap.color3;
  } else if (value < STOPS.z) {
    range = STOPS.yz;
    c1 = heatmap.color3; c2 = heatmap.color4;
  } else if (value < STOPS.w) {
    range = STOPS.zw;
    c1 = heatmap.color4; c2 = heatmap.color5;
  } else {
    range = vec2(STOPS.w, 1.0);
    c1 = heatmap.color5; c2 = heatmap.color6;
  }

  float f = (clamp(value, 0.0, 1.0) - range.x) / (range.y - range.x);
  return mix(c1, c2, f) / 255.0;
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

const defaultColorRange: Color[] = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];

export type HeatmapProps = {
  /**
   * Radius of the heatmap blur in pixels, to which the weight of a cell is distributed.
   *
   * @default 20
   */
  radiusPixels?: number;
  /**
   * Controls how weight values are mapped to the `colorRange`, as an array of two numbers [`minValue`, `maxValue`].
   *
   * @default [0, 1]
   */
  colorDomain?: [number, number];
  /**
   * Specified as an array of colors [color1, color2, ...].
   *
   * @default `6-class YlOrRd` - [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6)
   */
  colorRange: Color[];
  /**
   * Value that is multiplied with the total weight at a pixel to obtain the final weight. A value larger than 1 biases the output color towards the higher end of the spectrum, and a value less than 1 biases the output color towards the lower end of the spectrum.
   */
  intensity?: number;
  opacity: number;
};

export type HeatmapUniforms = {
  delta?: [number, number];
  radiusPixels?: number;
  colorDomain?: [number, number];
  color1?: [number, number, number];
  color2?: [number, number, number];
  color3?: [number, number, number];
  color4?: [number, number, number];
  color5?: [number, number, number];
  color6?: [number, number, number];
  intensity: number;
  opacity?: number;
};

export const heatmap: ShaderPass<HeatmapProps, HeatmapUniforms> = {
  name: 'heatmap',
  uniformPropTypes: {
    delta: {value: [0, 1]},
    radiusPixels: {value: 20, min: 0, softMax: 100},
    colorDomain: {value: [0, 1]},
    color1: {value: [0, 0, 0]},
    color2: {value: [0, 0, 0]},
    color3: {value: [0, 0, 0]},
    color4: {value: [0, 0, 0]},
    color5: {value: [0, 0, 0]},
    color6: {value: [0, 0, 0]},
    intensity: {value: 1, min: 0.1, max: 10},
    opacity: {value: 1, min: 0, max: 1}
  },
  uniformTypes: {
    delta: 'vec2<f32>',
    radiusPixels: 'f32',
    colorDomain: 'vec2<f32>',
    color1: 'vec3<f32>',
    color2: 'vec3<f32>',
    color3: 'vec3<f32>',
    color4: 'vec3<f32>',
    color5: 'vec3<f32>',
    color6: 'vec3<f32>',
    intensity: 'f32',
    opacity: 'f32'
  },
  getUniforms: opts => {
    const {
      delta = [1, 0],
      colorRange = defaultColorRange,
      radiusPixels = 20,
      colorDomain = [0, 1],
      intensity = 1,
      opacity = 1
    } = opts as HeatmapProps & {delta: [number, number]};
    const [color1, color2, color3, color4, color5, color6] = colorRange;
    return {
      delta,
      color1,
      color2,
      color3,
      color4,
      color5,
      color6,
      radiusPixels,
      colorDomain,
      intensity,
      opacity
    };
  },
  fs,
  passes: [
    {sampler: true, uniforms: {delta: [1, 0]}},
    {sampler: true, uniforms: {delta: [0, 1]}}
  ]
};
