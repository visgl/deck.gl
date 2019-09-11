/* global document */
export function loadCss(url) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
}

/**
 * Hides a warning in the mapbox-gl.js library from surfacing in the notebook as text.
 */
export function hideMapboxCSSWarning() {
  const missingCssWarning = document.getElementsByClassName('mapboxgl-missing-css')[0];
  if (missingCssWarning) {
    missingCssWarning.style.display = 'none';
  }
}

export function updateDeck(inputJSON, {jsonConverter, deckConfig}) {
  const results = jsonConverter.convertJsonToDeckProps(inputJSON);
  deckConfig.setProps(results);
}

export function initDeck({mapboxApiKey, container, jsonInput}, onComplete, handleClick) {
  require(['mapbox-gl', 'h3', 'S2'], mapboxgl => {
    require(['deck.gl'], deckgl => {
      try {
        const layersDict = {};
        const layers = Object.keys(deckgl).filter(
          x => x.indexOf('Layer') > 0 && x.indexOf('_') !== 0
        );
        layers.map(k => (layersDict[k] = deckgl[k]));

        const jsonConverter = new deckgl.JSONConverter({
          configuration: {
            layers: layersDict
          }
        });

        const deckConfig = new deckgl.DeckGL({
          map: mapboxgl,
          mapboxApiAccessToken: mapboxApiKey,
          latitude: 0,
          longitude: 0,
          zoom: 1,
          onClick: handleClick,
          container,
          onLoad: () => updateDeck(jsonInput, {jsonConverter, deckConfig})
        });
        if (onComplete) {
          onComplete({jsonConverter, deckConfig});
        }
      } catch (err) {
        // This will fail in node tests
        // eslint-disable-next-line
        console.error(err);
      }
      return {};
    });
  });
}
