// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export type MapLibreRenderParameters = {
  farZ: number;
  nearZ: number;
};

type CompatibleMapLibreMap = {
  getCenterElevation?: () => number;
  getCameraTargetElevation?: () => number;
  getProjection?: () => {type?: unknown} | undefined;
};

export function getMapLibreElevation(map: CompatibleMapLibreMap): number | undefined {
  if (map.getCenterElevation) {
    return map.getCenterElevation();
  }
  return map.getCameraTargetElevation?.();
}

export function getMapLibreProjection(map: CompatibleMapLibreMap): 'mercator' | 'globe' {
  let type: unknown = 'mercator';
  try {
    type = map.getProjection?.()?.type || 'mercator';
  } catch {
    // getProjection throws before a style is assigned
  }
  if (type === 'globe') {
    return 'globe';
  }
  if (type !== 'mercator') {
    throw new Error(`Unsupported MapLibre projection: ${String(type)}`);
  }
  return 'mercator';
}

/** Zoom range in which MapLibre's `globe` projection transitions to Web Mercator */
const MAPLIBRE_GLOBE_TRANSITION_ZOOMS = [11, 12] as const;

/**
 * Returns the elevation of the map center that the MapLibre camera targets, if any.
 * MapLibre's globe camera targets sea level and its Web Mercator camera the terrain. During the
 * globe projection's transition, MapLibre blends the two, which a target in between approximates.
 */
export function getMapLibreCameraElevation(
  map: CompatibleMapLibreMap,
  zoom: number
): number | undefined {
  const elevation = getMapLibreElevation(map);
  if (typeof elevation !== 'number' || !Number.isFinite(elevation)) {
    return undefined;
  }
  if (getMapLibreProjection(map) === 'globe') {
    const [startZoom, endZoom] = MAPLIBRE_GLOBE_TRANSITION_ZOOMS;
    const mercatorWeight = Math.min(Math.max((zoom - startZoom) / (endZoom - startZoom), 0), 1);
    return elevation * mercatorWeight;
  }
  return elevation;
}

export function getMapLibreRenderParameters(
  parametersOrMatrix: unknown,
  legacyParameters?: unknown
): MapLibreRenderParameters {
  if (isMapLibreRenderParameters(parametersOrMatrix)) {
    return parametersOrMatrix;
  }
  if (isMapLibreRenderParameters(legacyParameters)) {
    return legacyParameters;
  }
  throw new Error('MapLibreOverlay interleaved rendering requires MapLibre GL JS 4.5.1 or later');
}

function isMapLibreRenderParameters(value: unknown): value is MapLibreRenderParameters {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const parameters = value as Partial<MapLibreRenderParameters>;
  return Number.isFinite(parameters.nearZ) && Number.isFinite(parameters.farZ);
}
