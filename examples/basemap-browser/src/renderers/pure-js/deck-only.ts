// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import type {Config} from '../../types';
import {getBaseMapViewState} from '../../config';

export function mount(container: HTMLElement, config: Config): () => void {
  const {initialViewState, layers, multiView, views, layerFilter, globe, onViewStateChange} =
    config;

  // Create a wrapper div for Deck to render into
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width: 100%; height: 100%; position: relative; background: #1a1a2e;';
  container.appendChild(wrapper);

  // For multi-view, use the mapbox view state as the main view
  const viewState = getBaseMapViewState(initialViewState);

  const deckConfig: any = {
    parent: wrapper,
    width: '100%',
    height: '100%',
    initialViewState: viewState,
    controller: true,
    layers
  };

  // Use GlobeView for globe projection
  if (globe) {
    const globeView = new GlobeView({id: 'globe'});
    if (multiView && views) {
      // Combine GlobeView with other views
      deckConfig.views = [globeView, ...views];
      deckConfig.initialViewState = initialViewState;
    } else {
      deckConfig.views = globeView;
    }
  } else if (multiView && views) {
    // For deck-only multi-view, add a main MapView since there's no basemap
    // Use 'mapbox' as ID to match the view state key in MultiViewState
    const mainView = new MapView({id: 'mapbox', controller: true});
    deckConfig.views = [mainView, ...views];
    deckConfig.initialViewState = initialViewState;
  }

  if (multiView && layerFilter) {
    deckConfig.layerFilter = layerFilter;
  }

  if (onViewStateChange) {
    deckConfig.onViewStateChange = ({viewState: vs}: {viewState: any}) => {
      // Only report view state if it has lat/lng (skip ortho view state changes)
      if (vs.latitude !== undefined && vs.longitude !== undefined) {
        onViewStateChange({
          latitude: vs.latitude,
          longitude: vs.longitude,
          zoom: vs.zoom,
          bearing: vs.bearing,
          pitch: vs.pitch
        });
      }
    };
  }

  const deck = new Deck(deckConfig);

  return () => {
    deck.finalize();
  };
}
