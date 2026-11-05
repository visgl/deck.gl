// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable camelcase */

import type {ShaderModule, ShaderPlugin} from '@luma.gl/shaders';
import {project, ProjectProps, ProjectUniforms} from '@deck.gl/core';

import type {Texture} from '@luma.gl/core';
import {
  terrainWGSLSource,
  terrainWGSLVertexInjection,
  terrainWGSLFragmentInjection
} from './shader-module.wgsl';
import {isFlatViewport} from '../utils/projection-utils';
import type {Bounds} from '../utils/projection-utils';
import type {TerrainCover} from './terrain-cover';

/** Module parameters expected by the terrain shader module */
export type TerrainModuleProps = {
  project: ProjectProps;
  isPicking: boolean;
  heightMap: Texture | null;
  heightMapBounds?: Bounds | null;
  heightMapRange?: [number, number];
  dummyHeightMap: Texture;
  terrainCover?: TerrainCover | null;
  drawToTerrainHeightMap?: boolean;
  useTerrainHeightMap?: boolean;
  terrainSkipRender?: boolean;
};

type TerrainModuleUniforms = {
  mode: number;
  bounds: [number, number, number, number];
  heightRange: [number, number];
};

type TerrainModuleBindings = {
  terrain_map: Texture;
};

export {TERRAIN_MODE} from './terrain-mode';
import {TERRAIN_MODE} from './terrain-mode';

const TERRAIN_MODE_CONSTANTS = Object.keys(TERRAIN_MODE)
  .map(key => `const float TERRAIN_MODE_${key} = ${TERRAIN_MODE[key]}.0;`)
  .join('\n');

const uniformBlock =
  // eslint-disable-next-line prefer-template
  TERRAIN_MODE_CONSTANTS +
  /* glsl */ `
layout(std140) uniform terrainUniforms {
  float mode;
  vec4 bounds;
  vec2 heightRange;
} terrain;

uniform sampler2D terrain_map;
`;

export const terrainModule = {
  name: 'terrain',
  dependencies: [project],
  source: terrainWGSLSource,
  vs: `${uniformBlock}
out vec3 commonPos;
// In globe mode, absolute Mercator position for terrain FBO UV lookups
out vec2 terrainMercPos;
out float terrainHeight;

vec2 terrain_globe_to_mercator(vec3 globePosition) {
  float D = length(globePosition);
  float sinLat = clamp(globePosition.z / D, -0.999998, 0.999998);
  float x = atan(globePosition.x, -globePosition.y);
  float y = atanh(sinLat);
  return (vec2(x, y) + PI) * WORLD_SCALE;
}

float terrain_globe_latitude_scale(vec3 globePosition) {
  return length(globePosition.xy) / length(globePosition);
}
`,
  fs: `${uniformBlock}in vec2 terrainMercPos;\nin float terrainHeight;`,

  // eslint-disable-next-line complexity
  getUniforms: (opts: Partial<TerrainModuleProps> = {}) => {
    if (!opts.dummyHeightMap) {
      // TerrainEffect has not provided props (e.g. not set up yet, or this pass
      // doesn't include the terrain effect in its effects list)
      return {};
    }

    if ('terrainSkipRender' in opts || 'drawToTerrainHeightMap' in opts) {
      const {
        drawToTerrainHeightMap,
        heightMap,
        heightMapBounds,
        dummyHeightMap,
        terrainCover,
        useTerrainHeightMap,
        terrainSkipRender
      } = opts;
      const projectUniforms = project.getUniforms(opts.project) as ProjectUniforms;
      // Globe sampling uses absolute Mercator positions, not the sphere's common origin.
      const commonOrigin = isFlatViewport(opts.project!.viewport)
        ? projectUniforms.commonOrigin
        : [0, 0, 0];

      let mode: number = terrainSkipRender ? TERRAIN_MODE.SKIP : TERRAIN_MODE.NONE;
      // height map if case USE_HEIGHT_MAP, terrain cover if USE_COVER, otherwise empty
      let sampler: Texture = dummyHeightMap;
      // height map bounds if case USE_HEIGHT_MAP, terrain cover bounds if USE_COVER, otherwise null
      let bounds: number[] | null = null;
      if (drawToTerrainHeightMap) {
        mode = TERRAIN_MODE.WRITE_HEIGHT_MAP;
        bounds = heightMapBounds!;
      } else if (useTerrainHeightMap && heightMap) {
        mode = TERRAIN_MODE.USE_HEIGHT_MAP;
        sampler = heightMap;
        bounds = heightMapBounds!;
      } else if (terrainCover) {
        // This is a terrain layer
        const fbo = opts.isPicking
          ? terrainCover.getPickingFramebuffer()
          : terrainCover.getRenderFramebuffer();
        const coverTexture = fbo?.colorAttachments[0].texture;
        if (opts.isPicking) {
          mode = TERRAIN_MODE.SKIP;
        }
        if (coverTexture) {
          sampler = coverTexture;
          mode = mode === TERRAIN_MODE.SKIP ? TERRAIN_MODE.USE_COVER_ONLY : TERRAIN_MODE.USE_COVER;
          bounds = terrainCover.bounds;
        } else if (opts.isPicking && !terrainSkipRender) {
          // terrain+draw layer without cover FBO: render own picking colors
          mode = TERRAIN_MODE.NONE;
        }
      }

      /* eslint-disable camelcase */
      return {
        mode,
        heightRange: opts.heightMapRange || [0, 1],
        terrain_map: sampler,
        // Convert bounds to common space, as [minX, minY, width, height]
        bounds: bounds
          ? [
              bounds[0] - commonOrigin[0],
              bounds[1] - commonOrigin[1],
              bounds[2] - bounds[0],
              bounds[3] - bounds[1]
            ]
          : [0, 0, 0, 0]
      };
    }
    // No terrain-specific props provided but dummyHeightMap is available
    // (e.g. non-terrain render pass where the effect still provides props).
    // Provide the dummy texture to satisfy the terrain_map binding.
    return {
      mode: TERRAIN_MODE.NONE,
      heightRange: opts.heightMapRange || [0, 1],
      terrain_map: opts.dummyHeightMap,
      bounds: [0, 0, 0, 0]
    };
  },
  uniformTypes: {
    mode: 'f32',
    bounds: 'vec4<f32>',
    heightRange: 'vec2<f32>'
  }
} as const satisfies ShaderModule<TerrainModuleProps, TerrainModuleUniforms, TerrainModuleBindings>;

