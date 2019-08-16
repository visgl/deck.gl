/* global requirejs, define, document */
function loadCss(url) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
}

// Note: This code executes in a Jupyter notebook environment
// Jupyter notebooks most often load JS modules via RequireJS and
// include RequireJS globally
function setDependencies(callback) {
  requirejs.config({
    paths: {
      deckgl: 'https://unpkg.com/deck.gl@~7.2.0/dist.min',
      mapboxgl: 'https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.1/mapbox-gl',
      h3: 'https://unpkg.com/h3-js@3.4.3/dist/h3-js.umd',
      S2: 'https://unpkg.com/s2-geometry@1.2.10/src/s2geometry'
    },
    shim: {
      deckgl: ['h3', 'S2']
    }
  });

  define(['deckgl', 'mapboxgl'], (deckLib, mapboxLib) => {
    callback(deckLib, mapboxLib);
  });
}

function createWidgetDiv({parentDiv, idName, done, width = 500, height = 500}) {
  const div = document.createElement('div');
  div.style.height = `${height}px`;
  div.style.width = `${width}px`;
  div.id = idName;

  parentDiv.appendChild(div);
  done();
}

/**
 * Hides a warning in the mapbox-gl.js library from surfacing in the notebook as text.
 */
function hideMapboxCSSWarning() {
  const missingCssWarning = document.getElementsByClassName('mapboxgl-missing-css')[0];
  if (missingCssWarning) {
    missingCssWarning.style.display = 'none';
  }
}

export {createWidgetDiv, loadCss, hideMapboxCSSWarning, setDependencies};
