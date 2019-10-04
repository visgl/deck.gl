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
