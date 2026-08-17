// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Map as MapLibreMap} from 'maplibre-gl';

export type MapLibreRenderParameters = {
  farZ: number;
  nearZ: number;
};

type CompatibleMapLibreMap = Omit<MapLibreMap, 'getCenterElevation' | 'getProjection'> & {
  getCenterElevation?: () => number;
  getCameraTargetElevation?: () => number;
  getProjection?: () => {type?: string} | undefined;
};

export function getMapLibreElevation(map: MapLibreMap): number | undefined {
  const compatibleMap = map as CompatibleMapLibreMap;
  if (compatibleMap.getCenterElevation) {
    return compatibleMap.getCenterElevation();
  }
  return compatibleMap.getCameraTargetElevation?.();
}

export function getMapLibreProjection(map: MapLibreMap): 'mercator' | 'globe' {
  const compatibleMap = map as CompatibleMapLibreMap;
  let type: unknown = 'mercator';
  try {
    type = compatibleMap.getProjection?.()?.type || 'mercator';
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
