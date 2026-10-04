// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global console, window */
/* eslint-disable no-console */
import {CSVLoader} from '@loaders.gl/csv';
import {registerLoaders} from '@loaders.gl/core';

// Avoid calling it GL - would be removed by babel-plugin-inline-webgl-constants
import {GL as GLConstants} from '@luma.gl/webgl/constants';

import makeTooltip from './widget-tooltip';

import mapboxgl, {modifyMapboxElements} from './utils/mapbox-utils';
import {loadModule, loadScript} from './utils/script-utils';
import {createGoogleMapsDeckOverlay} from './utils/google-maps-utils';
import {createMapLibreDeckOverlay} from './utils/maplibre-utils';

import {addSupportComponents} from '../lib/components/index';
import {JSONPostProcessEffect} from './post-process-effect';

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
const JSON_CONVERTER_CONFIGURATION = {
  classes: {
    ...extractElements(deckExports, classesFilter),
    // PostProcessEffect requires a shader module as its first constructor argument
    PostProcessEffect: JSONPostProcessEffect,
    // Register lights exported with _ prefix under their canonical names
    SunLight: deckExports._SunLight,
    CameraLight: deckExports._CameraLight,
    // Register views exported with _ prefix under their canonical names
    GlobeView: deckExports._GlobeView,
    // Register widgets exported with _ prefix under their canonical names
    StatsWidget: deckExports._StatsWidget,
    ScaleWidget: deckExports._ScaleWidget,
    GeocoderWidget: deckExports._GeocoderWidget,
    SplitterWidget: deckExports._SplitterWidget,
    TimelineWidget: deckExports._TimelineWidget,
    // Register the extension exported with _ prefix under its canonical name
    TerrainExtension: deckExports._TerrainExtension
  },
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    COORDINATE_SYSTEM,
    GL: GLConstants
  }
};

registerLoaders([
  {
    ...CSVLoader,
    options: {...CSVLoader.options, csv: {...CSVLoader.options.csv, shape: 'object-row-table'}}
  }
]);