export const terrainPlugin: ShaderPlugin = {
  name: 'terrain',
  module: terrainModule,
  interStageVariables: {terrainHeightWGSL: {type: 'f32'}},
  injections: {
    'wgsl:vs:DECKGL_FILTER_GL_POSITION': terrainWGSLVertexInjection,
    'wgsl:fs:#main-start': terrainWGSLFragmentInjection,
    'glsl:vs:#main-start': /* glsl */ `
if (terrain.mode == TERRAIN_MODE_SKIP) {
  gl_Position = vec4(0.0);
  return;
}
`,
    'glsl:vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
commonPos = geometry.position.xyz;
terrainHeight = commonPos.z + project.commonOrigin.z;
if ((project.projectionMode == PROJECTION_MODE_GLOBE || project.projectionMode == PROJECTION_MODE_GLOBE_METER_OFFSETS)) {
  terrainMercPos = terrain_globe_to_mercator(commonPos);
  terrainHeight = length(commonPos) - GLOBE_RADIUS;
} else {
  terrainMercPos = commonPos.xy;
}
if (terrain.mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
  vec2 texCoords = (terrainMercPos - terrain.bounds.xy) / terrain.bounds.zw;
  position = vec4(texCoords * 2.0 - 1.0, 0.0, 1.0);
}
if (terrain.mode == TERRAIN_MODE_USE_HEIGHT_MAP) {
  vec3 anchor = geometry.worldPosition;
  anchor.z = 0.0;
  vec3 anchorCommon = project_position(anchor);
  vec2 anchorMercPos = (project.projectionMode == PROJECTION_MODE_GLOBE || project.projectionMode == PROJECTION_MODE_GLOBE_METER_OFFSETS)
    ? terrain_globe_to_mercator(anchorCommon)
    : anchorCommon.xy;
  vec2 texCoords = (anchorMercPos - terrain.bounds.xy) / terrain.bounds.zw;
  if (texCoords.x >= 0.0 && texCoords.y >= 0.0 && texCoords.x <= 1.0 && texCoords.y <= 1.0) {
    float terrainZ = texture(terrain_map, texCoords).r;
    if ((project.projectionMode == PROJECTION_MODE_GLOBE || project.projectionMode == PROJECTION_MODE_GLOBE_METER_OFFSETS)) {
      // Height map is written in Mercator common space (units = TILE_SIZE / EARTH_CIRCUMFERENCE / cos(lat))
      // Convert to globe radial units (units = GLOBE_RADIUS / EARTH_RADIUS)
      terrainZ *= terrain_globe_latitude_scale(anchorCommon) * PI;
      geometry.position.xyz += normalize(geometry.position.xyz) * terrainZ;
    } else {
      geometry.position.z += terrainZ;
    }
    position = project_common_position_to_clipspace(geometry.position);
  }
}
    `,
    'glsl:fs:#main-start': /* glsl */ `
if (terrain.mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
  fragColor = vec4(terrainHeight, 0.0, 0.0, 1.0);
  return;
}
    `,
    'glsl:fs:DECKGL_FILTER_COLOR': /* glsl */ `
if ((terrain.mode == TERRAIN_MODE_USE_COVER) || (terrain.mode == TERRAIN_MODE_USE_COVER_ONLY)) {
  vec2 texCoords = (terrainMercPos - terrain.bounds.xy) / terrain.bounds.zw;
  vec4 pixel = texture(terrain_map, texCoords);
  if (terrain.mode == TERRAIN_MODE_USE_COVER_ONLY) {
    color = pixel;
  } else {
    // pixel is premultiplied
    color = pixel + color * (1.0 - pixel.a);
  }
  return;
}
    `
  }
};
