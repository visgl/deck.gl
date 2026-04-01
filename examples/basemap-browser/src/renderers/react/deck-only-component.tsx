// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useMemo, useCallback} from 'react';
import DeckGL from '@deck.gl/react';
import {MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import type {Config} from '../../types';
import {getBaseMapViewState} from '../../config';

type DeckOnlyComponentProps = {
  config: Config;
};

export default function DeckOnlyComponent({config}: DeckOnlyComponentProps) {
  const {initialViewState, layers, multiView, views, layerFilter, globe, onViewStateChange} =
    config;

  const handleViewStateChange = useCallback(
    ({viewState: vs}: {viewState: any}) => {
      // Only report view state if it has lat/lng (skip ortho view state changes)
      if (vs.latitude !== undefined && vs.longitude !== undefined) {
        onViewStateChange?.({
          latitude: vs.latitude,
          longitude: vs.longitude,
          zoom: vs.zoom,
          bearing: vs.bearing,
          pitch: vs.pitch
        });
      }
    },
    [onViewStateChange]
  );

  // For multi-view, use the mapbox view state as the main view
  const viewState = getBaseMapViewState(initialViewState);

  // Compute effective views based on globe and multiView settings
  const effectiveViews = useMemo(() => {
    if (globe) {
      const globeView = new GlobeView({id: 'globe'});
      if (multiView && views) {
        // Combine GlobeView with other views
        return [globeView, ...views];
      }
      return globeView;
    }
    if (multiView && views) {
      // For deck-only multi-view, add a main MapView since there's no basemap
      // Use 'mapbox' as ID to match the view state key in MultiViewState
      const mainView = new MapView({id: 'mapbox', controller: true});
      return [mainView, ...views];
    }
    return undefined;
  }, [globe, multiView, views]);

  return (
    <div style={{width: '100%', height: '100%', position: 'relative', background: '#1a1a2e'}}>
      <DeckGL
        width="100%"
        height="100%"
        initialViewState={multiView ? initialViewState : viewState}
        controller={true}
        layers={layers}
        views={effectiveViews}
        layerFilter={multiView ? layerFilter : undefined}
        onViewStateChange={handleViewStateChange}
      />
    </div>
  );
}
