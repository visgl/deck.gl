// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import {zoomAdjust} from '@deck.gl/core/viewports/globe-viewport';
import {GeoJsonLayer, ArcLayer, ColumnLayer, BitmapLayer, PathLayer} from '@deck.gl/layers';
import {createSettingsControl} from './settings-control';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';
// source: https://commons.wikimedia.org/wiki/File:PathfinderMap_hires_(4996917742).jpg
const WORLD_MAP = './map.jpg';
const COMPACT_LAYOUT = globalThis.matchMedia('(max-width: 600px)').matches;

const INITIAL_VIEW_STATE = {
  latitude: 20,
  longitude: 0.45,
  minZoom: COMPACT_LAYOUT ? 0.5 : 1,
  maxZoom: 3,
  zoom: COMPACT_LAYOUT ? 0.7 : 1.5,
  bearing: 0,
  pitch: 30,
  minPitch: 0,
  maxPitch: 45,
  minBearing: -45,
  maxBearing: 45,
  transitionDuration: 0
};

let currentViewState = {...INITIAL_VIEW_STATE};
let zoomAround = 'pointer';
let viewType = 'globe';
let rubberBand = true;
let constraintPreset = 'rotation';
let dragMode = 'pan';
let inertia = false;
let showData = false;
let interactionState = {};
const MAX_BOUNDS = [
  [-60, -45],
  [60, 45]
];

const GRATICULES = getGraticules(30);

export const deck = new Deck({
  views: getView(viewType),
  initialViewState: INITIAL_VIEW_STATE,
  controller: getControllerOptions(),
  parameters: {
    cull: true
  },
  layers: [
    new BitmapLayer({
      id: 'base-map-raster',
      image: WORLD_MAP,
      bounds: [-180, -90, 180, 90]
    }),
    new PathLayer({
      id: 'graticules',
      data: GRATICULES,
      getPath: d => d,
      widthMinPixels: 1,
      getColor: [128, 128, 128]
    }),
    new PathLayer({
      id: 'constraint-boundary',
      visible: false,
      data: [getBoundsPath()],
      getPath: path => path,
      getColor: [255, 190, 65],
      widthMinPixels: 4,
      parameters: {depthCompare: 'always'}
    }),
    new GeoJsonLayer({
      id: 'base-map',
      visible: showData,
      data: COUNTRIES,
      // Styles
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      opacity: 0.4,
      getLineColor: [60, 60, 60],
      getFillColor: [200, 200, 200]
    }),
    new ColumnLayer({
      id: 'airports-extruded',
      visible: showData,
      data: AIR_PORTS,
      dataTransform: geojson => geojson.features,
      // Styles
      radius: 10000,
      extruded: true,
      getPosition: f => f.geometry.coordinates,
      getElevation: f => f.properties.scalerank * 100000,
      getFillColor: [200, 0, 80, 180]
    }),
    new GeoJsonLayer({
      id: 'airports',
      visible: showData,
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick: info =>
        // eslint-disable-next-line
        info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
    }),
    new ArcLayer({
      id: 'arcs',
      visible: showData,
      data: AIR_PORTS,
      dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
      // Styles
      getSourcePosition: f => [-0.4531566, 51.4709959], // London
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    })
  ]
});

function getGraticules(resolution) {
  const graticules = [];
  for (let lat = 0; lat < 90; lat += resolution) {
    const path1 = [];
    const path2 = [];
    for (let lon = -180; lon <= 180; lon += 90) {
      path1.push([lon, lat]);
      path2.push([lon, -lat]);
    }
    graticules.push(path1);
    graticules.push(path2);
  }
  for (let lon = -180; lon < 180; lon += resolution) {
    const path = [];
    for (let lat = -90; lat <= 90; lat += 90) {
      path.push([lon, lat]);
    }
    graticules.push(path);
  }
  return graticules;
}

function getView(nextViewType) {
  return nextViewType === 'map' ? new MapView() : new GlobeView();
}

function getBoundsPath() {
  const [[west, south], [east, north]] = MAX_BOUNDS;
  const path = [];
  for (let longitude = west; longitude <= east; longitude += 5) path.push([longitude, south]);
  for (let latitude = south; latitude <= north; latitude += 5) path.push([east, latitude]);
  for (let longitude = east; longitude >= west; longitude -= 5) path.push([longitude, north]);
  for (let latitude = north; latitude >= south; latitude -= 5) path.push([west, latitude]);
  return path;
}

