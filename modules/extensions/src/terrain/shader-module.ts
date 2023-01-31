import type {_ShaderModule as ShaderModule} from '@deck.gl/core';

import type {Texture2D} from '@luma.gl/core';

/** Module parameters expected by the terrain shader module */
export type TerrainModuleSettings = {
  pickingActive?: boolean;
  heightMap: Texture2D | null;
  dummyHeightMap: Texture2D;
  terrainCover: Texture2D | null;
  terrainCoverBounds?: [number[], number[]] | null;
  drawToTerrainHeightMap?: boolean;
  useTerrainHeightMap?: boolean;
  terrainSkipRender?: boolean;
};

/** A model can have one of the following modes */
const TERRAIN_MODE = {
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
  inject: {
    'vs:#decl': `
uniform float terrain_mode;
uniform sampler2D terrain_map;
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
  vec4 p = geometry.position;
  p.z = 0.0;
  position = project_common_position_to_clipspace(p);
}
if (terrain_mode == TERRAIN_MODE_USE_HEIGHT_MAP) {
  vec3 anchor = geometry.worldPosition;
  anchor.z = 0.0;
  vec3 anchorCommon = project_position(anchor);
  vec4 clipPos = project_common_position_to_clipspace(vec4(anchorCommon, 1.0));
  vec2 texCoords = clipPos.xy / clipPos.w / 2.0 + 0.5;
  float terrainZ = texture2D(terrain_map, texCoords).r;
  geometry.position.z += terrainZ;
  position = project_common_position_to_clipspace(geometry.position);
}
    `,
    'fs:#decl': `
uniform float terrain_mode;
uniform sampler2D terrain_map;
uniform vec4 terrain_coverBounds;
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
  vec2 texCoords = (commonPos.xy - terrain_coverBounds.xy) / terrain_coverBounds.zw;
  vec4 pixel = texture2D(terrain_map, texCoords);
  if (terrain_mode == TERRAIN_MODE_USE_COVER_ONLY) {
    color = pixel;
  } else {
    float blendedAlpha = pixel.a + color.a * (1.0 - pixel.a);
    float blendRatio = pixel.a / blendedAlpha;
    vec3 blendedRGB = mix(color.rgb, pixel.rgb, blendRatio);
    color = vec4(blendedRGB, blendedAlpha);
  }
  return;
}
    `
  },
  getUniforms: (opts = {}) => {
    if ('dummyHeightMap' in opts) {
      const {
        drawToTerrainHeightMap,
        heightMap,
        dummyHeightMap,
        terrainCover,
        terrainCoverBounds,
        useTerrainHeightMap,
        terrainSkipRender
      } = opts;

      let mode: number = terrainSkipRender ? TERRAIN_MODE.SKIP : TERRAIN_MODE.NONE;
      // height map if case USE_HEIGHT_MAP, terrain cover if USE_COVER, otherwise empty
      let sampler: Texture2D = dummyHeightMap;
      if (drawToTerrainHeightMap) {
        mode = TERRAIN_MODE.WRITE_HEIGHT_MAP;
      } else if (useTerrainHeightMap && heightMap) {
        mode = TERRAIN_MODE.USE_HEIGHT_MAP;
        sampler = heightMap;
      } else if (terrainCover) {
        mode =
          terrainSkipRender || opts.pickingActive
            ? TERRAIN_MODE.USE_COVER_ONLY
            : TERRAIN_MODE.USE_COVER;
        sampler = terrainCover;
      }

      /* eslint-disable camelcase */

      return {
        terrain_mode: mode,
        terrain_map: sampler,
        // Bounds of the terrain cover in common space, as [minX, minY, width, height]
        terrain_coverBounds: terrainCoverBounds
          ? [
              terrainCoverBounds[0][0],
              terrainCoverBounds[0][1],
              terrainCoverBounds[1][0] - terrainCoverBounds[0][0],
              terrainCoverBounds[1][1] - terrainCoverBounds[0][1]
            ]
          : [0, 0, 0, 0]
      };
    }
    return null;
  }
} as ShaderModule<TerrainModuleSettings>;
