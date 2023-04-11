/* eslint-disable camelcase */

import {project} from '@deck.gl/core';
import type {_ShaderModule as ShaderModule} from '@deck.gl/core';

import type {Texture2D} from '@luma.gl/core';
import type {Bounds} from '../utils/projection-utils';
import type {TerrainCover} from './terrain-cover';

/** Module parameters expected by the terrain shader module */
export type TerrainModuleSettings = {
  pickingActive?: boolean;
  heightMap: Texture2D | null;
  heightMapBounds?: Bounds | null;
  dummyHeightMap: Texture2D;
  terrainCover?: TerrainCover | null;
  drawToTerrainHeightMap?: boolean;
  useTerrainHeightMap?: boolean;
  terrainSkipRender?: boolean;
};

/** A model can have one of the following modes */
export const TERRAIN_MODE = {
  NONE: 0,
  /** A terrain layer rendering encoded ground elevation into the height map */
  WRITE_HEIGHT_MAP: 1,
  /** An offset layer reading encoded ground elevation from the height map */
  USE_HEIGHT_MAP: 2,
  /** A terrain layer rendering to screen, using the cover fbo overlaid with its own texture */
  USE_COVER: 3,
  /** A terrain layer rendering to screen, using the cover fbo as texture */
  USE_COVER_ONLY: 4,
  /** Draped layer is rendered into a texture, and never to screen */
  SKIP: 5
};

const TERRAIN_MODE_CONSTANTS = Object.keys(TERRAIN_MODE)
  .map(key => `const float TERRAIN_MODE_${key} = ${TERRAIN_MODE[key]}.0;`)
  .join('\n');

export const terrainModule = {
  name: 'terrain',
  dependencies: [project],
  inject: {
    'vs:#decl': `
uniform float terrain_mode;
uniform sampler2D terrain_map;
uniform vec4 terrain_bounds;
varying vec3 commonPos;
${TERRAIN_MODE_CONSTANTS}
    `,
    'vs:#main-start': `
if (terrain_mode == TERRAIN_MODE_SKIP) {
  gl_Position = vec4(0.0);
  return;
}
`,
    'vs:DECKGL_FILTER_GL_POSITION': `
commonPos = geometry.position.xyz;
if (terrain_mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
  vec2 texCoords = (commonPos.xy - terrain_bounds.xy) / terrain_bounds.zw;
  position = vec4(texCoords * 2.0 - 1.0, 0.0, 1.0);
  commonPos.z += project_uCommonOrigin.z;
}
if (terrain_mode == TERRAIN_MODE_USE_HEIGHT_MAP) {
  vec3 anchor = geometry.worldPosition;
  anchor.z = 0.0;
  vec3 anchorCommon = project_position(anchor);
  vec2 texCoords = (anchorCommon.xy - terrain_bounds.xy) / terrain_bounds.zw;
  if (texCoords.x >= 0.0 && texCoords.y >= 0.0 && texCoords.x <= 1.0 && texCoords.y <= 1.0) {
    float terrainZ = texture2D(terrain_map, texCoords).r;
    geometry.position.z += terrainZ;
    position = project_common_position_to_clipspace(geometry.position);
  }
}
    `,
    'fs:#decl': `
uniform float terrain_mode;
uniform sampler2D terrain_map;
uniform vec4 terrain_bounds;
varying vec3 commonPos;
${TERRAIN_MODE_CONSTANTS}
    `,
    'fs:#main-start': `
if (terrain_mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
  gl_FragColor = vec4(commonPos.z, 0.0, 0.0, 1.0);
  return;
}
    `,
    'fs:DECKGL_FILTER_COLOR': `
if ((terrain_mode == TERRAIN_MODE_USE_COVER) || (terrain_mode == TERRAIN_MODE_USE_COVER_ONLY)) {
  vec2 texCoords = (commonPos.xy - terrain_bounds.xy) / terrain_bounds.zw;
  vec4 pixel = texture2D(terrain_map, texCoords);
  if (terrain_mode == TERRAIN_MODE_USE_COVER_ONLY) {
    color = pixel;
  } else {
    // pixel is premultiplied
    color = pixel + color * (1.0 - pixel.a);
  }
  return;
}
    `
  },
  // eslint-disable-next-line complexity
  getUniforms: (opts = {}, uniforms) => {
    if ('dummyHeightMap' in opts) {
      const {
        drawToTerrainHeightMap,
        heightMap,
        heightMapBounds,
        dummyHeightMap,
        terrainCover,
        useTerrainHeightMap,
        terrainSkipRender
      } = opts;
      const {project_uCommonOrigin} = uniforms;

      let mode: number = terrainSkipRender ? TERRAIN_MODE.SKIP : TERRAIN_MODE.NONE;
      // height map if case USE_HEIGHT_MAP, terrain cover if USE_COVER, otherwise empty
      let sampler: Texture2D = dummyHeightMap;
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
        const isPicking = opts.pickingActive;
        sampler = isPicking
          ? terrainCover.getPickingFramebuffer()
          : terrainCover.getRenderFramebuffer();
        if (isPicking) {
          // Never render the layer itself in picking pass
          mode = TERRAIN_MODE.SKIP;
        }
        if (sampler) {
          mode = mode === TERRAIN_MODE.SKIP ? TERRAIN_MODE.USE_COVER_ONLY : TERRAIN_MODE.USE_COVER;
          bounds = terrainCover.bounds;
        } else {
          sampler = dummyHeightMap;
        }
      }

      /* eslint-disable camelcase */
      return {
        terrain_mode: mode,
        terrain_map: sampler,
        // Convert bounds to the common space, as [minX, minY, width, height]
        terrain_bounds: bounds
          ? [
              bounds[0] - project_uCommonOrigin[0],
              bounds[1] - project_uCommonOrigin[1],
              bounds[2] - bounds[0],
              bounds[3] - bounds[1]
            ]
          : [0, 0, 0, 0]
      };
    }
    return null;
  }
} as ShaderModule<TerrainModuleSettings>;
