// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import 'client-only';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import type {GoogleMapsOverlayProps} from '@deck.gl/google-maps';
import {attachGoogleMap, type GoogleMap} from './attach-google-map';
import {createDeckGL} from './components';
import type {DeckGLRootProps} from '../types/index';

/** Props accepted by the Google Maps-overlay React Fiber root. */
export type GoogleMapsDeckGLProps = DeckGLRootProps<
  GoogleMapsOverlay,
  GoogleMapsOverlayProps,
  GoogleMap
>;

/** A React Fiber root backed by one GoogleMapsOverlay. */
export const DeckGL = createDeckGL<GoogleMapsOverlayProps, GoogleMapsOverlay, GoogleMap>({
  createExternalOverlay: props => new GoogleMapsOverlay(props),
  /** `GoogleMapsOverlay` reads `interleaved` only when it creates its map overlays. */
  recreateOverlayOnChange: ['interleaved'],
  /** `GoogleMapsOverlay` draws one view, which follows the map camera, so JSX views are not sent. */
  forwardViews: false,
  /** Adds the overlay to the `map` prop's map with `setMap`. */
  attach: attachGoogleMap
});

export type {GoogleMap, GoogleMapsOverlay, GoogleMapsOverlayProps};
