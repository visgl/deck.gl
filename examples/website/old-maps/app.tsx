// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map, useControl} from 'react-map-gl/maplibre';
import {MapLibreOverlay as DeckOverlay} from '@deck.gl/maplibre';
import {BitmapLayer} from '@deck.gl/layers';

import TourControls from './tour-controls';

import type {MapRef, ViewStateChangeEvent} from 'react-map-gl/maplibre';
import type {Map as MapLibreMap} from 'maplibre-gl';
import type {MapLibreOverlayProps} from '@deck.gl/maplibre';
import type {MapViewState, PickingInfo} from '@deck.gl/core';
import type {Device} from '@luma.gl/core';

export type OldMap = {
  /** Map Warper map id */
  id: string;
  place: string;
  title: string;
  author: string;
  date: string;
  /** Extent of the warped map: [west, south, east, north] */
  bounds: [number, number, number, number];
  viewState: MapViewState;
};

// Scanned maps georeferenced by the Map Warper community (https://mapwarper.net), saved as
// Web Mercator images that line up with the basemap when stretched to `bounds`
export const OLD_MAPS: OldMap[] = [
  {
    id: '85408',
    place: 'Boston',
    title: 'Boston',
    author: 'Unknown',
    date: '1775',
    bounds: [-71.0828189, 42.3335189, -71.0395962, 42.3774796],
    viewState: {longitude: -71.0612, latitude: 42.3555, zoom: 12.6}
  },
  {
    id: '36301',
    place: 'New York',
    title: 'Sanitary & Topographical Map of the City and Island of New York',
    author: 'Egbert L. Viele',
    date: '1865',
    bounds: [-74.0582527, 40.6815339, -73.8768911, 40.8692384],
    // Rotate the view so that Manhattan lies along the screen
    viewState: {longitude: -73.9676, latitude: 40.7755, zoom: 11.3, bearing: -61}
  },
  {
    id: '76690',
    place: 'Paris',
    title: 'La ville, cité et Université de Paris',
    author: 'Olivier Truschet & Germain Hoyau',
    date: 'c. 1550',
    bounds: [2.3246531, 48.8295901, 2.3806617, 48.8747828],
    viewState: {longitude: 2.3527, latitude: 48.8522, zoom: 12.9}
  },
  {
    id: '73718',
    place: 'Amsterdam',
    title: 'Amsterdam',
    author: 'Daniel Stalpaert & Nicolaes Visscher',
    date: 'mid-17th century',
    bounds: [4.8545034, 52.3464006, 4.945947, 52.3980841],
    viewState: {longitude: 4.9002, latitude: 52.3722, zoom: 12.6}
  },
  {
    id: '76801',
    place: 'Venice',
    title: 'Iconografica rappresentatione della inclita città di Venezia',
    author: 'Lodovico Ughi',
    date: '1729',
    bounds: [12.3058565, 45.4199097, 12.3662522, 45.4515513],
    viewState: {longitude: 12.3361, latitude: 45.4357, zoom: 13}
  },
  {
    id: '9175',
    place: 'Rome',
    title: 'Nuova pianta di Roma',
    author: 'Giambattista Nolli',
    date: '1748',
    bounds: [12.4413659, 41.8626281, 12.5268237, 41.9211831],
    viewState: {longitude: 12.4841, latitude: 41.8919, zoom: 12.2}
  },
  {
    id: '17575',
    place: 'Beijing',
    title: 'Peking',
    author: 'Unknown',
    date: '1914',
    // Its control points only cover a strip down the middle of the scan, so the image was
    // re-warped from them with an affine fit instead of Map Warper's curved polynomial one
    bounds: [116.3392079, 39.8654237, 116.4388368, 39.9517812],
    viewState: {longitude: 116.389, latitude: 39.9086, zoom: 11.7}
  },
  {
    id: '21028',
    place: 'Tokyo',
    title: 'Central Edo (Tokyo)',
    author: 'Unknown',
    date: '1858',
    // Its few control points are bunched together near Zōjō-ji, so the image was re-warped
    // from new control points on landmarks that survive today
    bounds: [139.724641, 35.6486265, 139.7614962, 35.6722775],
    viewState: {longitude: 139.7431, latitude: 35.6605, zoom: 13.5}
  }
];

const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/old-maps';
// How long to linger at each map before flying to the next, in milliseconds
const DWELL_TIME = 6000;
// Maps smaller than this on screen, in pixels, are not worth keeping loaded
const MIN_MAP_SIZE = 16;

