/* global document */
/**
 * Gets CSS from a given URL and appends it to the document head
 * @param url URL of CSS page
 */
function loadCss(url) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
}

/**
 * Creates a div of a default 500px by 500px for the Jupyter widget
 * @param idName ID attribute of div
 * @param width Width of div in pixels (defaults to 500)
 * @param height Height of div in pixels (defaults to 500)
 * @return div object for appending to the document
 */
function createWidgetDiv(idName, width = 500, height = 500) {
  const div = document.createElement('div');
  div.style.width = `${width}px`;
  div.style.height = `${height}px`;
  div.id = idName;
  return div;
}

/**
 * Creates a canvas for the Jupyter widget
 * @param idName ID attribute of canvas
 * @return canvas canvas for appending
 */
function createCanvas(idName) {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    width: '100%',
    height: '100%',
    position: 'absolute',
    'z-index': 2
  });
  canvas.id = idName;
  return canvas;
}

/**
 * Creates a div for the Jupyter widget's basemap
 * @param idName ID attribute of div
 * @return div object for appending to the document
 */
function createMapDiv(idName) {
  const div = document.createElement('div');
  Object.assign(div.style, {
    'pointer-events': 'none',
    height: '100%',
    width: '100%',
    position: 'absolute',
    'z-index': 1
  });
  div.id = idName;
  return div;
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

/**
 * Creates and appends all DOM elements for the deck.gl widget at the specified root node
 * @param rootElement ID attribute of div
 */
function createDeckScaffold(rootElement, width = 500, height = 500) {
  const mapNode = createMapDiv('map');
  const canvasNode = createCanvas('deck-map-container');
  const mapWrapperNode = createWidgetDiv('deck-map-wrapper', width, height);
  mapWrapperNode.appendChild(canvasNode);
  mapWrapperNode.appendChild(mapNode);
  rootElement
    .appendChild(createWidgetDiv('deck-container', width, height))
    .appendChild(mapWrapperNode);
}

/**
 * Sets common properties for basemap
 * @param map ID attribute of div
 * @param props ID attribute of div
 * @return div object for appending to the document
 */
function setMapProps(map, props) {
  if ('viewState' in props && props.viewState.longitude && props.viewState.latitude) {
    const {viewState} = props;
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: Number.isFinite(viewState.zoom) ? viewState.zoom : 10,
      bearing: viewState.bearing || 0,
      pitch: viewState.pitch || 0
    });
  }

  if (props.map && 'style' in props.map) {
    if (props.map.style !== map.deckStyle) {
      map.setStyle(props.map.style);
      map.deckStyle = props.map.style;
    }
  }
}

export {createDeckScaffold, loadCss, hideMapboxCSSWarning, setMapProps};
