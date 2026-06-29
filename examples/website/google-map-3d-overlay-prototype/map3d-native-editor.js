// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global navigator */

const PATH_STYLE = {
  strokeColor: '#ff7a00',
  strokeWidth: 8,
  outerColor: '#111827',
  outerWidth: 0.6
};

const POLYGON_STYLE = {
  fillColor: '#0ea5e955',
  strokeColor: '#38bdf8',
  strokeWidth: 4,
  outerColor: '#0f172a',
  outerWidth: 0.4
};

export function createNativeMap3DEditor({map, maps3d, path, polygon, points, onChange}) {
  const constructors = getMap3DConstructors(maps3d);
  const initialState = createGeometryState({path, points, polygon});
  const state = {mode: 'path', ...createGeometryState({path, points, polygon}), selected: null};
  const {routeElement, polygonElement} = createGeometryElements(constructors);
  const handles = [];

  addGeometryEventListeners(routeElement, polygonElement, insertPathVertex, insertPolygonVertex);
  const mapClick = createMapClickHandler(appendPosition);
  map.addEventListener('gmp-click', mapClick);
  map.append(routeElement, polygonElement);

  render();

  return {
    get mode() {
      return state.mode;
    },
    setMode,
    deleteSelected,
    destroy,
    reset,
    undoLast,
    getSnapshot,
    copyGeoJSON
  };

  function setMode(mode) {
    state.mode = mode;
    state.selected = null;
    render();
  }

  function appendPosition(position) {
    if (state.mode === 'point') {
      state.points.push(position);
      state.selected = {type: 'point', index: state.points.length - 1};
    } else if (state.mode === 'polygon') {
      state.polygon.push(position);
      state.selected = {type: 'polygon', index: state.polygon.length - 1};
    } else {
      state.path.push(position);
      state.selected = {type: 'path', index: state.path.length - 1};
    }
    render();
  }

  function insertPathVertex(position) {
    const index = getInsertIndex(state.path, position);
    state.path.splice(index, 0, position);
    state.selected = {type: 'path', index};
    render();
  }

  function insertPolygonVertex(position) {
    const index = getInsertIndex(state.polygon, position);
    state.polygon.splice(index, 0, position);
    state.selected = {type: 'polygon', index};
    render();
  }

  function deleteSelected() {
    if (!state.selected) {
      return false;
    }
    getActiveCoordinates(state.selected.type).splice(state.selected.index, 1);
    state.selected = null;
    render();
    return true;
  }

  function undoLast() {
    const coordinates = getActiveCoordinates(state.mode);
    if (!coordinates.length) {
      return false;
    }
    coordinates.pop();
    state.selected = null;
    render();
    return true;
  }

  function reset() {
    state.path = cloneCoordinates(initialState.path);
    state.points = cloneCoordinates(initialState.points);
    state.polygon = cloneCoordinates(initialState.polygon);
    state.selected = null;
    render();
  }

  function destroy() {
    map.removeEventListener('gmp-click', mapClick);
    routeElement.remove();
    polygonElement.remove();
    clearHandles();
  }

  async function copyGeoJSON() {
    const text = JSON.stringify(toGeoJSON(state), null, 2);
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard is best-effort on local HTTP/dev origins.
    }
    return text;
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

  function render() {
    setElementPath(routeElement, state.path);
    setElementPath(polygonElement, state.polygon.length >= 3 ? state.polygon : []);
    renderHandles();
    onChange?.(getSnapshot());
  }

  function renderHandles() {
    clearHandles();
    for (const [type, coordinates] of [
      ['path', state.path],
      ['polygon', state.polygon],
      ['point', state.points]
    ]) {
      const isActiveMode = state.mode === type;
      coordinates.forEach((position, index) => {
        const selected = state.selected?.type === type && state.selected.index === index;
        const marker = new constructors.MarkerElement({
          altitudeMode: constructors.AltitudeMode.CLAMP_TO_GROUND,
          collisionPriority: selected ? 1000 : 10,
          drawsWhenOccluded: true,
          label: getHandleLabel(type, index, selected),
          position,
          sizePreserved: true,
          zIndex: isActiveMode || selected ? 20 : 5
        });
        marker.addEventListener('gmp-click', event => {
          stopEvent(event);
          state.selected = {type, index};
          render();
        });
        map.appendChild(marker);
        handles.push(marker);
      });
    }
  }

  function clearHandles() {
    while (handles.length) {
      handles.pop().remove();
    }
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

function addGeometryEventListeners(
  routeElement,
  polygonElement,
  insertPathVertex,
  insertPolygonVertex
) {
  routeElement.addEventListener('gmp-click', event => {
    const position = getEventPosition(event);
    stopEvent(event);
    if (position) {
      insertPathVertex(position);
    }
  });
  polygonElement.addEventListener('gmp-click', event => {
    const position = getEventPosition(event);
    stopEvent(event);
    if (position) {
      insertPolygonVertex(position);
    }
  });
}

function createMapClickHandler(appendPosition) {
  return event => {
    const position = getEventPosition(event);
    if (!position) {
      return;
    }
    event.preventDefault?.();
    appendPosition(position);
  };
}

function getMap3DConstructors(maps3d) {
  const {
    AltitudeMode,
    Marker3DInteractiveElement,
    Marker3DElement,
    Polyline3DInteractiveElement,
    Polyline3DElement,
    Polygon3DInteractiveElement,
    Polygon3DElement
  } = maps3d;

  return {
    AltitudeMode,
    MarkerElement: Marker3DInteractiveElement || Marker3DElement,
    PolylineElement: Polyline3DInteractiveElement || Polyline3DElement,
    PolygonElement: Polygon3DInteractiveElement || Polygon3DElement
  };
}

function createGeometryElements({AltitudeMode, PolylineElement, PolygonElement}) {
  return {
    routeElement: new PolylineElement({
      altitudeMode: AltitudeMode.CLAMP_TO_GROUND,
      ...PATH_STYLE
    }),
    polygonElement: new PolygonElement({
      altitudeMode: AltitudeMode.CLAMP_TO_GROUND,
      ...POLYGON_STYLE
    })
  };
}

function createGeometryState({path, points, polygon}) {
  return {
    path: cloneCoordinates(path),
    points: cloneCoordinates(points),
    polygon: cloneCoordinates(polygon)
  };
}

function setElementPath(element, coordinates) {
  element.path = coordinates.map(toLatLngAltitudeLiteral);
  element.setAttribute('path', coordinates.map(toPathToken).join(' '));
}

function toGeoJSON({path, polygon, points}) {
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

function getInsertIndex(path, position) {
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

function getEventPosition(event) {
  return normalizeCoordinate(event.position);
}

function normalizeCoordinate(position) {
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

function getHandleLabel(type, index, selected) {
  const prefix = type === 'point' ? 'P' : String(index + 1);
  return selected ? `*${prefix}` : prefix;
}

function stopEvent(event) {
  event.preventDefault?.();
  event.stopPropagation?.();
}

function cloneCoordinates(coordinates) {
  return coordinates.map(coordinate => ({...coordinate}));
}

function toLatLngAltitudeLiteral({lat, lng, altitude = 0}) {
  return {lat, lng, altitude};
}

function toGeoJSONCoordinate({lat, lng, altitude = 0}) {
  return [lng, lat, altitude];
}

function toPathToken({lat, lng, altitude = 0}) {
  return `${lat},${lng},${altitude}`;
}
