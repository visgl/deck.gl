/* global window, document */
/* eslint-disable max-statements */
import Mapbox from './mapbox';

import {experimental} from 'deck.gl/core';
const {Deck: DeckJS, OrbitView, MapControllerJS, OrbitControllerJS} = experimental;

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
  if (!props.viewState) {
    const {longitude, latitude, zoom, pitch = 0, bearing = 0} = props;
    props.viewState = {longitude, latitude, zoom, pitch, bearing};
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
 * @params controller (Object) - Controller class. Leave empty for auto detection
 */
export default class Deck extends DeckJS {
  constructor(props = {}) {
    if (typeof document === 'undefined') {
      // Not browser
      throw Error('Deck can only be used in the browser');
    }

    const {container, mapCanvas, deckCanvas} = createCanvas(props);
    const width = container.clientWidth;
    const height = container.clientHeight;

    const {map, controller} = props;

    normalizeProps(props);
    const isMap = Number.isFinite(props.viewState.latitude);
    const isOrbit = props.views && props.views[0] instanceof OrbitView;

    // Update viewport dimensions
    Object.assign(props, {
      width,
      height
    });

    super(
      Object.assign({}, props, {
        canvas: deckCanvas
      })
    );

    if (controller === undefined) {
      // Deduce controller class from viewport type
      let Controller;
      if (isMap) {
        Controller = MapControllerJS;
      } else if (isOrbit) {
        Controller = OrbitControllerJS;
      }

      this._controller =
        Controller &&
        new Controller(
          Object.assign({}, props.viewState, props, {
            canvas: deckCanvas,
            onViewportChange: this._onViewportChange
          })
        );
    } else if (controller) {
      this._controller = controller;
      controller.setProps({
        onViewportChange: this._onViewportChange
      });
    }

    if (map === undefined) {
      // Default create mapbox map
      this._map =
        isMap && window.mapboxgl && new Mapbox(Object.assign({}, props, {container: mapCanvas}));
    } else if (map) {
      this._map = map;
    }

    this._container = container;
    this._onViewportChange = this._onViewportChange.bind(this);
    this._resize = this._resize.bind(this);

    window.addEventListener('resize', this._resize);
    this._resize();
  }

  getMapboxMap() {
    return this._map && this._map.getMap();
  }

  finalize() {
    window.removeEventListener('resize', this._resize);

    if (this._controller) {
      this._controller.finalize();
    }
    if (this._map) {
      this._map.finalize();
    }

    this._container = null;
    super.finalize();
  }

  setProps(props) {
    if (this._controller) {
      this._controller.setProps(
        Object.assign({}, props.viewState, props, {
          onViewportChange: this._onViewportChange
        })
      );
    }
    if (this._map) {
      this._map.setProps(props.viewState);
    }

    super.setProps(props);
  }

  _onViewportChange(viewport) {
    const {viewState, onViewportChange} = this.props;

    this.setProps({
      viewState: Object.assign(viewState, viewport)
    });

    if (onViewportChange) {
      onViewportChange(viewport);
    }
  }

  _resize() {
    this.setProps({
      width: this._container.clientWidth,
      height: this._container.clientHeight
    });
  }
}
