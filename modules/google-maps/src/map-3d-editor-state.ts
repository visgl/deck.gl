// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export type Map3DEditorMode = 'path' | 'polygon' | 'point';

export type Map3DEditorCoordinate = {
  altitude: number;
  lat: number;
  lng: number;
};

export type Map3DEditorCoordinateLike =
  | Map3DEditorCoordinate
  | {
      altitude?: number;
      lat?: number | (() => number);
      lng?: number | (() => number);
      toJSON?: () => {altitude?: number; lat: number; lng: number};
    };

export type Map3DEditorGeometry = {
  path?: Map3DEditorCoordinateLike[];
  points?: Map3DEditorCoordinateLike[];
  polygon?: Map3DEditorCoordinateLike[];
};

export type Map3DEditorSelection = {
  index: number;
  type: Map3DEditorMode;
};

export type Map3DEditorFeature =
  | {
      type: 'Feature';
      properties: {mode: 'path'};
      geometry: {type: 'LineString'; coordinates: number[][]};
    }
  | {
      type: 'Feature';
      properties: {mode: 'polygon'};
      geometry: {type: 'Polygon'; coordinates: number[][][]};
    }
  | {
      type: 'Feature';
      properties: {mode: 'point'};
      geometry: {type: 'Point'; coordinates: number[]};
    };

export type Map3DEditorGeoJSON = {
  type: 'FeatureCollection';
  features: Map3DEditorFeature[];
};

export type Map3DEditorSnapshot = {
  geojson: Map3DEditorGeoJSON;
  mode: Map3DEditorMode;
  path: Map3DEditorCoordinate[];
  points: Map3DEditorCoordinate[];
  polygon: Map3DEditorCoordinate[];
  selected: Map3DEditorSelection | null;
};

export type Map3DEditorMutationResult = {
  changed: boolean;
  snapshot: Map3DEditorSnapshot;
};

export type Map3DEditorState = {
  appendPosition: (position: Map3DEditorCoordinateLike) => Map3DEditorSnapshot;
  deleteSelected: () => Map3DEditorMutationResult;
  getSnapshot: () => Map3DEditorSnapshot;
  insertPathVertex: (position: Map3DEditorCoordinateLike) => Map3DEditorSnapshot;
  insertPolygonVertex: (position: Map3DEditorCoordinateLike) => Map3DEditorSnapshot;
  moveSelected: (position: Map3DEditorCoordinateLike) => Map3DEditorMutationResult;
  reset: () => Map3DEditorSnapshot;
  select: (selection: Map3DEditorSelection | null) => Map3DEditorSnapshot;
  setMode: (mode: Map3DEditorMode) => Map3DEditorSnapshot;
  undoLast: () => Map3DEditorMutationResult;
};

const MODES = new Set<Map3DEditorMode>(['path', 'polygon', 'point']);

export function createMap3DEditorState({
  path = [],
  polygon = [],
  points = []
}: Map3DEditorGeometry): Map3DEditorState {
  const initialGeometry = createMap3DGeometryState({path, polygon, points});
  let state: Omit<Map3DEditorSnapshot, 'geojson'> = {
    mode: 'path',
    ...createMap3DGeometryState(initialGeometry),
    selected: null
  };

  return {
    appendPosition,
    deleteSelected,
    getSnapshot,
    insertPathVertex,
    insertPolygonVertex,
    moveSelected,
    reset,
    select,
    setMode,
    undoLast
  };

  function appendPosition(position: Map3DEditorCoordinateLike): Map3DEditorSnapshot {
    const normalized = normalizeMap3DCoordinate(position);
    if (!normalized) {
      return getSnapshot();
    }

    const coordinates = getActiveCoordinates(state.mode);
    coordinates.push(normalized);
    state.selected = {type: state.mode, index: coordinates.length - 1};
    return getSnapshot();
  }

  function deleteSelected(): Map3DEditorMutationResult {
    if (!state.selected) {
      return {changed: false, snapshot: getSnapshot()};
    }

    const coordinates = getActiveCoordinates(state.selected.type);
    coordinates.splice(state.selected.index, 1);
    state.selected = null;
    return {changed: true, snapshot: getSnapshot()};
  }

  function getSnapshot(): Map3DEditorSnapshot {
    return {
      mode: state.mode,
      path: cloneCoordinates(state.path),
      points: cloneCoordinates(state.points),
      polygon: cloneCoordinates(state.polygon),
      selected: state.selected && {...state.selected},
      geojson: toMap3DEditorGeoJSON(state)
    };
  }

  function insertPathVertex(position: Map3DEditorCoordinateLike): Map3DEditorSnapshot {
    return insertVertex('path', position);
  }

  function insertPolygonVertex(position: Map3DEditorCoordinateLike): Map3DEditorSnapshot {
    return insertVertex('polygon', position);
  }

  function moveSelected(position: Map3DEditorCoordinateLike): Map3DEditorMutationResult {
    const normalized = normalizeMap3DCoordinate(position);
    if (!state.selected || !normalized) {
      return {changed: false, snapshot: getSnapshot()};
    }

    const coordinates = getActiveCoordinates(state.selected.type);
    coordinates[state.selected.index] = normalized;
    return {changed: true, snapshot: getSnapshot()};
  }

  function reset(): Map3DEditorSnapshot {
    state = {
      mode: state.mode,
      ...createMap3DGeometryState(initialGeometry),
      selected: null
    };
    return getSnapshot();
  }

  function select(selection: Map3DEditorSelection | null): Map3DEditorSnapshot {
    if (!selection || !MODES.has(selection.type)) {
      state.selected = null;
      return getSnapshot();
    }

    const coordinates = getActiveCoordinates(selection.type);
    state.selected =
      selection.index >= 0 && selection.index < coordinates.length
        ? {type: selection.type, index: selection.index}
        : null;
    return getSnapshot();
  }

  function setMode(mode: Map3DEditorMode): Map3DEditorSnapshot {
    if (!MODES.has(mode)) {
      return getSnapshot();
    }

    state.mode = mode;
    state.selected = null;
    return getSnapshot();
  }

  function undoLast(): Map3DEditorMutationResult {
    const coordinates = getActiveCoordinates(state.mode);
    if (!coordinates.length) {
      return {changed: false, snapshot: getSnapshot()};
    }

    coordinates.pop();
    state.selected = null;
    return {changed: true, snapshot: getSnapshot()};
  }

  function insertVertex(
    type: Exclude<Map3DEditorMode, 'point'>,
    position: Map3DEditorCoordinateLike
  ): Map3DEditorSnapshot {
    const normalized = normalizeMap3DCoordinate(position);
    if (!normalized) {
      return getSnapshot();
    }

    const coordinates = getActiveCoordinates(type);
    const index = getMap3DEditorInsertIndex(coordinates, normalized);
    coordinates.splice(index, 0, normalized);
    state.selected = {type, index};
    return getSnapshot();
  }

  function getActiveCoordinates(type: Map3DEditorMode): Map3DEditorCoordinate[] {
    if (type === 'point') {
      return state.points;
    }
    if (type === 'polygon') {
      return state.polygon;
    }
    return state.path;
  }
}

