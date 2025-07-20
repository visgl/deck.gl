// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {useState, useMemo, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {MapView, WebMercatorViewport, FlyToInterpolator} from '@deck.gl/core';
import {ScatterplotLayer, PathLayer} from '@deck.gl/layers';
import {MVTLayer, H3HexagonLayer} from '@deck.gl/geo-layers';
import {DeckGL} from '@deck.gl/react';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';
import {scaleSqrt, scaleLinear} from 'd3-scale';
import SearchBar from './search-bar';

import type {
  Color,
  ViewStateChangeParameters,
  MapViewState,
  PickingInfo,
  FilterContext
} from '@deck.gl/core';
import type {Feature, Geometry} from 'geojson';

// Data source
const DATA_URL_BASE = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/radio';
const DATA_URL = {
  STATIONS: `${DATA_URL_BASE}/stations.tsv`,
  COVERAGE: `${DATA_URL_BASE}/coverage.csv`,
  CONTOURS: `${DATA_URL_BASE}/service-contour/{z}/{x}-{y}.mvt`
};

const mainView = new MapView({id: 'main', controller: true});
const minimapView = new MapView({
  id: 'minimap',
  x: 20,
  y: 20,
  width: '20%',
  height: '20%',
  clear: true
});

const minimapBackgroundStyle: React.CSSProperties = {
  position: 'absolute',
  zIndex: -1,
  width: '100%',
  height: '100%',
  background: '#fefeff',
  boxShadow: '0 0 8px 2px rgba(0,0,0,0.15)'
};

const INITIAL_VIEW_STATE: {main: MapViewState; minimap: MapViewState} = {
  main: {
    longitude: -100,
    latitude: 40,
    zoom: 3,
    minZoom: 3
  },
  minimap: {
    longitude: -100,
    latitude: 40,
    zoom: 1
  }
};

const coverageColorScale = scaleSqrt<Color>()
  .domain([1, 10, 100])
  .range([
    [237, 248, 177],
    [127, 205, 187],
    [44, 127, 184]
  ]);
const fmColorScale = scaleLinear<Color>()
  .domain([87, 108])
  .range([
    [0, 60, 255],
    [0, 255, 40]
  ]);
const amColorScale = scaleLinear<Color>()
  .domain([530, 1700])
  .range([
    [200, 0, 0],
    [255, 240, 0]
  ]);

export type Station = {
  callSign: string;
  frequency: number;
  type: 'AM' | 'FM';
  city: string;
  state: string;
  name: string;
  longitude: number;
  latitude: number;
};

type ServiceContour = {
  callSign: string;
};

function layerFilter({layer, viewport}: FilterContext) {
  const shouldDrawInMinimap =
    layer.id.startsWith('coverage') || layer.id.startsWith('viewport-bounds');
  if (viewport.id === 'minimap') return shouldDrawInMinimap;
  return !shouldDrawInMinimap;
}

function getTooltipText(
  stationMap: {[callSign: string]: Station},
  object: Feature<Geometry, ServiceContour> | Station
) {
  if (!object) {
    return null;
  }
  let callSign: string;
  if ('properties' in object) {
    callSign = object.properties.callSign;
  } else {
    callSign = object.callSign;
  }
  if (!(callSign in stationMap)) {
    return null;
  }
  const {name, frequency, type, city, state} = stationMap[callSign];
  return `\
    ${callSign}
    ${name}
    ${type} ${frequency} ${type === 'AM' ? 'kHz' : 'MHz'}
    ${city}, ${state}`;
}

/* eslint-disable react/no-deprecated */
export default function App({
  data,
  mapStyle = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  showMinimap = true
}: {
  data?: Station[];
  mapStyle?: string;
  showMinimap?: boolean;
}) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [highlight, setHighlight] = useState(null);

  const stationMap: {[callSign: string]: Station} = useMemo(() => {
    if (!data) return null;

    const result = {};
    for (const station of data) {
      result[station.callSign] = station;
    }
    return result;
  }, [data]);

  const onViewStateChange = useCallback(
    ({viewState: newViewState}: ViewStateChangeParameters<MapViewState>) => {
      setViewState(() => ({
        main: newViewState,
        minimap: {
          ...INITIAL_VIEW_STATE.minimap,
          longitude: newViewState.longitude,
          latitude: newViewState.latitude
        }
      }));
    },
    []
  );

  const onSelectStation = useCallback((station: Station) => {
    if (station) {
      setViewState(currentViewState => ({
        minimap: currentViewState.minimap,
        main: {
          ...currentViewState.main,
          longitude: station.longitude,
          latitude: station.latitude,
          zoom: 8,
          transitionInterpolator: new FlyToInterpolator(),
          transitionDuration: 'auto'
        }
      }));
    }
    setHighlight(station && station.callSign);
  }, []);

  const viewportBounds = useMemo(() => {
    const {width, height} = viewState.main;
    if (!width) return null;
    const viewport = new WebMercatorViewport(viewState.main);

    const topLeft = viewport.unproject([0, 0]);
    const topRight = viewport.unproject([width, 0]);
    const bottomLeft = viewport.unproject([0, height]);
    const bottomRight = viewport.unproject([width, height]);

    return [[topLeft, topRight, bottomRight, bottomLeft, topLeft]];
  }, [viewState]);

  const getTooltip = useCallback(
    ({object}: PickingInfo) => getTooltipText(stationMap, object),
    [stationMap]
  );

  const layers = [
    data &&
      new MVTLayer<ServiceContour>({
        id: 'service-contours',
        data: DATA_URL.CONTOURS,
        maxZoom: 8,
        onTileError: () => {},
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 200, 0, 100],
        uniqueIdProperty: 'callSign',
        highlightedFeatureId: highlight,
        opacity: 0.2,
        lineWidthMinPixels: 2,
        getLineColor: f => {
          const {type, frequency} = stationMap[f.properties.callSign];
          return type === 'AM' ? amColorScale(frequency) : fmColorScale(frequency);
        },
        getFillColor: [255, 255, 255, 0]
      }),

    new ScatterplotLayer<Station>({
      id: 'stations',
      data,
      getPosition: d => [d.longitude, d.latitude],
      getFillColor: [40, 40, 40, 128],
      getRadius: 20,
      radiusMinPixels: 2
    }),

    new H3HexagonLayer<{hex: string; count: number}>({
      id: 'coverage',
      data: DATA_URL.COVERAGE,
      getHexagon: d => d.hex,
      stroked: false,
      extruded: false,
      getFillColor: d => coverageColorScale(d.count),

      loaders: [CSVLoader]
    }),

    new PathLayer({
      id: 'viewport-bounds',
      data: viewportBounds,
      getPath: d => d,
      getColor: [255, 0, 0],
      getWidth: 2,
      widthUnits: 'pixels'
    })
  ];

  return (
    <DeckGL
      layers={layers}
      views={showMinimap ? [mainView, minimapView] : mainView}
      viewState={viewState}
      parameters={{depthCompare: 'always'}}
      onViewStateChange={onViewStateChange}
      layerFilter={layerFilter}
      getTooltip={getTooltip}
    >
      <MapView id="main">
        <Map reuseMaps mapStyle={mapStyle} key="map" />
        <SearchBar data={data} onChange={onSelectStation} />
      </MapView>
      {showMinimap && (
        <MapView id="minimap">
          <div style={minimapBackgroundStyle} />
        </MapView>
      )}
    </DeckGL>
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  const stations = (
    await load(DATA_URL.STATIONS, CSVLoader, {
      csv: {delimitersToGuess: '\t', skipEmptyLines: true}
    })
  ).data;

  root.render(<App data={stations} />);
}
