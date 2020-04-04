/* global window */
import makeTooltip from './widget-tooltip';

import mapboxgl from './ssr-safe-mapbox';

import {CSVLoader} from '@loaders.gl/csv';
import {registerLoaders} from '@loaders.gl/core';

import * as deck from './deck-bundle';

import {CesiumIonLoader} from '@loaders.gl/3d-tiles';

import {loadScript} from './script-utils';

import GL from '@luma.gl/constants';

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
  },
  constants: {
    CesiumIonLoader
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

function addCustomLibraries(customLibraries, onComplete) {
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

function createDeck({
  mapboxApiKey,
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

    const convertedLayers = (props.layers || []).filter(l => l);

    // loading custom library is async, some layers might not be convertable before custom library loads
    const layerToLoad = missingLayers(oldLayers, convertedLayers);
    const getTooltip = makeTooltip(tooltip);

    deckgl = new deck.DeckGL({
      ...props,
      map: mapboxgl,
      mapboxApiAccessToken: mapboxApiKey,
      onClick: handleClick,
      getTooltip,
      container
    });

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

export {jsonConverter, createDeck, updateDeck, addCustomLibraries};
