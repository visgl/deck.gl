/* global console, window */
/* eslint-disable no-console */
import {CSVLoader} from '@loaders.gl/csv';
import {registerLoaders} from '@loaders.gl/core';

// Make sure there is a device registered
import {luma} from '@luma.gl/api';
import {WebGLDevice} from '@luma.gl/webgl';
luma.registerDevices([WebGLDevice]);

// Avoid calling it GL - would be removed by babel-plugin-inline-webgl-constants
import {GL as GLConstants} from '@luma.gl/webgl-legacy';

import makeTooltip from './widget-tooltip';

import mapboxgl, {modifyMapboxElements} from './utils/mapbox-utils';
import {loadScript} from './utils/script-utils';
import {createGoogleMapsDeckOverlay} from './utils/google-maps-utils';

import {addSupportComponents} from '../lib/components/index';

/* eslint-disable import/namespace */
import * as deckExports from '../deck-bundle';
import {COORDINATE_SYSTEM, log, WebMercatorViewport} from '@deck.gl/core';
import {JSONConverter} from '@deck.gl/json';
import DeckGL from '@deck.gl/core/scripting/deckgl';

const classesFilter = x => x.charAt(0) === x.charAt(0).toUpperCase();
const functionsFilter = x => x.charAt(0) === x.charAt(0).toLowerCase() && x.charAt(0) !== '_';

function extractElements(library = {}, filter) {
  // Extracts exported elements as a dictionary from a library
  const dict = {};
  const elements = Object.keys(library).filter(filter);
  for (const el of elements) {
    dict[el] = library[el];
  }
  return dict;
}

// Handle JSONConverter and loaders configuration
const jsonConverterConfiguration = {
  classes: extractElements(deckExports, classesFilter),
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    COORDINATE_SYSTEM,
    GL: GLConstants
  }
};

registerLoaders([CSVLoader]);

const jsonConverter = new JSONConverter({
  configuration: jsonConverterConfiguration
});

function addModuleToConverter(module, converter) {
  const newConfiguration = {
    classes: extractElements(module, classesFilter),
    functions: extractElements(module, functionsFilter)
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

function createStandaloneFromProvider({
  mapProvider,
  props,
  mapboxApiKey,
  googleMapsKey,
  handleEvent,
  getTooltip,
  container
}) {
  // Common deck.gl props for all basemaos
  const handlers = handleEvent
    ? {
        onClick: info => handleEvent('deck-click-event', info),
        onHover: info => handleEvent('deck-hover-event', info),
        onResize: size => handleEvent('deck-resize-event', size),
        onViewStateChange: ({viewState, interactionState, oldViewState}) => {
          const viewport = new WebMercatorViewport(viewState);
          viewState.nw = viewport.unproject([0, 0]);
          viewState.se = viewport.unproject([viewport.width, viewport.height]);
          handleEvent('deck-view-state-change-event', viewState);
        },
        onDragStart: info => handleEvent('deck-drag-start-event', info),
        onDrag: info => handleEvent('deck-drag-event', info),
        onDragEnd: info => handleEvent('deck-drag-end-event', info)
      }
    : null;

  const sharedProps = {
    ...handlers,
    getTooltip,
    container
  };

  switch (mapProvider) {
    case 'mapbox':
      log.info('Using Mapbox base maps')();
      return new DeckGL({
        ...sharedProps,
        ...props,
        map: mapboxgl,
        mapboxApiAccessToken: mapboxApiKey,
        onLoad: modifyMapboxElements
      });
    case 'carto':
      log.info('Using Carto base maps')();
      return new DeckGL({
        map: mapboxgl,
        ...sharedProps,
        ...props
      });
    case 'google_maps':
      log.info('Using Google Maps base maps')();
      return createGoogleMapsDeckOverlay({
        ...sharedProps,
        ...props,
        googleMapsKey
      });
    default:
      log.info('No recognized map provider specified')();
      return new DeckGL({
        ...sharedProps,
        ...props,
        map: null,
        mapboxApiAccessToken: null
      });
  }
}

function createDeck({
  mapboxApiKey,
  googleMapsKey,
  container,
  jsonInput,
  tooltip,
  handleEvent,
  customLibraries,
  configuration
}) {
  let deckgl;
  try {
    if (configuration) {
      jsonConverter.mergeConfiguration(configuration);
    }

    const oldLayers = jsonInput.layers || [];
    const props = jsonConverter.convert(jsonInput);

    addSupportComponents(container, props);

    const convertedLayers = (props.layers || []).filter(l => l);

    // loading custom library is async, some layers might not be convertable before custom library loads
    const layerToLoad = missingLayers(oldLayers, convertedLayers);
    const getTooltip = makeTooltip(tooltip);
    const {mapProvider} = props;

    deckgl = createStandaloneFromProvider({
      mapProvider,
      props,
      mapboxApiKey,
      googleMapsKey,
      handleEvent,
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
  } catch (err) {
    // This will fail in node tests
    // eslint-disable-next-line
    console.error(err);
  }
  return deckgl;
}

export {createDeck, updateDeck, jsonConverter};
