/* global window, document */
/* eslint-disable max-statements */
import Mapbox from 'react-map-gl/dist/es6/mapbox/mapbox';

import {Deck} from '@deck.gl/core';

const CANVAS_STYLE = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
};

// Supports old "geospatial view state as separate props" style
// TODO - this should either be moved into the core or deprecated
function getViewState(props) {
  if (!props.viewState && 'latitude' in props && 'longitude' in props && 'zoom' in props) {
    const {latitude, longitude, zoom, pitch = 0, bearing = 0} = props;
    return {latitude, longitude, zoom, pitch, bearing};
  }
  return props.viewState;
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

    const viewState = props.initialViewState || getViewState(props);
    const isMap = Number.isFinite(viewState.latitude);
    const {map = window.mapboxgl, controller = true} = props;

    super(
      Object.assign({}, props, {
        width: '100%',
        height: '100%',
        canvas: deckCanvas,
        controller,
        initialViewState: viewState
      })
    );

    if (map && map.Map) {
      // Default create mapbox map
      this._map =
        isMap &&
        new Mapbox(
          Object.assign({}, props, {
            viewState,
            container: mapCanvas,
            mapboxgl: map
          })
        );
    } else {
      this._map = map;
    }

    // Update base map
    this._onBeforeRender = params => {
      this.onBeforeRender(params);
      if (this._map) {
        const viewport = this.getViewports()[0];
        this._map.setProps({
          width: viewport.width,
          height: viewport.height,
          viewState: viewport
        });
      }
    };
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
    // Replace user callback with our own
    // `setProps` is first called in parent class constructor
    // During which this._onBeforeRender is not defined
    // It is called a second time in _onRendererInitialized with all current props
    if (
      'onBeforeRender' in props &&
      this._onBeforeRender &&
      props.onBeforeRender !== this._onBeforeRender
    ) {
      this.onBeforeRender = props.onBeforeRender;
      props.onBeforeRender = this._onBeforeRender;
    }

    super.setProps(props);
  }
}
