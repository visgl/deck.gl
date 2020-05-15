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
 * Hides a warning in the mapbox-gl.js library from surfacing in the notebook as text.
 */
export function hideMapboxCSSWarning() {
  const missingCssWarning = document.getElementsByClassName('mapboxgl-missing-css')[0];
  if (missingCssWarning) {
    missingCssWarning.style.display = 'none';
  }
}
