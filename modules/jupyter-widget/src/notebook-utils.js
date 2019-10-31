/* global document, window */
import createDeckFromDependencies from './initializer';

const externalLibraires = [
  'https://unpkg.com/deck.gl/dist.min.js',
  'https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.js',
  'https://unpkg.com/h3-js@^3.4.3/dist/h3-js.umd.js',
  'https://bundle.run/s2-geometry@1.2.10?name=index.js',
  'https://unpkg.com/@loaders.gl/csv@1.2.2/dist/dist.min.js'
];

function getJsLib(url) {
  return new Promise((res, rej) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      res();
    };
    script.onerror = () => {
      rej();
    };
    document.head.append(script);
  });
}

export function initDeck({mapboxApiKey, container, jsonInput, tooltip, onComplete, handleClick}) {
  Promise.all(externalLibraires.map(lib => getJsLib(lib))).then(() => {
    const dependencies = {deck: window.deck, loaders: window.loaders, mapboxgl: window.mapboxgl};
    createDeckFromDependencies({
      dependencies,
      jsonInput,
      tooltip,
      onComplete,
      handleClick
    });
  });
}
