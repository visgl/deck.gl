/* global process, document */
import {loadCSS} from './css-utils';

// SSR safe import (ensures this file can be imported under Node.js e.g. for tests)
// From https://github.com/mapbox/mapbox-gl-js/issues/4593#issuecomment-546290823
// eslint-disable-next-line no-undef
let mapboxgl;

if (process.browser) {
  mapboxgl = require('mapbox-gl');
}

const MAPBOX_CSS_URL = 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.css';

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
