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
import {DeckGL} from '@deck.gl/react/legacy';
import type {Device} from '@luma.gl/core';
import {CSVLoader} from '@loaders.gl/tables/csv';
import {scaleLinear} from 'd3-scale';
import {isArrowTable} from '@math.gl/core/arrow';
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
  device,
  mapStyle = 'https://tiles.openfreemap.org/styles/positron',
  showMinimap = true
}: {
  device?: Device;
  mapStyle?: string;
  showMinimap?: boolean;
}) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [highlight, setHighlight] = useState(null);
  /** Rows used only by station search and the MVT contour lookup. */
  const [stations, setStations] = useState<Station[]>([]);
  /** Shares loaded station rows with the UI without repacking layer positions. */
  const onStationsLoaded = useCallback((table: unknown) => {
    if (isArrowTable(table)) {
      setStations(Array.from(table, row => row.toJSON() as Station));
    }
  }, []);

  const stationMap: {[callSign: string]: Station} = useMemo(() => {
    const result = {};
    for (const station of stations) {
      result[station.callSign] = station;
    }
    return result;
  }, [stations]);

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
    stations.length > 0 &&
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

    new ScatterplotLayer({
      id: 'stations',
      // Sample row: WAQI,710,AM,MIAMI,FL,UNIVISION RADIO STATIONS GROUP INC.,-80.37889,25.96861
      data: DATA_URL.STATIONS,
      loaders: [CSVLoader],
      onDataLoad: onStationsLoaded,
      getPosition: {sql: 'ARRAY_FLOAT64(longitude, latitude)'},
      getFillColor: [40, 40, 40, 128],
      getRadius: 20,
      radiusMinPixels: 2
    }),

    new H3HexagonLayer<{hex: string; count: number}>({
      id: 'coverage',
      // Sample row (hex,count): 8444b6bffffffff,3
      data: DATA_URL.COVERAGE,
      loaders: [CSVLoader],
      getHexagon: {sql: 'hex'},
      stroked: false,
      extruded: false,
      // Interpolate the original coverage palette in square-root-count space.
      getFillColor: {
        sql: `\
          SCALE_COLOR(
            SQRT(count),
            DOMAIN(1, 3.1622776601683795, 10),
            PALETTE('#edf8b1', '#7fcdbb', '#2c7fb8')
          )`
      }
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
      device={device}
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
        <SearchBar data={stations} onChange={onSelectStation} />
      </MapView>
      {showMinimap && (
        <MapView id="minimap">
          <div style={minimapBackgroundStyle} />
        </MapView>
      )}
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
