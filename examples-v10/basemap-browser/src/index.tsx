// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import ControlPanel from './control-panel';
import type {Config} from './types';
import * as renderers from './renderers';

// Two separate React roots
const controlsDiv = document.getElementById('controls')!;
const mapDiv = document.getElementById('map')!;

const controlRoot = createRoot(controlsDiv);

// Track current map state
let currentMapCleanup: (() => void) | null = null;
let currentMapRoot: Root | null = null;

// Load a configuration into the map div
function loadConfig(config: Config) {
  // Defer cleanup to avoid synchronous unmount during React render
  setTimeout(() => {
    // Clean up previous
    if (currentMapCleanup) {
      currentMapCleanup();
      currentMapCleanup = null;
    }
    if (currentMapRoot) {
      currentMapRoot.unmount();
      currentMapRoot = null;
    }

    // Clear the map div
    mapDiv.innerHTML = '';

    // Mount new configuration
    mountConfig(config);
  }, 0);
}

function mountConfig(config: Config) {
  if (config.framework === 'pure-js') {
    // Pure JS mounts directly, no React involved
    switch (config.basemap) {
      case 'deck-only':
        currentMapCleanup = renderers.pureJS.deckOnly.mount(mapDiv, config);
        break;
      case 'google-maps':
        currentMapCleanup = renderers.pureJS.googleMaps.mount(mapDiv, config);
        break;
      case 'mapbox':
        currentMapCleanup = renderers.pureJS.mapbox.mount(mapDiv, config);
        break;
      case 'maplibre':
        currentMapCleanup = renderers.pureJS.maplibre.mount(mapDiv, config);
        break;
      default:
        break;
    }
  } else {
    // React mounts to separate root
    currentMapRoot = createRoot(mapDiv);
    const Component = renderers.react.getComponent(config.basemap);
    currentMapRoot.render(<Component config={config} />);
  }
}

// Render control panel (always React)
controlRoot.render(<ControlPanel onConfigChange={loadConfig} />);
