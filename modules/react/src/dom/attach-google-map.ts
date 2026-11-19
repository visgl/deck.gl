// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

/// <reference types="google.maps" />
import type {GoogleMapsOverlay} from '@deck.gl/google-maps';

/** A Google Maps JavaScript API `google.maps.Map`, the value of the `/google-maps` `map` prop. */
export type GoogleMap = NonNullable<Parameters<GoogleMapsOverlay['setMap']>[0]>;

/** The part of `GoogleMapsOverlay` that attaching uses. */
export type GoogleMapOverlayLike = Pick<GoogleMapsOverlay, 'setMap'>;

/**
 * Adds the overlay to the map with `setMap` and returns a function that removes it.
 *
 * `GoogleMapsOverlay.setMap` returns early when the map is unchanged, so a Strict Mode effect
 * replay cannot add the overlay twice, and removing an overlay that is already off its map does
 * nothing. The overlay is added immediately: `GoogleMapsOverlay` waits for the map's rendering
 * type before it creates its deck.gl instance, and finalizing it removes it from its map.
 */
export function attachGoogleMap(map: GoogleMap, overlay: GoogleMapOverlayLike): () => void {
  overlay.setMap(map);
  return () => overlay.setMap(null);
}
