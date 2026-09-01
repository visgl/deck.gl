// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {BasemapLayer} from '@deck.gl-community/basemap-layers';
import {ZoomWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

type Landmark = {
  id: string;
  cityId: string;
  name: string;
  position: [number, number];
};

type CityPanel = {
  id: string;
  title: string;
  subtitle: string;
  mapStyle: string;
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  landmarks: Landmark[];
};

const CITY_PANELS: CityPanel[] = [
  {
    id: 'new-york',
    title: 'New York',
    subtitle: 'Midtown lights and waterfront routes',
    mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    viewState: {longitude: -73.9857, latitude: 40.7484, zoom: 10.8, pitch: 35, bearing: -12},
    landmarks: [
      {id: 'times-square', cityId: 'new-york', name: 'Times Square', position: [-73.9851, 40.758]},
      {id: 'central-park', cityId: 'new-york', name: 'Central Park', position: [-73.9712, 40.7831]},
      {
        id: 'brooklyn-bridge',
        cityId: 'new-york',
        name: 'Brooklyn Bridge',
        position: [-73.9969, 40.7061]
      }
    ]
  },
  {
    id: 'london',
    title: 'London',
    subtitle: 'River crossings and west end clusters',
    mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    viewState: {longitude: -0.1276, latitude: 51.5072, zoom: 10.8, pitch: 40, bearing: 18},
    landmarks: [
      {id: 'soho', cityId: 'london', name: 'Soho', position: [-0.1337, 51.5138]},
      {id: 'tower-bridge', cityId: 'london', name: 'Tower Bridge', position: [-0.0754, 51.5055]},
      {id: 'greenwich', cityId: 'london', name: 'Greenwich', position: [0.0005, 51.4826]}
    ]
  },
  {
    id: 'tokyo',
    title: 'Tokyo',
    subtitle: 'Station density across the eastern core',
    mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    viewState: {longitude: 139.7588, latitude: 35.6762, zoom: 10.7, pitch: 45, bearing: -22},
    landmarks: [
      {id: 'shibuya', cityId: 'tokyo', name: 'Shibuya', position: [139.7016, 35.6595]},
      {id: 'tokyo-station', cityId: 'tokyo', name: 'Tokyo Station', position: [139.7671, 35.6812]},
      {id: 'asakusa', cityId: 'tokyo', name: 'Asakusa', position: [139.7967, 35.7148]}
    ]
  },
  {
    id: 'sydney',
    title: 'Sydney',
    subtitle: 'Harbor landmarks with coastal spillover',
    mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
    viewState: {longitude: 151.2093, latitude: -33.8688, zoom: 10.9, pitch: 42, bearing: 24},
    landmarks: [
      {id: 'opera-house', cityId: 'sydney', name: 'Opera House', position: [151.2153, -33.8568]},
      {id: 'bondi', cityId: 'sydney', name: 'Bondi Beach', position: [151.2743, -33.8915]},
      {id: 'newtown', cityId: 'sydney', name: 'Newtown', position: [151.179, -33.8981]}
    ]
  }
];

const VIEWS = CITY_PANELS.map(
  city =>
    new MapView({
      id: city.id,
      canvasId: city.id,
      controller: true
    })
);

const INITIAL_VIEW_STATE = Object.fromEntries(CITY_PANELS.map(city => [city.id, city.viewState]));
const CITY_TITLES = Object.fromEntries(CITY_PANELS.map(city => [city.id, city.title])) as Record<
  string,
  string
>;
const hoverStatus = document.getElementById('hover-status');
let deck: Deck;
let hoveredLandmark: Landmark | null = null;

function getLayers() {
  return CITY_PANELS.flatMap(city => [
    new BasemapLayer({
      id: `${city.id}-basemap`,
      style: city.mapStyle
    }),
    new ScatterplotLayer<Landmark>({
      id: `${city.id}-landmarks`,
      data: city.landmarks,
      pickable: true,
      autoHighlight: true,
      parameters: {depthTest: false},
      radiusUnits: 'pixels',
      radiusMinPixels: 18,
      radiusMaxPixels: 36,
      stroked: true,
      lineWidthMinPixels: 3,
      getPosition: landmark => landmark.position,
      getRadius: landmark => (hoveredLandmark?.id === landmark.id ? 28 : 20),
      getFillColor: landmark =>
        hoveredLandmark?.id === landmark.id
          ? [255, 215, 110]
          : hoveredLandmark?.cityId === landmark.cityId
            ? [255, 122, 89]
            : [84, 196, 255],
      getLineColor: [255, 255, 255],
      onHover: info => {
        hoveredLandmark = (info.object as Landmark) || null;
        updateHoverStatus();
        deck.setProps({layers: getLayers()});
      }
    })
  ]);
}

function updateHoverStatus() {
  if (!hoverStatus) {
    return;
  }

  hoverStatus.textContent = hoveredLandmark
    ? `${hoveredLandmark.name} in ${CITY_TITLES[hoveredLandmark.cityId]}`
    : 'Hover any highlighted landmark';
}

const mapGrid = document.getElementById('map-grid') as HTMLDivElement | null;
if (!mapGrid) {
  throw new Error('Map grid not found');
}

deck = new Deck({
  parent: mapGrid,
  _canvases: CITY_PANELS.map(city => city.id),
  views: VIEWS,
  initialViewState: INITIAL_VIEW_STATE,
  layers: getLayers(),
  widgets: CITY_PANELS.map(
    city => new ZoomWidget({id: `${city.id}-zoom`, viewId: city.id, placement: 'top-right'})
  ),
  getTooltip: ({object}) => {
    const landmark = object as Landmark | null;
    return landmark ? `${landmark.name}\n${CITY_TITLES[landmark.cityId]}` : null;
  },
  layerFilter: ({layer, viewport}) => Boolean(viewport && layer.id.startsWith(`${viewport.id}-`))
});

updateHoverStatus();

export function finalize() {
  deck.finalize();
}
