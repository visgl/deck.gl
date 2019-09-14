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

export function initDeck({mapboxApiKey, container, jsonInput}, onComplete, handleClick) {
  require(['mapbox-gl', 'h3', 'S2'], mapboxgl => {
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

let lastPickedObject;
let lastTooltip;

function getTooltip(pickedInfo) {
  if (!pickedInfo.picked) {
    return null;
  }
  if (pickedInfo.object === lastPickedObject) {
    return lastTooltip;
  }
  const tooltip = {
    html: tabularize(pickedInfo.object),
    style: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      display: 'flex',
      flex: 'wrap',
      maxWidth: '500px',
      flexDirection: 'column',
      zIndex: 2
    }
  };
  lastTooltip = tooltip;
  lastPickedObject = pickedInfo.object;
  return tooltip;
}

function tabularize(json) {
  const dataTable = document.createElement('div');
  dataTable.className = 'dataTable';

  for (const key in json) {
    const row = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'header';
    header.innerText = key;
    Object.assign(header.style, {
      fontWeight: 500,
      marginRight: '10px'
    });
    const value = document.createElement('div');
    value.className = 'value';
    value.innerText = JSON.stringify(json[key]);
    Object.assign(value.style, {
      float: 'right',
      margin: 'header'
    });
    value.style.margin = 'header';
    row.appendChild(header);
    row.appendChild(value);
    Object.assign(row.style, {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch'
    });
    dataTable.appendChild(row);
  }
  return dataTable.innerHTML;
}
