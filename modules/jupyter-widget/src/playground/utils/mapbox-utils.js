// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {loadCSS} from './css-utils';

import mapboxgl from 'mapbox-gl';

const MAPBOX_CSS_URL = 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.13.2/mapbox-gl.css';

export default mapboxgl;

export function loadMapboxCSS(url = MAPBOX_CSS_URL) {
  loadCSS(url);
}

/**
 * Hides elements in the mapbox-gl.js library and adds pydeck tag
 */
export function modifyMapboxElements() {
  const classes = ['mapboxgl-missing-css'];
  for (const c of classes) {
    const el = document.getElementsByClassName(c)[0];
    if (el && el.style) {
      el.style.display = 'none';
    }
  }
}
