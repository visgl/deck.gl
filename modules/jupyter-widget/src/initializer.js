import makeTooltip from './widget-tooltip';

export default function createDeckFromDependencies({
  dependencies,
  mapboxApiKey,
  container,
  jsonInput,
  tooltip,
  onComplete,
  handleClick
}) {
  try {
    // Filter down to the deck.gl classes of interest
    const {deck, loaders, mapboxgl} = dependencies;
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
}
