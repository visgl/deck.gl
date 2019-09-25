/* global window, document, requestAnimationFrame */
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';

const NUM_LAYERS = 1000;
const POINTS_PER_LAYER = 100;
const SF_MIN = [-122.511289, 37.709481];
const SF_MAX = [-122.37646761, 37.806013];

const INITIAL_VIEW_STATE = {
  latitude: 37.752,
  longitude: -122.427,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

function sfRandomPoints(numPoints, maxVal) {
  const points = new Array(numPoints);

  const lngMin = SF_MIN[0];
  const latMin = SF_MIN[1];
  const lngRange = SF_MAX[0] - SF_MIN[0];
  const latRange = SF_MAX[1] - SF_MIN[1];

  for (let i = 0; i < numPoints; ++i) {
    points[i] = {
      position: [lngMin + Math.random() * lngRange, latMin + Math.random() * latRange],
      value: Math.random() * maxVal
    };
  }

  return points;
}

window.onload = () => {
  const numPointsElement = document.getElementById('num-points');
  const numLayersElement = document.getElementById('num-layers');
  const fpsElement = document.getElementById('fps');
  const cpuElement = document.getElementById('cpu');
  const gpuElement = document.getElementById('gpu');

  numPointsElement.innerHTML = NUM_LAYERS * POINTS_PER_LAYER;
  numLayersElement.innerHTML = NUM_LAYERS;

  const layers = new Array(NUM_LAYERS);

  for (let i = 0; i < NUM_LAYERS; ++i) {
    const r = Math.random() * 256;
    const g = Math.random() * 256;
    const b = Math.random() * 256;
    layers[i] = new ScatterplotLayer({
      data: sfRandomPoints(POINTS_PER_LAYER, 10),
      id: `scatterplotLayer${i}`,
      getPosition: d => d.position,
      getFillColor: [r, g, b],
      getRadius: d => d.value,
      opacity: 1,
      pickable: true,
      radiusScale: 30,
      radiusMinPixels: 1,
      radiusMaxPixels: 30
    });
  }

  // Set your mapbox token here
  mapboxgl.accessToken = process.env.MapboxAccessToken; // eslint-disable-line

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    // Note: deck.gl will be in charge of interaction and event handling
    interactive: false,
    center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
    zoom: INITIAL_VIEW_STATE.zoom,
    bearing: INITIAL_VIEW_STATE.bearing,
    pitch: INITIAL_VIEW_STATE.pitch
  });

  const deck = new Deck({
    canvas: 'deck-canvas',
    width: '100%',
    height: '100%',
    initialViewState: INITIAL_VIEW_STATE,
    controller: true,
    onViewStateChange: ({viewState}) => {
      map.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        bearing: viewState.bearing,
        pitch: viewState.pitch
      });
    },
    _onMetrics(metrics) {
      fpsElement.innerHTML = `FPS: ${Math.round(metrics.fps)}`;
      cpuElement.innerHTML = `CPU Frame Time: ${metrics.cpuTimePerFrame.toFixed(2)}`;
      gpuElement.innerHTML = `GPU Frame Time: ${metrics.gpuTimePerFrame.toFixed(2)}`;
    },
    layers
  });

  requestAnimationFrame(function shake() {
    requestAnimationFrame(shake);

    const viewState = deck.viewManager.getViewState();
    deck.setProps({
      viewState: Object.assign({}, viewState, {
        latitude: viewState.latitude + (Math.random() * 0.00002 - 0.00001),
        longitude: viewState.longitude + (Math.random() * 0.00002 - 0.00001)
      })
    });
  });
};
