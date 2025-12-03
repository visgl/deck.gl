// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import ControlPanel from './control-panel';
import type {BasemapExample} from './types';
import * as pureJSExamples from './examples-pure-js';
import * as reactExamples from './examples-react';

// Two separate React roots
const controlsDiv = document.getElementById('controls')!;
const mapDiv = document.getElementById('map')!;

const controlRoot = createRoot(controlsDiv);

// Track current map state
let currentMapCleanup: (() => void) | null = null;
let currentMapRoot: Root | null = null;

// Load an example into the map div
function loadExample(example: BasemapExample, interleaved: boolean) {
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

  // Mount new example
  if (example.framework === 'pure-js') {
    // Pure JS mounts directly, no React involved
    switch (example.mapType) {
      case 'google-maps':
        currentMapCleanup = pureJSExamples.googleMaps.mount(
          mapDiv,
          example.getLayers,
          example.initialViewState,
          interleaved
        );
        break;
      case 'mapbox':
        currentMapCleanup = pureJSExamples.mapbox.mount(
          mapDiv,
          example.getLayers,
          example.initialViewState,
          example.mapStyle!,
          interleaved
        );
        break;
      case 'maplibre':
        currentMapCleanup = pureJSExamples.maplibre.mount(
          mapDiv,
          example.getLayers,
          example.initialViewState,
          example.mapStyle!,
          interleaved,
          example.globe
        );
        break;
      default:
        // Unknown map type
        break;
    }
  } else {
    // React mounts to separate root
    currentMapRoot = createRoot(mapDiv);
    const Component = reactExamples.getComponent(example.mapType);
    currentMapRoot.render(<Component example={example} interleaved={interleaved} />);
  }
}

// Render control panel (always React)
controlRoot.render(<ControlPanel onExampleChange={loadExample} />);
