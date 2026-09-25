// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {FlyToInterpolator} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';

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
    bounds: [116.3503962, 39.8510207, 116.4574079, 39.9857523],
    viewState: {longitude: 116.4039, latitude: 39.9184, zoom: 11.3}
  },
  {
    id: '21028',
    place: 'Tokyo',
    title: 'Central Edo (Tokyo)',
    author: 'Unknown',
    date: '1858',
    bounds: [139.7283079, 35.6495956, 139.7562121, 35.6697272],
    viewState: {longitude: 139.7423, latitude: 35.6597, zoom: 13.7}
  }
];

const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/old-maps';
// How long to linger at each map before flying to the next, in milliseconds
const DWELL_TIME = 6000;

function getTooltip({layer}: PickingInfo) {
  const map = layer && OLD_MAPS.find(m => m.id === layer.id);
  return map ? `${map.title}\n${map.author}, ${map.date}` : null;
}

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
  const [currentId, setCurrentId] = useState(mapId);
  // Whether the camera has finished flying to the current map
  const [arrived, setArrived] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(0);
  // Images are only loaded once a map is visited (or about to be)
  const [visited, setVisited] = useState(() => new Set([mapId]));

  const currentIndex = OLD_MAPS.findIndex(m => m.id === currentId);
  const nextMap = OLD_MAPS[(currentIndex + 1) % OLD_MAPS.length];

  const goTo = (id: string) => {
    if (id !== currentId) {
      setCurrentId(id);
      setArrived(false);
      setVisited(v => new Set(v).add(id));
    }
  };

  useEffect(() => goTo(mapId), [mapId]);

  // Advance the tour after the camera has settled and the user has stopped interacting
  useEffect(() => {
    if (!autoplay || !arrived) {
      return undefined;
    }
    const timer = setTimeout(() => {
      goTo(nextMap.id);
      onMapChange?.(nextMap);
    }, DWELL_TIME);
    return () => clearTimeout(timer);
  }, [autoplay, arrived, nextMap, lastInteraction]);

  const initialViewState = useMemo(
    () => ({
      pitch: 0,
      bearing: 0,
      ...OLD_MAPS[currentIndex].viewState,
      transitionDuration: 'auto' as const,
      transitionInterpolator: new FlyToInterpolator({speed: 1.5}),
      onTransitionEnd: () => setArrived(true),
      onTransitionInterrupt: () => setArrived(true)
    }),
    [currentIndex]
  );

  const layers = OLD_MAPS.filter(m => visited.has(m.id) || m === nextMap).map(
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
    <DeckGL
      device={device}
      layers={layers}
      initialViewState={initialViewState}
      controller={true}
      getTooltip={getTooltip}
      onInteractionStateChange={() => setLastInteraction(Date.now())}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
