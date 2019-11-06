/* global requirejs */
/* Supports pydeck in a RequireJS-driven environment, like
 * a Jupyter notebook or pydeck's standalone HTML page.
 */
import createDeckFromDependencies from './initializer';

export function initDeck({mapboxApiKey, container, jsonInput, tooltip, onComplete, handleClick}) {
  requirejs(['mapbox-gl', 'h3', 's2Geometry'], mapboxgl => {
    requirejs(['deck.gl', 'loaders.gl/csv'], (deck, loaders) => {
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
