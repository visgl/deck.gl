/* eslint-disable no-console */
/* global document, window, console */

const dependencies = [
  // TODO centralize handling of dependencies
  {name: 'mapboxgl', url: 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.js'},
  {name: 'h3', url: 'https://unpkg.com/h3-js@^3.4.3/dist/h3-js.umd.js'},
  {name: 's2Geometry', url: 'https://bundle.run/s2-geometry@1.2.10?name=index.js'},
  {name: 'loaders', url: 'https://unpkg.com/@loaders.gl/csv@1.2.2/dist/dist.min.js'},
  {name: 'deck', url: 'https://unpkg.com/deck.gl/dist.min.js'}
];

function fetchJsLib(libName, url) {
  // Grabs a library with a labeled name and loads it from the specified url
  if (window.requirejs) {
    // In a Jupyter Notebook, where the requirejs variable is global
    return new Promise((res, rej) => window.requirejs([url], res, rej))
      .then(lib => {
        return new Promise((res, rej) => {
          window[libName] = lib;
          // Specifies for deck.gl later where to find h3 and s2geometry
          window.define(libName, window[libName]);
          res();
        });
      })
      .catch(err => console.error(err));
  }
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

export function fetchDependencies() {
  // Grabs all dependencies in the dependencies object above
  return new Promise((res, rej) => {
    Promise.all(
      dependencies.map(dep => {
        if (dep.name === 'deck') {
          // skip deck.gl until we're sure h3 and s2 have loaded
          return Promise.resolve();
        }
        return fetchJsLib(dep.name, dep.url);
      })
    )
      .then(() => {
        // h3 and s2 have loaded by now
        return fetchJsLib('deck', dependencies[dependencies.length - 1].url);
      })
      .then(() => {
        const {deck, loaders, mapboxgl} = window;
        console.log({deck, loaders, mapboxgl});
        res({deck, loaders, mapboxgl});
      })
      .catch(err => {
        rej(err);
      });
  });
}
