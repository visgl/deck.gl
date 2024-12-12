// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global window, document */
/* eslint-disable max-statements, import/no-extraneous-dependencies */
import {MapWrapper} from './map-wrapper';

import Deck, {DeckProps} from '../lib/deck';
import type WebMercatorViewport from '../viewports/web-mercator-viewport';
import type {MapViewState} from '../views/map-view';

const CANVAS_STYLE = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
};

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

type DeckGLProps = DeckProps & {
  /** DOM element to add deck.gl canvas to */
  container?: Element;
  /** base map library, mapboxgl or maplibregl */
  map?: any;
  /** URL to base map style JSON, see Mapbox/Maplibre documentation */
  mapStyle?: string;
  /** Access token if using Mapbox */
  mapboxApiAccessToken?: string;
  /** Directly passed to Map class constructor */
  mapOptions?: any;
};

/**
 * This is the scripting interface with additional logic to sync Deck with a mapbox-compatible base map
 * This class is intentionally NOT exported by package root (index.ts) to keep the core module
 * base map provider neutral.
 * Only exposed via the pre-built deck.gl bundle
 */
export default class DeckGL extends Deck {
  /** Base map instance */
  private _map: MapWrapper | false;

  constructor(props: DeckGLProps) {
    if (typeof document === 'undefined') {
      // Not browser
      throw Error('Deck can only be used in the browser');
    }

    const {mapCanvas, deckCanvas} = createCanvas(props);

    const viewState = (props.viewState || props.initialViewState) as MapViewState;
    const isMap = Number.isFinite(viewState && viewState.latitude);
    const {map = globalThis.mapboxgl || globalThis.maplibregl} = props;

    super({canvas: deckCanvas, ...props});

    if (map && map.Map) {
      // Default create mapbox map
      this._map =
        isMap &&
        new MapWrapper({
          ...props,
          width: 0,
          height: 0,
          viewState,
          container: mapCanvas,
          mapLib: map
        });
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
    if ('mapStyle' in props && this._map) {
      this._map.setProps({mapStyle: props.mapStyle});
    }

    super.setProps(props);
  }

  _drawLayers(redrawReason: string, options: any) {
    // Update the base map
    if (this._map) {
      const viewport = this.getViewports()[0] as WebMercatorViewport;
      if (viewport) {
        this._map.setProps({
          width: viewport.width,
          height: viewport.height,
          viewState: viewport
        });
      }
    }
    super._drawLayers(redrawReason, options);
  }
}
