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
