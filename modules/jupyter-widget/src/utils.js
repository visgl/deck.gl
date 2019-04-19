/**
 * Gets CSS from a given URL and appends it to the document head
 * @param url URL of CSS page
 */
function loadCss(url) {
  let link = document.createElement('link'); //eslint-disable-line
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link); //eslint-disable-line
}

/**
 * Creates a div of 500px by 500px for the Jupyter widget
 * @param idName ID attribute of div
 * @return div object for appending to the document
 */
function createWidgetDiv(idName) {
  let div = document.createElement('div'); //eslint-disable-line
  div.style.width = '500px';
  div.style.height = '500px';
  div.id = idName;
  return div;
}

/**
 * Creates a canvas for the Jupyter widget
 * @param idName ID attribute of canvas
 * @return canvas canvas for appending
 */
function createCanvas(idName) {
  let canvas = document.createElement('canvas'); //eslint-disable-line
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
  let div = document.createElement('div'); //eslint-disable-line
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
  let missingCssWarning = document.getElementsByClassName('mapboxgl-missing-css')[0]; //eslint-disable-line
  if (missingCssWarning) {
    missingCssWarning.style.display = 'none';
  }
}

/**
 * Appends all DOM elements for the deck.gl widget at the specified root node
 * @param rootElement ID attribute of div
 */
function createDeckScaffold(rootElement) {
  const mapNode = createMapDiv('map');
  const canvasNode = createCanvas('deck-map-container');
  const mapWrapperNode = createWidgetDiv('deck-map-wrapper');
  mapWrapperNode.appendChild(canvasNode);
  mapWrapperNode.appendChild(mapNode);
  rootElement.appendChild(createWidgetDiv('deck-container')).appendChild(mapWrapperNode);
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
      zoom: viewState.zoom || 10,
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
