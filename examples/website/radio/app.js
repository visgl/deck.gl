import React from 'react';
import {useState, useMemo, useCallback} from 'react';

import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {MapView, WebMercatorViewport, FlyToInterpolator} from '@deck.gl/core';
import {ScatterplotLayer, PathLayer} from '@deck.gl/layers';
import {MVTLayer, H3HexagonLayer} from '@deck.gl/geo-layers';
import DeckGL from '@deck.gl/react';

import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

import {scaleSqrt, scaleLinear} from 'd3-scale';
import {GeoJsonLayer} from '@deck.gl/layers';

import SearchBar from './search-bar';

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

const minimapBackgroundStyle = {
  position: 'absolute',
  zIndex: -1,
  width: '100%',
  height: '100%',
  background: '#fefeff',
  boxShadow: '0 0 8px 2px rgba(0,0,0,0.15)'
};

const INITIAL_VIEW_STATE = {
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

const coverageColorScale = scaleSqrt()
  .domain([1, 10, 100])
  .range([[237, 248, 177], [127, 205, 187], [44, 127, 184]]);
const fmColorScale = scaleLinear()
  .domain([87, 108])
  .range([[0, 60, 255], [0, 255, 40]]);
const amColorScale = scaleLinear()
  .domain([530, 1700])
  .range([[200, 0, 0], [255, 240, 0]]);

function layerFilter({layer, viewport}) {
  const shouldDrawInMinimap =
    layer.id.startsWith('coverage') || layer.id.startsWith('viewport-bounds');
  if (viewport.id === 'minimap') return shouldDrawInMinimap;
  return !shouldDrawInMinimap;
}

function getTooltipText(stationMap, {object}) {
  if (!object) {
    return null;
  }
  const {callSign} = object.properties || object;
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
}) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [highlight, setHighlight] = useState(null);

  const stationMap = useMemo(
    () => {
      if (data) {
        const result = {};
        for (const station of data) {
          result[station.callSign] = station;
        }
        return result;
      }
      return null;
    },
    [data]
  );

  const onViewStateChange = useCallback(({viewState: newViewState}) => {
    setViewState(() => ({
      main: newViewState,
      minimap: {
        ...INITIAL_VIEW_STATE.minimap,
        longitude: newViewState.longitude,
        latitude: newViewState.latitude
      }
    }));
  }, []);

  const onSelectStation = useCallback(station => {
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

  const viewportBounds = useMemo(
    () => {
      const {width, height} = viewState.main;
      if (!width) return null;
      const viewport = new WebMercatorViewport(viewState.main);

      const topLeft = viewport.unproject([0, 0]);
      const topRight = viewport.unproject([width, 0]);
      const bottomLeft = viewport.unproject([0, height]);
      const bottomRight = viewport.unproject([width, height]);

      return [[topLeft, topRight, bottomRight, bottomLeft, topLeft]];
    },
    [viewState]
  );

  const getTooltip = useCallback(info => getTooltipText(stationMap, info), [stationMap]);

  const layers = data
    ? [
        new MVTLayer({
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

          renderSubLayers: props => {
            return new GeoJsonLayer(props, {
              lineWidthMinPixels: 2,
              getLineColor: f => {
                const {type, frequency} = stationMap[f.properties.callSign];
                return type === 'AM' ? amColorScale(frequency) : fmColorScale(frequency);
              },
              getFillColor: [255, 255, 255, 0]
            });
          }
        }),

        new ScatterplotLayer({
          id: 'stations',
          data,
          getPosition: d => [d.longitude, d.latitude],
          getColor: [40, 40, 40, 128],
          getRadius: 20,
          radiusMinPixels: 2
        }),

        new H3HexagonLayer({
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
      ]
    : [];

  return (
    <DeckGL
      layers={layers}
      views={showMinimap ? [mainView, minimapView] : mainView}
      viewState={viewState}
      parameters={{depthTest: false}}
      onViewStateChange={onViewStateChange}
      layerFilter={layerFilter}
      getTooltip={getTooltip}
    >
      <MapView id="main">
        <StaticMap reuseMaps mapStyle={mapStyle} />
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

export function renderToDOM(container) {
  render(<App />, container);

  load(DATA_URL.STATIONS, CSVLoader, {csv: {delimiter: '\t', skipEmptyLines: true}}).then(data => {
    render(<App data={data} />, container);
  });
}
