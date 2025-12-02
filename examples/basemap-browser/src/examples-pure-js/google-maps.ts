// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import type {Layer} from '@deck.gl/core';

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

export function mount(
  container: HTMLElement,
  getLayers: (interleaved?: boolean) => Layer[],
  initialViewState: any,
  interleaved: boolean
): () => void {
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

  // Load the API and create the map
  loadGoogleMapsAPI(apiKey)
    .then((googlemaps: any) => {
      const map = new googlemaps.Map(container, {
        center: {lat: initialViewState.latitude, lng: initialViewState.longitude},
        zoom: initialViewState.zoom,
        heading: initialViewState.bearing || 0,
        tilt: initialViewState.pitch || 0,
        mapId
      });

      overlay = new GoogleMapsOverlay({
        interleaved,
        layers: getLayers(interleaved)
      });

      overlay.setMap(map);
    })
    .catch((error: Error) => {
      container.innerHTML = `
        <div style="padding: 20px; color: red;">
          <h3>Google Maps Error</h3>
          <p>${error.message}</p>
        </div>
      `;
    });

  return () => {
    if (overlay) {
      overlay.finalize();
      overlay = null;
    }
  };
}
