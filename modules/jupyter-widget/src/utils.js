/* global document */
function loadCss(url) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
}

function addScriptTag(el, src) {
  const script = document.createElement('script');
  script.src = src;
  el.appendChild(script);
}

function createWidgetDiv(parentDiv, idName, width = 500, height = 500) {
  const div = document.createElement('div');

  const CDN_DEPENDENCIES = [
    'https://unpkg.com/h3-js@3.4.3/dist/h3-js.umd',
    'https://unpkg.com/s2-geometry@1.2.10/src/s2geometry.js',
    'https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.js',
    'https://unpkg.com/deck.gl@~7.2.0/dist.min.js'
  ];

  for (const src of CDN_DEPENDENCIES) {
    addScriptTag(parentDiv, src);
  }
  parentDiv.appendChild(div);
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

export {createWidgetDiv, loadCss, hideMapboxCSSWarning};
