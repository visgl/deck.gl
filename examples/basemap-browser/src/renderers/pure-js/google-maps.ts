// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import type {Config} from '../../types';
import {getBaseMapViewState} from '../../config';

// Track if we're loading the API
let loadingPromise: Promise<any> | null = null;

function loadGoogleMapsAPI(apiKey: string): Promise<any> {
  // If already loaded, return immediately
  if ((window as any).google?.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  // If already loading, return existing promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // Load the script manually
  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=maps`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if ((window as any).google?.maps) {
        resolve((window as any).google.maps);
      } else {
        reject(new Error('Google Maps API loaded but google.maps not found'));
      }
    };

    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('Failed to load Google Maps API script'));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
}

export function mount(container: HTMLElement, config: Config): () => void {
  const {initialViewState, layers, interleaved, onViewStateChange} = config;
  const viewState = getBaseMapViewState(initialViewState);

  // eslint-disable-next-line no-process-env
  const apiKey = process.env.GoogleMapsAPIKey;
  // eslint-disable-next-line no-process-env
  const mapId = process.env.GoogleMapsMapId;

  if (!apiKey) {
    container.innerHTML = `
      <div style="padding: 20px; color: red; background-color: #ffebee; height: 100%;">
        <h3>Google Maps Configuration Required</h3>
        <p>Set GoogleMapsAPIKey and GoogleMapsMapId environment variables.</p>
      </div>
    `;
    return () => {};
  }

  let overlay: GoogleMapsOverlay | null = null;
  let boundsChangedListener: google.maps.MapsEventListener | null = null;
  let cancelled = false;

  // Load the API and create the map
  loadGoogleMapsAPI(apiKey)
    .then((googlemaps: any) => {
      if (cancelled) return;

      const map = new googlemaps.Map(container, {
        center: {lat: viewState.latitude, lng: viewState.longitude},
        zoom: viewState.zoom,
        heading: viewState.bearing || 0,
        tilt: viewState.pitch || 0,
        mapId
      });

      overlay = new GoogleMapsOverlay({
        interleaved,
        layers
      });

      overlay.setMap(map);

      if (onViewStateChange) {
        boundsChangedListener = map.addListener('bounds_changed', () => {
          const center = map.getCenter();
          if (center) {
            onViewStateChange({
              latitude: center.lat(),
              longitude: center.lng(),
              zoom: map.getZoom() || 0,
              bearing: map.getHeading() || 0,
              pitch: map.getTilt() || 0
            });
          }
        });
      }
    })
    .catch((error: Error) => {
      if (cancelled) return;

      container.innerHTML = `
        <div style="padding: 20px; color: red;">
          <h3>Google Maps Error</h3>
          <p>${error.message}</p>
        </div>
      `;
    });

  return () => {
    cancelled = true;
    if (boundsChangedListener) {
      google.maps.event.removeListener(boundsChangedListener);
      boundsChangedListener = null;
    }
    if (overlay) {
      overlay.finalize();
      overlay = null;
    }
  };
}
