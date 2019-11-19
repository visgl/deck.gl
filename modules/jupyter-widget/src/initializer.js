import makeTooltip from './widget-tooltip';

// Build path shared by three access points
export default function createDeckFromDependencies({
  dependencies,
  mapboxApiKey,
  container,
  jsonInput,
  tooltip,
  onComplete,
  handleClick,
  handleWarning
}) {
  try {
    // Filter down to the deck.gl classes of interest
    const {deck, loaders, mapboxgl} = dependencies;
    const classesDict = {};
    const classes = Object.keys(deck).filter(
      x => (x.indexOf('Layer') > 0 || x.indexOf('View') > 0) && x.indexOf('_') !== 0
    );
    classes.map(k => (classesDict[k] = deck[k]));

    loaders.registerLoaders([loaders.CSVLoader, loaders.Tile3DLoader, loaders.LASWorkerLoader]);

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

    const warn = deck.log.warn;
    // TODO overrride console.warn instead
    // Right now this isn't doable (in a Notebook at least)
    // because the widget loads in deck.gl (and its logger) before @deck.gl/jupyter-widget
    deck.log.warn = injectFunction(warn, handleWarning);

    if (onComplete) {
      onComplete({jsonConverter, deckgl});
    }
  } catch (err) {
    // This will fail in node tests
    // eslint-disable-next-line
    console.error(err);
  }
  return {};
}

function injectFunction(warnFunction, messageHandler) {
  return (...args) => {
    messageHandler(...args);
    return warnFunction(...args);
  };
}