export function createMap3DGeometryState({
  path = [],
  polygon = [],
  points = []
}: Map3DEditorGeometry): Required<Pick<Map3DEditorSnapshot, 'path' | 'points' | 'polygon'>> {
  return {
    path: normalizeCoordinates(path),
    points: normalizeCoordinates(points),
    polygon: normalizeCoordinates(polygon)
  };
}

export function getMap3DEditorInsertIndex(
  path: Map3DEditorCoordinateLike[],
  position: Map3DEditorCoordinateLike
): number {
  const normalizedPosition = normalizeMap3DCoordinate(position);
  const normalizedPath = normalizeCoordinates(path);
  if (!normalizedPosition || normalizedPath.length < 2) {
    return normalizedPath.length;
  }

  let bestIndex = normalizedPath.length;
  let bestDistance = Infinity;
  for (let index = 0; index < normalizedPath.length - 1; index++) {
    const distance = distanceToSegment(
      normalizedPosition,
      normalizedPath[index],
      normalizedPath[index + 1]
    );
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index + 1;
    }
  }
  return bestIndex;
}

export function normalizeMap3DCoordinate(
  position?: Map3DEditorCoordinateLike | null
): Map3DEditorCoordinate | null {
  if (!position) {
    return null;
  }
  const value = 'toJSON' in position && position.toJSON ? position.toJSON() : position;
  const lat = Number(typeof value.lat === 'function' ? value.lat() : value.lat);
  const lng = Number(typeof value.lng === 'function' ? value.lng() : value.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return {
    altitude: Number(value.altitude || 0),
    lat,
    lng
  };
}

export function toMap3DEditorGeoJSON({
  path,
  polygon,
  points
}: Required<Pick<Map3DEditorSnapshot, 'path' | 'points' | 'polygon'>>): Map3DEditorGeoJSON {
  const features: Map3DEditorFeature[] = [];
  if (path.length >= 2) {
    features.push({
      type: 'Feature',
      properties: {mode: 'path'},
      geometry: {type: 'LineString', coordinates: path.map(toGeoJSONCoordinate)}
    });
  }
  if (polygon.length >= 3) {
    features.push({
      type: 'Feature',
      properties: {mode: 'polygon'},
      geometry: {type: 'Polygon', coordinates: [closeRing(polygon).map(toGeoJSONCoordinate)]}
    });
  }
  for (const point of points) {
    features.push({
      type: 'Feature',
      properties: {mode: 'point'},
      geometry: {type: 'Point', coordinates: toGeoJSONCoordinate(point)}
    });
  }
  return {type: 'FeatureCollection', features};
}

function closeRing(coordinates: Map3DEditorCoordinate[]): Map3DEditorCoordinate[] {
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first.lat === last.lat && first.lng === last.lng && first.altitude === last.altitude) {
    return coordinates;
  }
  return [...coordinates, first];
}

function cloneCoordinates(coordinates: Map3DEditorCoordinate[]): Map3DEditorCoordinate[] {
  return coordinates.map(coordinate => ({...coordinate}));
}

function distanceToSegment(
  position: Map3DEditorCoordinate,
  start: Map3DEditorCoordinate,
  end: Map3DEditorCoordinate
): number {
  const p = projectCoordinate(position, position.lat);
  const a = projectCoordinate(start, position.lat);
  const b = projectCoordinate(end, position.lat);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
  const x = a.x + t * dx;
  const y = a.y + t * dy;
  return Math.hypot(p.x - x, p.y - y);
}

function normalizeCoordinates(coordinates: Map3DEditorCoordinateLike[]): Map3DEditorCoordinate[] {
  return coordinates.flatMap(coordinate => {
    const normalized = normalizeMap3DCoordinate(coordinate);
    return normalized ? [normalized] : [];
  });
}

function projectCoordinate(
  position: Map3DEditorCoordinate,
  referenceLatitude: number
): {x: number; y: number} {
  const latitudeRadians = (referenceLatitude * Math.PI) / 180;
  return {
    x: position.lng * Math.cos(latitudeRadians),
    y: position.lat
  };
}

function toGeoJSONCoordinate({lat, lng, altitude = 0}: Map3DEditorCoordinate): number[] {
  return [lng, lat, altitude];
}
