import {ShaderModule} from '@luma.gl/shadertools';
const ubo = `\
uniform scatterplotUniforms {
  uniform float radiusScale;
  uniform float radiusMinPixels;
  uniform float radiusMaxPixels;
  uniform float lineWidthScale;
  uniform float lineWidthMinPixels;
  uniform float lineWidthMaxPixels;
  uniform float stroked;
  uniform bool filled;
  uniform bool antialiasing;
  uniform bool billboard;
  uniform highp int radiusUnits;
  uniform highp int lineWidthUnits;
} scatterplot;
`;

export type ScatterplotSettings = {
  opacity?: number;
};

export default {
  name: 'scatterplot',
  vs: ubo,
  fs: ubo,
  uniformTypes: {
    radiusScale: 'f32',
    radiusMinPixels: 'f32',
    radiusMaxPixels: 'f32',
    lineWidthScale: 'f32',
    lineWidthMinPixels: 'f32',
    lineWidthMaxPixels: 'f32',
    stroked: 'f32',
    filled: 'f32',
    antialiasing: 'f32',
    billboard: 'f32',
    radiusUnits: 'i32',
    lineWidthUnits: 'i32'
  }
} as const satisfies ShaderModule<ScatterplotSettings>;
