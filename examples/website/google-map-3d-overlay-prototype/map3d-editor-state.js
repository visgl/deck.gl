// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

const MODES = new Set(['path', 'polygon', 'point']);

export function createEditorState({path = [], polygon = [], points = []}) {
  const initialGeometry = createGeometryState({path, polygon, points});
  let state = {
    mode: 'path',
    ...createGeometryState(initialGeometry),
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

  function appendPosition(position) {
    const normalized = normalizeCoordinate(position);
    if (!normalized) {
      return getSnapshot();
    }

    const coordinates = getActiveCoordinates(state.mode);
    coordinates.push(normalized);
    state.selected = {type: state.mode, index: coordinates.length - 1};
    return getSnapshot();
  }

  function deleteSelected() {
    if (!state.selected) {
      return {changed: false, snapshot: getSnapshot()};
    }

    const coordinates = getActiveCoordinates(state.selected.type);
    coordinates.splice(state.selected.index, 1);
    state.selected = null;
    return {changed: true, snapshot: getSnapshot()};
  }

  function getSnapshot() {
    return {
      mode: state.mode,
      path: cloneCoordinates(state.path),
      points: cloneCoordinates(state.points),
      polygon: cloneCoordinates(state.polygon),
      selected: state.selected && {...state.selected},
      geojson: toGeoJSON(state)
    };
  }

  function insertPathVertex(position) {
    return insertVertex('path', position);
  }

  function insertPolygonVertex(position) {
    return insertVertex('polygon', position);
  }

  function moveSelected(position) {
    const normalized = normalizeCoordinate(position);
    if (!state.selected || !normalized) {
      return {changed: false, snapshot: getSnapshot()};
    }

    const coordinates = getActiveCoordinates(state.selected.type);
    coordinates[state.selected.index] = normalized;
    return {changed: true, snapshot: getSnapshot()};
  }

  function reset() {
    state = {
      mode: state.mode,
      ...createGeometryState(initialGeometry),
      selected: null
    };
    return getSnapshot();
  }

  function select(selection) {
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

  function setMode(mode) {
    if (!MODES.has(mode)) {
      return getSnapshot();
    }

    state.mode = mode;
    state.selected = null;
    return getSnapshot();
  }

  function undoLast() {
    const coordinates = getActiveCoordinates(state.mode);
    if (!coordinates.length) {
      return {changed: false, snapshot: getSnapshot()};
    }

    coordinates.pop();
    state.selected = null;
    return {changed: true, snapshot: getSnapshot()};
  }

  function insertVertex(type, position) {
    const normalized = normalizeCoordinate(position);
    if (!normalized) {
      return getSnapshot();
    }

    const coordinates = getActiveCoordinates(type);
    const index = getInsertIndex(coordinates, normalized);
    coordinates.splice(index, 0, normalized);
    state.selected = {type, index};
    return getSnapshot();
  }

  function getActiveCoordinates(type) {
    if (type === 'point') {
      return state.points;
    }
    if (type === 'polygon') {
      return state.polygon;
    }
    return state.path;
  }
}

export function createGeometryState({path = [], polygon = [], points = []}) {
  return {
    path: cloneCoordinates(path),
    points: cloneCoordinates(points),
    polygon: cloneCoordinates(polygon)
  };
}

export function getInsertIndex(path, position) {
  if (path.length < 2) {
    return path.length;
  }

  let bestIndex = path.length;
  let bestDistance = Infinity;
  for (let index = 0; index < path.length - 1; index++) {
    const distance = distanceToSegment(position, path[index], path[index + 1]);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index + 1;
    }
  }
  return bestIndex;
}

export function normalizeCoordinate(position) {
  if (!position) {
    return null;
  }
  const value = typeof position.toJSON === 'function' ? position.toJSON() : position;
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

export function toGeoJSON({path, polygon, points}) {
  const features = [];
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

function closeRing(coordinates) {
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first.lat === last.lat && first.lng === last.lng && first.altitude === last.altitude) {
    return coordinates;
  }
  return [...coordinates, first];
}

function cloneCoordinates(coordinates) {
  return coordinates.map(coordinate => ({...coordinate}));
}

function distanceToSegment(position, start, end) {
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

function projectCoordinate(position, referenceLatitude) {
  const latitudeRadians = (referenceLatitude * Math.PI) / 180;
  return {
    x: position.lng * Math.cos(latitudeRadians),
    y: position.lat
  };
}

function toGeoJSONCoordinate({lat, lng, altitude = 0}) {
  return [lng, lat, altitude];
}
