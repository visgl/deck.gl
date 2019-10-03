/* global document, window*/
import {DeckGLModel, DeckGLView} from './widget';
import createDeckFromDependencies from './initializer';

function addScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(`Failed to load script ${url}`);
    };
    document.body.appendChild(script);
  });
}

// TODO where to keep these requirements so that they're centralized?
// Duplicates of requirements in bindings/python/pydeck/requirejs_dependencies.json
const REQUIREMENTS = [
  'https://unpkg.com/deck.gl/dist.min.js',
  'https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.js',
  'https://unpkg.com/h3-js@^3.4.3/dist/h3-js.umd.js',
  'https://bundle.run/s2-geometry@1.2.10?name=index.js',
  'https://unpkg.com/@loaders.gl/csv@1.2.2/dist/dist.min.js'
];

for (const r of REQUIREMENTS) {
  addScript(r);
}

function createDeckWithImport(...args) {
  const {deck, loaders, mapboxgl} = window;
  const dependencies = {deck, loaders, mapboxgl};
  createDeckFromDependencies(dependencies, ...args);
}

DeckGLView.deckInitFunction = createDeckWithImport;
export {DeckGLView, DeckGLModel};
