/* global document, window */
/* Supports pydeck in a RequireJS-driven environment, like
 * a Jupyter notebook or pydeck's standalone HTML page.
 */
import createDeckFromDependencies from './initializer';

const REQUIREJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js';

if (!window.require) {
  const requirejs = document.createElement('script');
  requirejs.setAttribute('src', REQUIREJS_URL);
  document.head.appendChild(requirejs);
}

export function loadCss(url) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
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

export function updateDeck(inputJSON, {jsonConverter, deckgl}) {
  const results = jsonConverter.convert(inputJSON);
  deckgl.setProps(results);
}

export function initDeck({mapboxApiKey, container, jsonInput, tooltip, onComplete, handleClick}) {
  require(['mapbox-gl', 'h3', 's2Geometry'], mapboxgl => {
    require(['deck.gl', 'loaders.gl/csv'], (deck, loaders) => {
      createDeckFromDependencies({
        dependencies: {deck, loaders, mapboxgl},
        mapboxApiKey,
        jsonInput,
        tooltip,
        onComplete,
        handleClick
      });
    });
  });
}
