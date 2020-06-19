/* global console, window */
/* eslint-disable no-console */
import {CSVLoader} from '@loaders.gl/csv';
import {registerLoaders} from '@loaders.gl/core';
import GL from '@luma.gl/constants';

import makeTooltip from './widget-tooltip';

import mapboxgl from './utils/mapbox-utils';
import {loadScript} from './utils/script-utils';
import {createGoogleMapsDeckOverlay} from './utils/google-maps-utils';

import {addSupportComponents} from '../lib/components/index';

import * as deck from '../deck-bundle';

function extractClasses(library = {}) {
  // Extracts exported class constructors as a dictionary from a library
  const classesDict = {};
  const classes = Object.keys(library).filter(x => x.charAt(0) === x.charAt(0).toUpperCase());
  for (const cls of classes) {
    classesDict[cls] = library[cls];
  }
  return classesDict;
}

// Handle JSONConverter and loaders configuration
const jsonConverterConfiguration = {
  classes: extractClasses(deck),
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    COORDINATE_SYSTEM: deck.COORDINATE_SYSTEM,
    GL
  }
};

registerLoaders([CSVLoader]);

const jsonConverter = new deck.JSONConverter({
  configuration: jsonConverterConfiguration
});

function addModuleToConverter(module, converter) {
  const newConfiguration = {
    classes: extractClasses(module)
  };
  converter.mergeConfiguration(newConfiguration);
}

export function addCustomLibraries(customLibraries, onComplete) {
  if (!customLibraries) {
    return;
  }

  const loaded = {};

  function onEachFinish() {
    if (Object.values(loaded).every(f => f)) {
      // when all libraries loaded
      if (typeof onComplete === 'function') onComplete();
    }
  }

  function onModuleLoaded(libraryName, module) {
    addModuleToConverter(module, jsonConverter);
    loaded[libraryName] = module;
    onEachFinish();
  }

  customLibraries.forEach(({libraryName, resourceUri}) => {
    // set loaded to be false, even if addCustomLibraries is called multiple times
    // with the same parameters
    loaded[libraryName] = false;

    if (libraryName in window) {
      // do not redefine
      onModuleLoaded(libraryName, window[libraryName]);
      return;
    }

    // because loadscript is async and scipt execution is untraceble
    // the only way we can listen on its execution complete is to observe on the
    // window.libraryName property
    Object.defineProperty(window, libraryName, {
      set: module => onModuleLoaded(libraryName, module),
      get: () => {
        return loaded[libraryName];
      }
    });

    loadScript(resourceUri);
  });
}

function updateDeck(inputJson, deckgl) {
  const results = jsonConverter.convert(inputJson);
  deckgl.setProps(results);
}

function missingLayers(oldLayers, newLayers) {
  return oldLayers.filter(ol => ol && ol.id && !newLayers.find(nl => nl.id === ol.id));
}

function createStandaloneFromProvider(
  mapProvider,
  {props, mapboxApiKey, googleMapsKey, handleClick, getTooltip, container}
) {
  switch (mapProvider) {
    case 'mapbox':
      deck.log.info('Using Mapbox base maps')();
      return new deck.DeckGL({
        ...props,
        map: mapboxgl,
        mapboxApiAccessToken: mapboxApiKey,
        onClick: handleClick,
        getTooltip,
        container
      });
    case 'google_maps':
      deck.log.info('Using Google Maps base maps')();
      return createGoogleMapsDeckOverlay({
        props,
        googleMapsKey,
        onClick: handleClick,
        getTooltip,
        container
      });
    default:
      deck.log.info('No recognized map provider specified')();
      return new deck.DeckGL({
        ...props,
        map: null,
        mapboxApiAccessToken: null,
        onClick: handleClick,
        getTooltip,
        container
      });
  }
}

function createDeck({
  mapboxApiKey,
  googleMapsKey,
  container,
  jsonInput,
  tooltip,
  handleClick,
  handleWarning,
  customLibraries
}) {
  let deckgl;
  try {
    const oldLayers = jsonInput.layers || [];
    const props = jsonConverter.convert(jsonInput);

    addSupportComponents(container, props);

    const convertedLayers = (props.layers || []).filter(l => l);

    // loading custom library is async, some layers might not be convertable before custom library loads
    const layerToLoad = missingLayers(oldLayers, convertedLayers);
    const getTooltip = makeTooltip(tooltip);
    const {mapProvider} = props;

    const standaloneArgs = {props, mapboxApiKey, googleMapsKey, handleClick, getTooltip, container};

    deckgl = createStandaloneFromProvider(mapProvider, standaloneArgs);

    const onComplete = () => {
      if (layerToLoad.length) {
        // convert input layer again to presist layer order
        const newProps = jsonConverter.convert({layers: jsonInput.layers});
        const newLayers = (newProps.layers || []).filter(l => l);

        if (newLayers.length > convertedLayers.length) {
          // if more layers are converted
          deckgl.setProps({layers: newLayers});
        }
      }
    };

    addCustomLibraries(customLibraries, onComplete);

    // TODO overrride console.warn instead
    // Right now this isn't doable (in a Notebook at least)
    // because the widget loads in deck.gl (and its logger) before @deck.gl/jupyter-widget
    if (handleWarning) {
      const warn = deck.log.warn;
      deck.log.warn = injectFunction(warn, handleWarning);
    }
  } catch (err) {
    // This will fail in node tests
    // eslint-disable-next-line
    console.error(err);
  }
  return deckgl;
}

function injectFunction(warnFunction, messageHandler) {
  return (...args) => {
    messageHandler(...args);
    return warnFunction(...args);
  };
}

export {createDeck, updateDeck, jsonConverter};
