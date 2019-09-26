import makeTooltip from './widget-tooltip';

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

export function updateDeck(inputJSON, {jsonConverter, deckgl}) {
  const results = jsonConverter.convert(inputJSON);
  deckgl.setProps(results);
}

export function initDeck({mapboxApiKey, container, jsonInput, tooltip, onComplete, handleClick}) {
  require(['mapbox-gl', 'h3', 's2Geometry'], mapboxgl => {
    require(['deck.gl', 'loaders.gl/csv'], (deck, loaders) => {
      try {
        // Filter down to the deck.gl classes of interest
        const classesDict = {};
        const classes = Object.keys(deck).filter(
          x => (x.indexOf('Layer') > 0 || x.indexOf('View') > 0) && x.indexOf('_') !== 0
        );
        classes.map(k => (classesDict[k] = deck[k]));

        loaders.registerLoaders([loaders.CSVLoader]);

        const jsonConverter = new deck.JSONConverter({
          configuration: {
            classes: classesDict
          }
        });

        const props = jsonConverter.convert(jsonInput);

        const getTooltip = makeTooltip(tooltip);

        const deckgl = new deck.DeckGL({
          ...props,
          map: mapboxgl,
          mapboxApiAccessToken: mapboxApiKey,
          onClick: handleClick,
          getTooltip,
          container
        });
        if (onComplete) {
          onComplete({jsonConverter, deckgl});
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
