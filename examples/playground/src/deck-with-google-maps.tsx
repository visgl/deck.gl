// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global console, document, window */
import React, {useEffect, useRef, useState} from 'react';
import type {DeckProps} from '@deck.gl/core';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';

declare global {
  interface Window {
    google?: any;
  }
}

const HOST = 'https://maps.googleapis.com/maps/api/js';
const LOADING_GIF = 'https://upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif';

const style = {
  height: 1000,
  width: 1000
};

function injectScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', e => reject(e.error));
    document.head.appendChild(script);
  });
}

function loadGoogleMapApi(apiKey: string) {
  const url = `${HOST}?key=${apiKey}&libraries=places`;
  return injectScript(url);
}

export type DeckWithGoogleMapsProps = DeckProps & {
  initialViewState: Record<string, any>;
  googleMapsToken?: string;
  mapTypeId?: string;
};

export default function DeckWithGoogleMaps(props: DeckWithGoogleMapsProps) {
  const {googleMapsToken = ''} = props;
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(Boolean(window.google?.maps));

  useEffect(() => {
    if (!window.google?.maps) {
      loadGoogleMapApi(googleMapsToken).then(() => {
        setGoogleMapsLoaded(true);
      });
    }
  }, [googleMapsToken]);

  if (!googleMapsLoaded) {
    return <img src={LOADING_GIF} alt="Loading Google Maps overlay..." />;
  }

  return <DeckOverlayWrapper {...props} />;
}

function DeckOverlayWrapper(props: DeckWithGoogleMapsProps) {
  const {initialViewState, layers, mapTypeId} = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const deckOverlayRef = useRef<GoogleMapsOverlay>(null);

  if (!deckOverlayRef.current) {
    deckOverlayRef.current = new GoogleMapsOverlay({layers: []});
  }

  useEffect(() => {
    const view = {
      center: {lat: initialViewState.latitude, lng: initialViewState.longitude},
      mapTypeId: mapTypeId || 'satellite',
      zoom: initialViewState.zoom
    };

    const map = new window.google.maps.Map(containerRef.current!, view);
    deckOverlayRef.current!.setMap(map);
    deckOverlayRef.current!.setProps({layers});

    return () => {
      deckOverlayRef.current?.setMap(null);
    };
  }, [initialViewState, mapTypeId]);

  useEffect(() => {
    deckOverlayRef.current!.setProps({layers});
  }, [layers]);

  return <div ref={containerRef} style={style} />;
}