// The maps on screen and large enough to see, as a comma-separated list of ids
function getVisibleMapIds(map: MapLibreMap): string {
  const bounds = map.getBounds();
  return OLD_MAPS.filter(({bounds: [west, south, east, north]}) => {
    if (
      east < bounds.getWest() ||
      west > bounds.getEast() ||
      north < bounds.getSouth() ||
      south > bounds.getNorth()
    ) {
      return false;
    }
    const {x: x0, y: y0} = map.project([west, south]);
    const {x: x1, y: y1} = map.project([east, north]);
    return Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) >= MIN_MAP_SIZE;
  })
    .map(m => m.id)
    .join(',');
}

function getTooltip({layer}: PickingInfo) {
  const map = layer && OLD_MAPS.find(m => m.id === layer.id);
  return map ? `${map.title}\n${map.author}, ${map.date}` : null;
}

function DeckGLOverlay(props: MapLibreOverlayProps) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

// Flights are tagged with the map they fly to, which is passed on to their move events
type TourMoveEvent = ViewStateChangeEvent & {tourId?: string};

export default function App({
  device,
  mapId = OLD_MAPS[0].id,
  autoplay = true,
  opacity = 1,
  mapStyle = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  onMapChange
}: {
  device?: Device;
  mapId?: string;
  autoplay?: boolean;
  opacity?: number;
  mapStyle?: string;
  onMapChange?: (map: OldMap) => void;
}) {
  const mapRef = useRef<MapRef>(null);
  const [currentId, setCurrentId] = useState(mapId);
  // Kept as a string so that the app only re-renders when a map comes into or out of view.
  // The initial view shows only the first map, and is not reported as a move.
  const [visibleIds, setVisibleIds] = useState(mapId);
  // The map the camera last finished flying to. Starting a new flight interrupts the previous
  // one, so each flight reports its own target and stale events are ignored.
  const [arrivedId, setArrivedId] = useState<string | null>(mapId);
  const [playing, setPlaying] = useState(autoplay);

  const currentIndex = OLD_MAPS.findIndex(m => m.id === currentId);
  const nextMap = OLD_MAPS[(currentIndex + 1) % OLD_MAPS.length];
  const previousMap = OLD_MAPS[(currentIndex + OLD_MAPS.length - 1) % OLD_MAPS.length];
  const arrived = arrivedId === currentId;

  const goTo = (id: string) => {
    if (id !== currentId) {
      setCurrentId(id);
      setArrivedId(null);
      const {longitude, latitude, zoom, bearing = 0} = OLD_MAPS.find(m => m.id === id)!.viewState;
      mapRef.current?.flyTo(
        {center: [longitude, latitude], zoom, bearing, pitch: 0, speed: 1.5},
        {tourId: id}
      );
    }
  };

  // Navigation from within the app, which the host is told about
  const navigate = (map: OldMap) => {
    goTo(map.id);
    onMapChange?.(map);
  };

  useEffect(() => goTo(mapId), [mapId]);

  // Advance the tour once the camera has settled
  useEffect(() => {
    if (!playing || !arrived) {
      return undefined;
    }
    const timer = setTimeout(() => navigate(nextMap), DWELL_TIME);
    return () => clearTimeout(timer);
  }, [playing, arrived, nextMap]);

  const onPlayingChange = (nextPlaying: boolean) => {
    setPlaying(nextPlaying);
    // Resuming moves straight on rather than lingering where the user was exploring
    if (nextPlaying && arrived) {
      navigate(nextMap);
    }
  };

  // Only keep the current, upcoming and on-screen images on the GPU. Removed layers release
  // their textures, which matters for large scans on memory-constrained devices.
  const layers = OLD_MAPS.filter(
    m => m.id === currentId || m === nextMap || visibleIds.split(',').includes(m.id)
  ).map(
    m =>
      new BitmapLayer({
        id: m.id,
        image: `${DATA_URL}/${m.id}.webp`,
        bounds: m.bounds,
        opacity,
        pickable: true
      })
  );

  return (
    <div style={{position: 'absolute', width: '100%', height: '100%', top: 0, left: 0}}>
      <Map
        ref={mapRef}
        reuseMaps
        initialViewState={OLD_MAPS[currentIndex].viewState}
        mapStyle={mapStyle}
        // Exploring the map pauses the tour. Only user input carries an original event.
        onMoveStart={(e: TourMoveEvent) => e.originalEvent && setPlaying(false)}
        onMove={(e: TourMoveEvent) => setVisibleIds(getVisibleMapIds(e.target))}
        // Ends when a flight lands or is interrupted, by the user or by the next flight
        onMoveEnd={(e: TourMoveEvent) => e.tourId && setArrivedId(e.tourId)}
      >
        <DeckGLOverlay device={device} layers={layers} getTooltip={getTooltip} />
      </Map>
      <TourControls
        playing={playing}
        onPlayingChange={onPlayingChange}
        onPrevious={() => navigate(previousMap)}
        onNext={() => navigate(nextMap)}
      />
    </div>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
