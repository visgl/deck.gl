// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global navigator */

import {createEditorState, normalizeCoordinate} from './map3d-editor-state';

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
  const editorState = createEditorState({path, points, polygon});
  const {routeElement, polygonElement} = createGeometryElements(constructors);
  const handles = [];
  let moveSelectedOnNextClick = false;

  addGeometryEventListeners(routeElement, polygonElement, insertPathVertex, insertPolygonVertex);
  const mapClick = installMapElements(map, routeElement, polygonElement, handleMapPosition);

  render();

  return {
    get mode() {
      return getSnapshot().mode;
    },
    setMode,
    deleteSelected,
    destroy,
    moveSelectedToNextClick,
    reset,
    undoLast,
    getSnapshot,
    copyGeoJSON
  };

  function setMode(mode) {
    moveSelectedOnNextClick = false;
    editorState.setMode(mode);
    render();
  }

  function handleMapPosition(position) {
    if (moveSelectedOnNextClick) {
      const {changed} = editorState.moveSelected(position);
      moveSelectedOnNextClick = false;
      render();
      return changed;
    }
    appendPosition(position);
    return true;
  }

  function appendPosition(position) {
    editorState.appendPosition(position);
    render();
  }

  function insertPathVertex(position) {
    editorState.insertPathVertex(position);
    render();
  }

  function insertPolygonVertex(position) {
    editorState.insertPolygonVertex(position);
    render();
  }

  function deleteSelected() {
    const {changed} = editorState.deleteSelected();
    moveSelectedOnNextClick = false;
    render();
    return changed;
  }

  function undoLast() {
    const {changed} = editorState.undoLast();
    render();
    return changed;
  }

  function moveSelectedToNextClick() {
    const hasSelection = Boolean(getSnapshot().selected);
    moveSelectedOnNextClick = hasSelection;
    render();
    return hasSelection;
  }

  function reset() {
    moveSelectedOnNextClick = false;
    editorState.reset();
    render();
  }

  function destroy() {
    map.removeEventListener('gmp-click', mapClick);
    routeElement.remove();
    polygonElement.remove();
    clearHandles();
  }

  async function copyGeoJSON() {
    const text = JSON.stringify(getSnapshot().geojson, null, 2);
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard is best-effort on local HTTP/dev origins.
    }
    return text;
  }

  function getSnapshot() {
    return {...editorState.getSnapshot(), moveSelectedOnNextClick};
  }

  function render() {
    const snapshot = getSnapshot();
    setElementPath(routeElement, snapshot.path);
    setElementPath(polygonElement, snapshot.polygon.length >= 3 ? snapshot.polygon : []);
    renderHandles();
    onChange?.(snapshot);
  }

  function renderHandles() {
    const snapshot = getSnapshot();
    clearHandles();
    for (const [type, coordinates] of [
      ['path', snapshot.path],
      ['polygon', snapshot.polygon],
      ['point', snapshot.points]
    ]) {
      const isActiveMode = snapshot.mode === type;
      coordinates.forEach((position, index) => {
        const selected = snapshot.selected?.type === type && snapshot.selected.index === index;
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
          editorState.select({type, index});
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
}

function installMapElements(map, routeElement, polygonElement, handleMapPosition) {
  const mapClick = createMapClickHandler(handleMapPosition);
  map.addEventListener('gmp-click', mapClick);
  map.append(routeElement, polygonElement);
  return mapClick;
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

function setElementPath(element, coordinates) {
  element.path = coordinates.map(toLatLngAltitudeLiteral);
  element.setAttribute('path', coordinates.map(toPathToken).join(' '));
}

function getEventPosition(event) {
  return normalizeCoordinate(event.position);
}

function getHandleLabel(type, index, selected) {
  const prefix = type === 'point' ? 'P' : String(index + 1);
  return selected ? `*${prefix}` : prefix;
}

function stopEvent(event) {
  event.preventDefault?.();
  event.stopPropagation?.();
}

function toLatLngAltitudeLiteral({lat, lng, altitude = 0}) {
  return {lat, lng, altitude};
}

function toPathToken({lat, lng, altitude = 0}) {
  return `${lat},${lng},${altitude}`;
}
