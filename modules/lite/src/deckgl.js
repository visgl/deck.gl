/* global window, document */
/* eslint-disable max-statements */
import Mapbox from 'react-map-gl/src/mapbox/mapbox';

import {Deck} from '@deck.gl/core';

const CANVAS_STYLE = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
};

// Add missing props for compatibility
function normalizeProps(props) {
  // Support old "geospatial view state as separate props" style
  if (!props.initialViewState) {
    const {longitude, latitude, zoom, pitch = 0, bearing = 0} = props;
    props.initialViewState = props.viewState || {longitude, latitude, zoom, pitch, bearing};
  }
}

// Create canvas elements for map and deck
function createCanvas(props) {
  let {container = document.body} = props;

  if (typeof container === 'string') {
    container = document.getElementById(container);
  }

  if (!container) {
    throw Error('Deck: container not found');
  }

  // Add DOM elements
  const containerStyle = window.getComputedStyle(container);
  if (containerStyle.position === 'static') {
    container.style.position = 'relative';
  }

  const mapCanvas = document.createElement('div');
  container.appendChild(mapCanvas);
  Object.assign(mapCanvas.style, CANVAS_STYLE);

  const deckCanvas = document.createElement('canvas');
  container.appendChild(deckCanvas);
  Object.assign(deckCanvas.style, CANVAS_STYLE);

  return {container, mapCanvas, deckCanvas};
}

/**
 * @params container (Element) - DOM element to add deck.gl canvas to
 * @params map (Object) - map API. Set to falsy to disable
 * @params controller (Object) - Controller options. Leave empty for auto detection
 */
export default class DeckGL extends Deck {
  constructor(props = {}) {
    if (typeof document === 'undefined') {
      // Not browser
      throw Error('Deck can only be used in the browser');
    }

    const {mapCanvas, deckCanvas} = createCanvas(props);

    normalizeProps(props);
    const isMap = Number.isFinite(props.initialViewState.latitude);
    const {map = window.mapboxgl, controller = true} = props;

    super(
      Object.assign({}, props, {
        width: '100%',
        height: '100%',
        canvas: deckCanvas,
        controller,
        onViewStateChange: ({viewState}) =>
          this._map && this._map.setProps({viewState}) && viewState
      })
    );

    if (map && map.Map) {
      // Default create mapbox map
      this._map =
        isMap &&
        new Mapbox(
          Object.assign({}, props, {
            container: mapCanvas,
            mapboxgl: map
          })
        );
    } else {
      this._map = map;
    }
  }

  getMapboxMap() {
    return this._map && this._map.getMap();
  }

  finalize() {
    if (this._map) {
      this._map.finalize();
    }

    super.finalize();
  }

  setProps(props) {
    if (this._map) {
      this._map.setProps(props);
    }

    super.setProps(props);
  }
}
