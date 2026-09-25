// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule, ShaderPlugin} from '@luma.gl/shadertools';
import {terrainModule, TERRAIN_MODE, type TerrainModuleProps} from './shader-module';

// RGBA8 stores the four bytes of an IEEE float. This preserves elevation precision without
// requiring optional float32 filtering or blending. Interpolation happens after decoding.
const source = /* wgsl */ `
${Object.entries(TERRAIN_MODE)
  .map(([key, value]) => `const TERRAIN_MODE_${key}: f32 = ${value}.0;`)
  .join('\n')}

struct TerrainUniforms {
  mode: f32,
  bounds: vec4<f32>,
  heightRange: vec2<f32>,
};
@group(0) @binding(auto) var<uniform> terrain: TerrainUniforms;
@group(0) @binding(auto) var terrain_map: texture_2d<f32>;

fn terrain_globe_to_mercator(position: vec3<f32>) -> vec2<f32> {
  let sinLat = clamp(position.z / length(position), -0.999998, 0.999998);
  return (vec2<f32>(atan2(position.x, -position.y), atanh(sinLat)) + PI) * WORLD_SCALE;
}

fn terrain_encode_height(height: f32) -> vec4<f32> {
  let bits = bitcast<u32>(height);
  return vec4<f32>(vec4<u32>(bits, bits >> 8u, bits >> 16u, bits >> 24u) & vec4<u32>(255u)) / 255.0;
}

fn terrain_decode_height(pixel: vec4<f32>) -> f32 {
  let bytes = vec4<u32>(round(pixel * 255.0));
  return bitcast<f32>(bytes.x | (bytes.y << 8u) | (bytes.z << 16u) | (bytes.w << 24u));
}

fn terrain_load_height(pixel: vec2<i32>) -> f32 {
  let dimensions = vec2<i32>(textureDimensions(terrain_map));
  return terrain_decode_height(textureLoad(terrain_map, clamp(pixel, vec2<i32>(0), dimensions - 1), 0));
}

fn terrain_sample_height(uv: vec2<f32>) -> f32 {
  // WebGPU render textures have their origin at the top left.
  let pixel = vec2<f32>(uv.x, 1.0 - uv.y) * vec2<f32>(textureDimensions(terrain_map)) - 0.5;
  let base = vec2<i32>(floor(pixel));
  let weight = fract(pixel);
  let a = terrain_load_height(base);
  let b = terrain_load_height(base + vec2<i32>(1, 0));
  let c = terrain_load_height(base + vec2<i32>(0, 1));
  let d = terrain_load_height(base + vec2<i32>(1, 1));
  return mix(mix(a, b, weight.x), mix(c, d, weight.x), weight.y);
}

fn terrain_get_height(commonPosition: vec3<f32>) -> f32 {
  let uv = (commonPosition.xy - terrain.bounds.xy) / terrain.bounds.zw;
  if (all(uv >= vec2<f32>(0.0)) && all(uv <= vec2<f32>(1.0))) {
    return terrain_sample_height(uv);
  }
  return 0.0;
}
`;

export const terrainModuleWGSL = {
  name: terrainModule.name,
  dependencies: terrainModule.dependencies,
  source,
  uniformTypes: {...terrainModule.uniformTypes, heightRange: 'vec2<f32>'},
  getUniforms: (opts: Partial<TerrainModuleProps> = {}) => ({
    ...terrainModule.getUniforms(opts),
    heightRange: opts.heightMapRange || [0, 1]
  })
} as const satisfies ShaderModule;

export const terrainPlugin: ShaderPlugin = {
  name: terrainModule.name,
  wgsl: {
    varyings: {
      terrainHeight: {type: 'f32'}
    },
    injections: [
      {
        target: 'vs:deckgl_filter_position',
        injection: /* wgsl */ `
  let commonPos = geometry.position.xyz;
  var terrainMercPos = commonPos.xy;
  terrainHeight = commonPos.z + project.commonOrigin.z;
  if (project.projectionMode == PROJECTION_MODE_GLOBE) {
    terrainMercPos = terrain_globe_to_mercator(commonPos);
    terrainHeight = length(commonPos) - GLOBE_RADIUS;
  }
  if (terrain.mode == TERRAIN_MODE_SKIP) {
    *position = vec4<f32>(0.0);
  } else if (terrain.mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
    let uv = (terrainMercPos - terrain.bounds.xy) / terrain.bounds.zw;
    // Higher surfaces win independently of draw order, including below sea level.
    let depth = (terrain.heightRange.y - terrainHeight) / (terrain.heightRange.y - terrain.heightRange.x);
    *position = vec4<f32>(uv * 2.0 - 1.0, depth, 1.0);
  } else if (terrain.mode == TERRAIN_MODE_USE_HEIGHT_MAP) {
    let anchor = project_position_vec3_f32(vec3<f32>(geometry.worldPosition.xy, 0.0));
    var anchorMerc = anchor;
    var offset = vec3<f32>(0.0, 0.0, 1.0);
    if (project.projectionMode == PROJECTION_MODE_GLOBE) {
      anchorMerc = vec3<f32>(terrain_globe_to_mercator(anchor), 0.0);
      offset = normalize(commonPos) * cos(radians(geometry.worldPosition.y)) * PI;
    }
    let height = terrain_get_height(anchorMerc);
    *position = project_common_position_to_clipspace(geometry.position + vec4<f32>(offset * height, 0.0));
  }
`
      },
      {
        target: 'fs:#main-start',
        injection: /* wgsl */ `
  if (terrain.mode == TERRAIN_MODE_SKIP) { discard; }
  if (terrain.mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
    return terrain_encode_height(terrainHeight);
  }
`
      }
    ]
  }
};
