// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Color} from '@deck.gl/core';

import ALBULA_LANDWASSER from './data/albula-landwasser.json';
import BERNINA_PASS from './data/bernina-pass.json';
import BRUSIO_SPIRAL from './data/brusio-spiral.json';

import type {RailwayScene, RailwayTrack, SceneId, TerrainAssets} from './types';

export const DEFAULT_GAUGE_METERS = 1;
export const RAIL_STROKE_WIDTH_METERS = 0.16;
export const TRACK_BED_WIDTH_METERS = 3.2;
export const SLEEPER_LENGTH_METERS = 2.65;
export const SLEEPER_PATTERN_METERS = [0.22, 0.56] as const;
export const TRACK_ELEVATION_OFFSET_METERS = 0.8;
export const HIDDEN_PATTERN_PIXELS = [10, 7] as const;
export const STRUCTURE_PATTERN_PIXELS = [12, 8] as const;

export const TRACK_COLORS = {
  ballast: [36, 32, 29, 255] as Color,
  sleeper: [225, 151, 78, 255] as Color,
  rail: [255, 243, 214, 255] as Color,
  hidden: [91, 194, 220, 245] as Color,
  centerline: [83, 220, 218, 235] as Color,
  sourceVertex: [250, 104, 78, 245] as Color,
  structureOverlay: [248, 183, 74, 230] as Color
};

export const SCENE_ORDER: SceneId[] = ['albula-landwasser', 'bernina-pass', 'brusio-spiral'];

export const SCENES: Record<SceneId, RailwayScene> = {
  'albula-landwasser': ALBULA_LANDWASSER as unknown as RailwayScene,
  'bernina-pass': BERNINA_PASS as unknown as RailwayScene,
  'brusio-spiral': BRUSIO_SPIRAL as unknown as RailwayScene
};

export const SCENE_LABELS = Object.fromEntries(
  SCENE_ORDER.map(sceneId => [sceneId, SCENES[sceneId].label])
) as Record<SceneId, string>;

export const TERRAIN_ASSETS: Record<SceneId, TerrainAssets> = {
  'albula-landwasser': {
    elevation: new URL('./data/terrain/albula-landwasser-elevation.png', import.meta.url).href,
    texture: new URL('./data/terrain/albula-landwasser-texture.png', import.meta.url).href,
    color: [136, 151, 137]
  },
  'bernina-pass': {
    elevation: new URL('./data/terrain/bernina-pass-elevation.png', import.meta.url).href,
    texture: new URL('./data/terrain/bernina-pass-texture.png', import.meta.url).href,
    color: [176, 187, 190]
  },
  'brusio-spiral': {
    elevation: new URL('./data/terrain/brusio-spiral-elevation.png', import.meta.url).href,
    texture: new URL('./data/terrain/brusio-spiral-texture.png', import.meta.url).href,
    color: [145, 147, 129]
  }
};

export const ELEVATION_DECODER = {
  rScaler: 6553.6,
  gScaler: 25.6,
  bScaler: 0.1,
  offset: -10000
};

export const SWISSTOPO_ATTRIBUTION = 'Source: Federal Office of Topography swisstopo';
export const SWISSTOPO_RAILWAY_URL = 'https://opendata.swiss/en/dataset/swisstlm3d-eisenbahn';
export const SWISSTOPO_TERRAIN_URL = 'https://www.swisstopo.admin.ch/en/height-model-swissalti3d';

export function getGaugeMeters(track: RailwayTrack): number {
  return track.gaugeMeters ?? DEFAULT_GAUGE_METERS;
}