function getControllerOptions() {
  return {
    navigation: 'map',
    dragMode,
    inertia: inertia ? 500 : false,
    zoomAround,
    rubberBand,
    touchRotate: true,
    trackpadGesture: true,
    doubleClickDragZoom: true,
    maxBounds: constraintPreset === 'pan' || constraintPreset === 'all' ? MAX_BOUNDS : null
  };
}

const settingsControl = createSettingsControl({
  onZoomAroundChange: nextZoomAround => {
    zoomAround = nextZoomAround;
    deck.setProps({controller: getControllerOptions()});
    updateSettingsControl();
  },
  onViewChange: nextViewType => {
    viewType = nextViewType;
    deck.setProps({views: getView(viewType)});
    resetView();
  },
  onRubberBandChange: enabled => {
    rubberBand = enabled;
    deck.setProps({controller: getControllerOptions()});
    resetView();
  },
  onDragModeChange: mode => {
    dragMode = mode;
    deck.setProps({controller: getControllerOptions()});
    updateSettingsControl();
  },
  onInertiaChange: enabled => {
    inertia = enabled;
    deck.setProps({controller: getControllerOptions()});
    updateSettingsControl();
  },
  onDataChange: enabled => {
    showData = enabled;
    deck.setProps({
      layers: deck.props.layers.map(layer =>
        ['base-map', 'airports-extruded', 'airports', 'arcs'].includes(layer.id)
          ? layer.clone({visible: showData})
          : layer
      )
    });
    updateSettingsControl();
  },
  onConstraintChange: preset => {
    constraintPreset = preset;
    resetView();
  },
  onReset: resetView
});

function resetView() {
  const boundedRotation = constraintPreset === 'rotation' || constraintPreset === 'all';
  const boundedPan = Boolean(getControllerOptions().maxBounds);
  interactionState = {};
  deck.setProps({
    controller: getControllerOptions(),
    layers: deck.props.layers.map(layer =>
      layer.id === 'constraint-boundary' ? layer.clone({visible: boundedPan}) : layer
    )
  });
  setViewState({
    ...INITIAL_VIEW_STATE,
    longitude: boundedPan ? 0 : INITIAL_VIEW_STATE.longitude,
    latitude: boundedPan ? 0 : INITIAL_VIEW_STATE.latitude,
    zoom: boundedPan ? 3 : INITIAL_VIEW_STATE.zoom,
    pitch: boundedRotation ? INITIAL_VIEW_STATE.pitch : 0,
    maxZoom: constraintPreset === 'none' ? 20 : boundedPan ? 5 : 3,
    maxPitch: boundedRotation ? 45 : 60,
    minBearing: boundedRotation ? -45 : -Infinity,
    maxBearing: boundedRotation ? 45 : Infinity
  });
}

function setViewState(nextViewState) {
  currentViewState = {...currentViewState, ...nextViewState};
  deck.setProps({viewState: currentViewState});
  updateSettingsControl();
}

function updateSettingsControl() {
  const controller = Object.values(deck.viewManager?.controllers || {})[0];
  // Show the actual release destination, including viewport-dependent pan and zoom limits.
  const settledViewState = controller
    ? new controller.ControllerState({
        ...controller.props,
        ...currentViewState,
        ...getControllerOptions(),
        makeViewport: controller.makeViewport
      }).getViewportProps()
    : currentViewState;
  settingsControl.update({
    viewState: normalizeZoom(currentViewState),
    settledViewState: normalizeZoom(settledViewState),
    interactionState,
    zoomAround,
    viewType,
    rubberBand,
    constraintPreset,
    dragMode,
    inertia,
    showData,
    maxBounds: getControllerOptions().maxBounds
  });
}

function normalizeZoom(viewState) {
  return viewType === 'globe'
    ? {
        ...viewState,
        zoom: viewState.zoom - zoomAdjust(viewState.latitude, true) + zoomAdjust(0, true)
      }
    : viewState;
}

updateSettingsControl();

deck.setProps({
  onViewStateChange: ({viewState, interactionState: nextInteractionState}) => {
    interactionState = nextInteractionState;
    setViewState(viewState);
  },
  onInteractionStateChange: nextInteractionState => {
    interactionState = nextInteractionState;
    updateSettingsControl();
  }
});
