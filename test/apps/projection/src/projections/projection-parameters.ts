import type {ShaderModule} from '@luma.gl/shadertools';

export type AlbersProjectionUniforms = {
  outputParameters: readonly [number, number, number, number];
  thetaParameters: readonly [number, number, number, number];
};

export type ConicProjectionUniforms = {
  outputParameters: readonly [number, number, number, number];
  thetaParameters: readonly [number, number, number, number];
};

export type StereographicProjectionUniforms = {
  projectionParameters: readonly [number, number, number, number];
  coordinateParameters: readonly [number, number, number, number];
};

const glslAlbersProjectionUniformBlock = /* glsl */ `\
layout(std140) uniform albersProjectionUniforms {
  uvec4 outputParameters;
  uvec4 thetaParameters;
} albersProjection;
`;

const wgslAlbersProjectionUniformBlock = /* wgsl */ `\
struct AlbersProjectionUniforms {
  outputParameters: vec4<u32>,
  thetaParameters: vec4<u32>,
};

@group(0) @binding(auto) var<uniform> albersProjection: AlbersProjectionUniforms;
`;

const glslConicProjectionUniformBlock = /* glsl */ `\
layout(std140) uniform conicProjectionUniforms {
  uvec4 outputParameters;
  uvec4 thetaParameters;
} conicProjection;
`;

const wgslConicProjectionUniformBlock = /* wgsl */ `\
struct ConicProjectionUniforms {
  outputParameters: vec4<u32>,
  thetaParameters: vec4<u32>,
};

@group(0) @binding(auto) var<uniform> conicProjection: ConicProjectionUniforms;
`;

const glslStereographicProjectionUniformBlock = /* glsl */ `\
layout(std140) uniform stereographicProjectionUniforms {
  vec4 projectionParameters;
  uvec4 coordinateParameters;
} stereographicProjection;
`;

const wgslStereographicProjectionUniformBlock = /* wgsl */ `\
struct StereographicProjectionUniforms {
  projectionParameters: vec4<f32>,
  coordinateParameters: vec4<u32>,
};

@group(0) @binding(auto) var<uniform> stereographicProjection: StereographicProjectionUniforms;
`;

export const albersProjectionParameters: ShaderModule<
  AlbersProjectionUniforms,
  AlbersProjectionUniforms
> = {
  name: 'albersProjection',
  bindingLayout: [{name: 'albersProjection', group: 0}],
  source: wgslAlbersProjectionUniformBlock,
  vs: glslAlbersProjectionUniformBlock,
  getUniforms: props => props,
  uniformTypes: {
    outputParameters: 'vec4<u32>',
    thetaParameters: 'vec4<u32>'
  }
};

export const conicProjectionParameters: ShaderModule<
  ConicProjectionUniforms,
  ConicProjectionUniforms
> = {
  name: 'conicProjection',
  bindingLayout: [{name: 'conicProjection', group: 0}],
  source: wgslConicProjectionUniformBlock,
  vs: glslConicProjectionUniformBlock,
  getUniforms: props => props,
  uniformTypes: {
    outputParameters: 'vec4<u32>',
    thetaParameters: 'vec4<u32>'
  }
};

export const stereographicProjectionParameters: ShaderModule<
  StereographicProjectionUniforms,
  StereographicProjectionUniforms
> = {
  name: 'stereographicProjection',
  bindingLayout: [{name: 'stereographicProjection', group: 0}],
  source: wgslStereographicProjectionUniformBlock,
  vs: glslStereographicProjectionUniformBlock,
  getUniforms: props => props,
  uniformTypes: {
    projectionParameters: 'vec4<f32>',
    coordinateParameters: 'vec4<u32>'
  }
};
