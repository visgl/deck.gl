// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

/// <reference types="google.maps" />
import type {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {Map as MapLibreMap} from 'maplibre-gl';
import type {ComponentProps} from 'react';
import {describe, expectTypeOf, it} from 'vitest';
import {DeckGL as GoogleMapsDeckGL} from '@deck.gl/react/dom/google-maps';

declare const googleMap: google.maps.Map;
declare const maplibreMap: MapLibreMap;

describe('/google-maps root types', () => {
  it('accepts a google.maps.Map or null in map', () => {
    <GoogleMapsDeckGL map={googleMap} interleaved />;
    <GoogleMapsDeckGL map={null} interleaved={false} />;
    <GoogleMapsDeckGL />;
    expectTypeOf<ComponentProps<typeof GoogleMapsDeckGL>['map']>().toEqualTypeOf<
      google.maps.Map | null | undefined
    >();
  });

  it('rejects maps from other SDKs', () => {
    // @ts-expect-error a MapLibre map is not a google.maps.Map
    <GoogleMapsDeckGL map={maplibreMap} />;
    // @ts-expect-error a number is not a map
    <GoogleMapsDeckGL map={1} />;
  });

  it('rejects the props that the map owns', () => {
    // @ts-expect-error GoogleMapsOverlay takes its camera from the map
    <GoogleMapsDeckGL viewState={{longitude: 0, latitude: 0, zoom: 1}} />;
    // @ts-expect-error GoogleMapsOverlay has no controller; the map handles interaction
    <GoogleMapsDeckGL controller />;
    // @ts-expect-error GoogleMapsOverlay creates its own canvas
    <GoogleMapsDeckGL canvas="deck" />;
  });

  it('passes the GoogleMapsOverlay to ref and onDeckChange', () => {
    <GoogleMapsDeckGL
      ref={overlay => {
        expectTypeOf(overlay).toEqualTypeOf<GoogleMapsOverlay | null>();
      }}
      onDeckChange={overlay => {
        expectTypeOf(overlay).toEqualTypeOf<GoogleMapsOverlay | null>();
      }}
    />;
  });
});