const jsonConverter = new JSONConverter({
  configuration: JSON_CONVERTER_CONFIGURATION
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

  // Every entry settles exactly once (loaded or failed), including entries that share a name
  let remaining = customLibraries.length;

  function onEachFinish() {
    remaining -= 1;
    if (remaining === 0) {
      // when all libraries loaded (or failed to load)
      if (typeof onComplete === 'function') onComplete();
    }
  }

  function onModuleLoaded(libraryName, module) {
    addModuleToConverter(module, jsonConverter);
    onEachFinish();
  }

  function onModuleFailed(libraryName, error) {
    // eslint-disable-next-line
    console.error(`Could not load custom library ${libraryName}`, error);
    // Settle the registration so initialization completes; the library's classes stay unregistered
    onEachFinish();
  }

  customLibraries.forEach(({libraryName, resourceUri, module}) => {
    if (module) {
      // Each registration receives the namespace of the module it asked for (loads are cached per
      // name and URL), so two registrations sharing a name but not a URL both get registered.
      loadModule(resourceUri, libraryName).then(
        namespace => onModuleLoaded(libraryName, namespace),
        error => onModuleFailed(libraryName, error)
      );
      return;
    }

    const existing = window[libraryName];
    if (existing) {
      // already loaded, by a script global or an earlier call
      onModuleLoaded(libraryName, existing);
      return;
    }

    // A classic script's load event fires right after it has executed, so window[libraryName] holds
    // what this script assigned (another script registered under the same name cannot have run in
    // between). Loads are cached per URL.
    loadScript(resourceUri).then(
      () => {
        const library = window[libraryName];
        if (library) {
          onModuleLoaded(libraryName, library);
        } else {
          onModuleFailed(
            libraryName,
            new Error(`${resourceUri} did not define window.${libraryName}`)
          );
        }
      },
      error => onModuleFailed(libraryName, error)
    );
  });
}

function updateDeck(inputJson, deckgl) {
  const results = jsonConverter.convert(inputJson);
  deckgl.setProps(results);
}

/**
 * Converts the JSON props used for the first render.
 * Custom libraries load asynchronously, after this conversion. A layer that references an
 * unloaded class as a nested object (e.g. `extensions: [{'@@type': 'CustomExtension'}]`)
 * throws when constructed, which would otherwise prevent the deck from being created. In that
 * case, render the layers and widgets that can be converted, and add the others once the custom
 * libraries have loaded.
 */
export function convertInitialJson(jsonInput, customLibraries) {
  try {
    return jsonConverter.convert(jsonInput);
  } catch (err) {
    if (!customLibraries || !customLibraries.length) {
      throw err;
    }
    const props = jsonConverter.convert({...jsonInput, layers: [], widgets: []});
    return {
      ...props,
      ...convertLayersAndWidgets(jsonInput, error =>
        log.warn(`Deferring until custom libraries load: ${error.message}`)()
      )
    };
  }
}

/**
 * Converts each layer and widget on its own, so that one that cannot be converted (e.g. because
 * its custom library failed to load) is left out without hiding the others.
 */
export function convertLayersAndWidgets({layers = [], widgets = []}, onError) {
  const convertEach = (items, key) =>
    items.map(item => {
      try {
        return jsonConverter.convert({[key]: [item]})[key][0];
      } catch (error) {
        onError(error);
        return null;
      }
    });
  return {layers: convertEach(layers, 'layers'), widgets: convertEach(widgets, 'widgets')};
}

function createStandaloneFromProvider({
  props,
  mapboxApiKey,
  googleMapsKey,
  handleEvent,
  getTooltip,
  container,
  onError
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
    : {};
  handlers.onError = onError;

  const sharedProps = {
    ...handlers,
    getTooltip,
    container
  };

  switch (props.mapProvider) {
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
    case 'maplibre':
      log.info('Using MapLibre')();
      return createMapLibreDeckOverlay({
        ...sharedProps,
        ...props
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
  configuration,
  showError
}) {
  let deckgl;
  const onError = e => {
    if (showError) {
      const uiErrorText = window.document.createElement('pre');
      uiErrorText.textContent = `Error: ${e.message}\nSource: ${e.source}\nLine: ${e.lineno}:${e.colno}\n${e.error ? e.error.stack : ''}`;
      uiErrorText.className = 'error_text';

      container.appendChild(uiErrorText);
    }

    // This will fail in node tests
    // eslint-disable-next-line
    console.error(e);
  };

  try {
    if (configuration) {
      jsonConverter.mergeConfiguration(configuration);
    }

    const oldLayers = jsonInput.layers || [];
    const oldWidgets = jsonInput.widgets || [];
    const props = convertInitialJson(jsonInput, customLibraries);

    addSupportComponents(container, props);

    const convertedLayers = (props.layers || []).filter(l => l);
    const convertedWidgets = (props.widgets || []).filter(w => w);

    // loading custom library is async, some layers/widgets might not be convertable before custom library loads
    const hasMissingProps =
      convertedLayers.length < oldLayers.length || convertedWidgets.length < oldWidgets.length;
    const getTooltip = makeTooltip(tooltip);

    deckgl = createStandaloneFromProvider({
      props,
      mapboxApiKey,
      googleMapsKey,
      handleEvent,
      getTooltip,
      container,
      onError
    });

    const onComplete = () => {
      if (hasMissingProps) {
        // Layers and widgets that still cannot be converted are reported and left out
        const newProps = convertLayersAndWidgets(jsonInput, onError);

        const newLayers = newProps.layers.filter(l => l);
        const newWidgets = newProps.widgets.filter(w => w);

        if (
          newLayers.length > convertedLayers.length ||
          newWidgets.length > convertedWidgets.length
        ) {
          // if more layers/widgets are converted
          deckgl.setProps({layers: newLayers, widgets: newWidgets});
        }
      }
    };

    addCustomLibraries(customLibraries, onComplete);
  } catch (err) {
    onError(err);
  }
  return deckgl;
}

export {createDeck, updateDeck, jsonConverter};
