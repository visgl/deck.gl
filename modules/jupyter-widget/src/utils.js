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

function getTooltip(pickedInfo) {
  if (!pickedInfo.picked) {
    return null;
  }
  return {
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

        const jsonConverter = new deckgl._JSONConverter({
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
          getTooltip,
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

function tabularize(json) {
  const dataTable = document.createElement('div');
  dataTable.className = 'dataTable';

  for (const key in json) {
    const row = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = key;
    header.style.fontWeight = 500;
    header.style.marginRight = '10px';
    const value = document.createElement('div');
    value.className = 'value';
    value.innerHTML = JSON.stringify(json[key]);
    value.style.float = 'right';
    value.style.margin = 'header';
    row.appendChild(header);
    row.appendChild(value);
    row.style.display = 'flex';
    row.style.flexDirection = 'row';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'stretch';
    dataTable.appendChild(row);
  }
  return dataTable.innerHTML;
}
