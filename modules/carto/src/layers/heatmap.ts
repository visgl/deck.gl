import type {ShaderPass} from '@luma.gl/shadertools';
import {random} from '@luma.gl/shadertools';
import {colorCategories} from '@deck.gl/carto';
const glsl = (s: TemplateStringsArray) => `${s}`;

/**
 * @filter       Heatmap
 * @param radius Blur radius, controls smoothness of heatmap
 * @param rangeScale Scale factor to apply to values prior to applying color scale
 * @param color1-6 Colors to use in color scale
 */

const fs = glsl`\
uniform heatmapUniforms {
  float radius;
  float rangeScale;
  vec3 color1;
  vec3 color2;
  vec3 color3;
  vec3 color4;
  vec3 color5;
  vec3 color6;
} heatmap;

// Controls quality of heatmap, larger values increase quality at expense of performance
const float SUPPORT = 8.0;
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
  } else if (value < 1.0 ) {
    range = vec2(STOPS.w, 1.0);
    c1 = heatmap.color5; c2 = heatmap.color6;
  } else {
    // Fade out to white
    range = vec2(1.0, 10.0);
    c1 = heatmap.color6; c2 = vec3(1.0);
  }

  float f = (value - range.x) / (range.y - range.x);
  return mix(c1, c2, f);
}

vec4 heatmap_sampleColor(sampler2D source, vec2 texSize, vec2 texCoord) {
  float accumulator = 0.0;
  float total = 0.0;

  /* randomize the lookup values to hide the fixed number of samples */
  float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

  for (float t = -SUPPORT; t <= SUPPORT; t++) {
  for (float s = -SUPPORT; s <= SUPPORT; s++) {
    vec2 percent = (vec2(s, t) + offset - 0.5) / SUPPORT;
    vec2 delta = percent * heatmap.radius / texSize;
    vec4 offsetColor = texture(source, texCoord + delta);

    // Unpack float
    float value = dot(offsetColor.rgb, vec3(1.0, 256.0, 256.0 * 256.0));

    // Gaussian
    float sigma = SUPPORT / 3.0;
    float weight = exp(-0.5 * (s * s + t * t) / (sigma * sigma));
    
    accumulator += value * weight;
    total += weight;
  }
  }

  float value = accumulator / total;
  value /= heatmap.rangeScale;

  // Color map
  vec4 color = vec4(0.0);
  color.rgb = colorGradient(value);
  color.a = 0.8 * smoothstep(0.0, 0.05, value);

  return color;
}
`;

function getPalette(paletteName?: string, rgb = true) {
  const [colors, offsetString] = paletteName ? paletteName.split('-') : ['Prism'];
  const n = 6;
  const offset = parseInt(offsetString || '0');
  const domain = Array(n + offset)
    .fill(0)
    .map((_, i) => i); // [0, 1, ...n]
  const getColor = colorCategories({attr: (c: any) => c.value, domain, colors});
  let palette: number[][] = domain.map(c => ({value: c})).map(getColor as any);

  if (rgb) {
    palette = palette.map(c => c.slice(0, 3).map(v => v / 255));
  }

  return palette.slice(offset);
}

export function getPaletteGradient(paletteName: string) {
  const colors = getPalette(paletteName, false);
  let gradient = 'linear-gradient(90deg,';
  for (let c = 0; c < colors.length; c++) {
    const color = `rgba(${colors[c].join(',')})`;
    const position = Math.round((c / (colors.length - 1)) * 100);
    gradient += `${color} ${position}%,`;
  }

  return `${gradient.slice(0, -1)})`;
}

export type HeatmapProps = {
  radius?: number;
  rangeScale?: number;
  palette?: string;
};

export type HeatmapUniforms = {
  radius?: number;
  rangeScale?: number;
  color1?: [number, number, number];
  color2?: [number, number, number];
  color3?: [number, number, number];
  color4?: [number, number, number];
  color5?: [number, number, number];
  color6?: [number, number, number];
};

export const heatmap: ShaderPass<HeatmapProps, HeatmapUniforms> = {
  name: 'heatmap',
  uniformPropTypes: {
    radius: {value: 20, min: 0, softMax: 100},
    rangeScale: {value: 1, min: 0},
    color1: {value: [0, 0, 0]},
    color2: {value: [0, 0, 0]},
    color3: {value: [0, 0, 0]},
    color4: {value: [0, 0, 0]},
    color5: {value: [0, 0, 0]},
    color6: {value: [0, 0, 0]}
  },
  uniformTypes: {
    radius: 'f32',
    rangeScale: 'f32',
    color1: 'vec3<f32>',
    color2: 'vec3<f32>',
    color3: 'vec3<f32>',
    color4: 'vec3<f32>',
    color5: 'vec3<f32>',
    color6: 'vec3<f32>'
  },
  getUniforms: opts => {
    const {palette, radius = 20, rangeScale = 1} = opts as HeatmapProps;
    const colors = getPalette(palette);
    const [color1, color2, color3, color4, color5, color6] = colors;
    return {
      color1,
      color2,
      color3,
      color4,
      color5,
      color6,
      radius,
      rangeScale
    };
  },
  dependencies: [random],
  fs: fs,
  passes: [{sampler: true}]
};
