// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable camelcase */

import type {ShaderModule} from '@luma.gl/shadertools';
import {project, ProjectProps} from '@deck.gl/core';

import type {Texture} from '@luma.gl/core';
import type {Bounds} from '../utils/projection-utils';
import type {TerrainCover} from './terrain-cover';

/** Module parameters expected by the terrain shader module */
export type TerrainModuleProps = {
  project: ProjectProps;
  isPicking: boolean;
  heightMap: Texture | null;
  heightMapBounds?: Bounds | null;
  dummyHeightMap: Texture;
  terrainCover?: TerrainCover | null;
  drawToTerrainHeightMap?: boolean;
  useTerrainHeightMap?: boolean;
  terrainSkipRender?: boolean;
};

type TerrainModuleUniforms = {
  mode: number;
  bounds: [number, number, number, number];
};

type TerrainModuleBindings = {
  terrain_map: Texture;
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

const uniformBlock =
  // eslint-disable-next-line prefer-template
  TERRAIN_MODE_CONSTANTS +
  /* glsl */ `
layout(std140) uniform terrainUniforms {
  float mode;
  vec4 bounds;
} terrain;

uniform sampler2D terrain_map;
`;

export const terrainModule = {
  name: 'terrain',
  dependencies: [project],
  // eslint-disable-next-line prefer-template
  vs:
    uniformBlock +
    /* glsl */ `
out vec3 commonPos;
// Fragment position in ABSOLUTE Mercator common space, regardless of the live
// viewport's projection mode. Computed here (not in FS) because the project
// module's helpers (project_mercator_, PROJECTION_MODE_*) are only declared
// in the vertex shader. Mercator is log-nonlinear in lat, but terrain meshes
// are fine enough that varying-interpolation error is negligible.
out vec2 terrainMercPos;
`,
  // eslint-disable-next-line prefer-template
  fs: uniformBlock + /* glsl */ 'in vec3 commonPos;\nin vec2 terrainMercPos;',
  inject: {
    'vs:#main-start': /* glsl */ `
if (terrain.mode == TERRAIN_MODE_SKIP) {
  gl_Position = vec4(0.0);
  return;
}
`,
    'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
commonPos = geometry.position.xyz;
if (project.projectionMode == PROJECTION_MODE_GLOBE) {
  // Unproject globe cartesian (see project_globe_) back to lng/lat, then
  // forward-project through project_mercator_. Elevation scales the sphere
  // radius uniformly, so angular components recover cleanly.
  vec3 cp = commonPos;
  float D = length(cp);
  float lat = degrees(asin(clamp(cp.z / D, -1.0, 1.0)));
  float lng = degrees(atan(cp.x, -cp.y));
  terrainMercPos = project_mercator_(vec2(lng, lat));
} else {
  // Web Mercator modes: commonPos.xy is mercator-common minus commonOrigin.
  terrainMercPos = commonPos.xy + project.commonOrigin.xy;
}
if (terrain.mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
  // Height-map bounds are in ABSOLUTE Mercator common (so the FBO is reusable
  // across MapView / GlobeView). Use the mercator xy computed above.
  vec2 texCoords = (terrainMercPos - terrain.bounds.xy) / terrain.bounds.zw;
  position = vec4(texCoords * 2.0 - 1.0, 0.0, 1.0);
  commonPos.z += project.commonOrigin.z;
}
if (terrain.mode == TERRAIN_MODE_USE_HEIGHT_MAP) {
  // worldPosition.xy is lng/lat for geospatial instance-position layers
  // (IconLayer, TextLayer, etc.) — project directly through mercator so the
  // UV matches the absolute-mercator bounds used by WRITE_HEIGHT_MAP, on
  // both MapView and GlobeView.
  vec2 anchorMerc = project_mercator_(geometry.worldPosition.xy);
  vec2 texCoords = (anchorMerc - terrain.bounds.xy) / terrain.bounds.zw;
  if (texCoords.x >= 0.0 && texCoords.y >= 0.0 && texCoords.x <= 1.0 && texCoords.y <= 1.0) {
    float terrainZ = texture(terrain_map, texCoords).r;
    geometry.position.z += terrainZ;
    position = project_common_position_to_clipspace(geometry.position);
  }
}
    `,
    'fs:#main-start': /* glsl */ `
if (terrain.mode == TERRAIN_MODE_WRITE_HEIGHT_MAP) {
  fragColor = vec4(commonPos.z, 0.0, 0.0, 1.0);
  return;
}
    `,
    'fs:DECKGL_FILTER_COLOR': /* glsl */ `
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
  },
  // eslint-disable-next-line complexity
  getUniforms: (opts: Partial<TerrainModuleProps> = {}) => {
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
      // All modes now pack bounds in absolute Mercator common; shader samples
      // against absolute xy computed per-fragment, so we no longer need the
      // project module's commonOrigin here.

      let mode: number = terrainSkipRender ? TERRAIN_MODE.SKIP : TERRAIN_MODE.NONE;
      // height map if case USE_HEIGHT_MAP, terrain cover if USE_COVER, otherwise empty
      let sampler: Texture | undefined = dummyHeightMap as Texture;
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
        sampler = fbo?.colorAttachments[0].texture;
        if (opts.isPicking) {
          mode = TERRAIN_MODE.SKIP;
        }
        if (sampler) {
          mode = mode === TERRAIN_MODE.SKIP ? TERRAIN_MODE.USE_COVER_ONLY : TERRAIN_MODE.USE_COVER;
          bounds = terrainCover.bounds;
        } else {
          sampler = dummyHeightMap!;
          if (opts.isPicking && !terrainSkipRender) {
            // terrain+draw layer without cover FBO: render own picking colors
            mode = TERRAIN_MODE.NONE;
          }
        }
      }

      // All bounds live in ABSOLUTE Mercator common space so the FBOs can be
      // shared across MapView and GlobeView (see terrain-cover.ts and
      // height-map-builder.ts). No commonOrigin subtract.
      /* eslint-disable camelcase */
      return {
        mode,
        terrain_map: sampler,
        // Pack bounds as [minX, minY, width, height]
        bounds: bounds
          ? [bounds[0], bounds[1], bounds[2] - bounds[0], bounds[3] - bounds[1]]
          : [0, 0, 0, 0]
      };
    }
    return {};
  },
  uniformTypes: {
    mode: 'f32',
    bounds: 'vec4<f32>'
  }
} as const satisfies ShaderModule<TerrainModuleProps, TerrainModuleUniforms, TerrainModuleBindings>;
