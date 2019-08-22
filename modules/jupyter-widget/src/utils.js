/* global requirejs, document */
function loadCss(url) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
}

// requirejs is globally available in a Jupyter notebook
// Modules are defined in pydeck/static/nbextension/extension.js
function setDependencies(callback) {
  requirejs(['deckgl', 'mapboxgl'], (deckLib, mapboxLib) => {
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
