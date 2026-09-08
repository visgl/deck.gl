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

registerLoaders([CSVLoader]);

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

// Custom libraries whose load is in flight, keyed by library name. Script execution is asynchronous
// and untraceable, so completion is observed through a window[libraryName] accessor: classic scripts
// assign it themselves, and for ES modules loadModule() assigns the module namespace after import.
// One accessor is shared by every addCustomLibraries call waiting on the same library.
const pendingLibraries = {};

function watchLibrary(libraryName, onLoaded) {
  let pending = pendingLibraries[libraryName];
  if (!pending) {
    pending = {waiters: []};
    pendingLibraries[libraryName] = pending;
    Object.defineProperty(window, libraryName, {
      configurable: true,
      enumerable: true,
      get: () => undefined,
      set: loadedModule => {
        delete pendingLibraries[libraryName];
        // Replace the accessor with the namespace, as a plain script assignment would have
        Object.defineProperty(window, libraryName, {
          value: loadedModule,
          writable: true,
          configurable: true,
          enumerable: true
        });
        for (const waiter of pending.waiters) {
          waiter(loadedModule);
        }
      }
    });
  }
  pending.waiters.push(onLoaded);

  // Stop waiting (the caller's load failed); the accessor goes away with the last waiter so that a
  // later addCustomLibraries call retries the load
  return () => {
    pending.waiters = pending.waiters.filter(waiter => waiter !== onLoaded);
    if (!pending.waiters.length && pendingLibraries[libraryName] === pending) {
      delete pendingLibraries[libraryName];
      delete window[libraryName];
    }
  };
}

export function addCustomLibraries(customLibraries, onComplete) {
  if (!customLibraries) {
    return;
  }

  const loaded = {};
  const failed = {};

  function onEachFinish() {
    if (Object.keys(loaded).every(name => loaded[name] || failed[name])) {
      // when all libraries loaded (or failed to load)
      if (typeof onComplete === 'function') onComplete();
    }
  }

  function onModuleLoaded(libraryName, module) {
    addModuleToConverter(module, jsonConverter);
    loaded[libraryName] = module;
    onEachFinish();
  }

  function onModuleFailed(libraryName, error) {
    // eslint-disable-next-line
    console.error(`Could not load custom library ${libraryName}`, error);
    // Settle the registration so initialization completes; the library's classes stay unregistered
    failed[libraryName] = true;
    onEachFinish();
  }

  customLibraries.forEach(({libraryName, resourceUri, module}) => {
    // set loaded to be false, even if addCustomLibraries is called multiple times
    // with the same parameters
    loaded[libraryName] = false;

    const existing = window[libraryName];
    if (existing) {
      // already loaded, by a classic script global or an earlier call
      onModuleLoaded(libraryName, existing);
      return;
    }

    const unwatch = watchLibrary(libraryName, loadedModule =>
      onModuleLoaded(libraryName, loadedModule)
    );
    const loading = module ? loadModule(resourceUri, libraryName) : loadScript(resourceUri);
    loading.catch(error => {
      unwatch();
      onModuleFailed(libraryName, error);
    });
  });
}

function updateDeck(inputJson, deckgl) {
  const results = jsonConverter.convert(inputJson);
  deckgl.setProps(results);
}

function missingProps(oldProps, newProps) {
  return oldProps.filter(op => op && op.id && !newProps.find(np => np.id === op.id));
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
    const props = jsonConverter.convert(jsonInput);

    addSupportComponents(container, props);

    const convertedLayers = (props.layers || []).filter(l => l);
    const convertedWidgets = (props.widgets || []).filter(w => w);

    // loading custom library is async, some layers/widgets might not be convertable before custom library loads
    const layersToLoad = missingProps(oldLayers, convertedLayers);
    const widgetsToLoad = missingProps(oldWidgets, convertedWidgets);
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
      if (layersToLoad.length || widgetsToLoad.length) {
        const newProps = jsonConverter.convert({
          layers: jsonInput.layers,
          widgets: jsonInput.widgets
        });

        const newLayers = (newProps.layers || []).filter(l => l);
        const newWidgets = (newProps.widgets || []).filter(w => w);

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
