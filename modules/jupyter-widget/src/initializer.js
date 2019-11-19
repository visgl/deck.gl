/* global document */
import makeTooltip from './widget-tooltip';

export default function createDeckFromDependencies({
  dependencies,
  jsonConverterConfiguration,
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
    const {deck, mapboxgl} = dependencies;

    const jsonConverter = new deck.JSONConverter({
      configuration: jsonConverterConfiguration
    });

    const props = jsonConverter.convert(jsonInput);

    const getTooltip = makeTooltip(tooltip);

    container.appendChild(document.createElement('canvas'));
    const canvas = container.firstElementChild;

    const deckgl = new deck.Deck({
      ...props,
      map: mapboxgl,
      mapboxApiAccessToken: mapboxApiKey,
      onClick: handleClick,
      getTooltip,
      canvas
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
