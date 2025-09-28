// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useCallback, useState, useRef, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {ArcLayer} from '@deck.gl/layers';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import {scaleLog} from 'd3-scale';
import {cellToLatLng} from 'h3-js';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';
import {Map, NavigationControl, useControl, Layer} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/safegraph/sf-pois.csv';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const colorScale = scaleLog()
  .domain([10, 100, 1000, 10000])
  .range([
    [255, 255, 178],
    [254, 204, 92],
    [253, 141, 60],
    [227, 26, 28]
  ]);

const buildings3DLayer = {
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 14,
  paint: {
    'fill-extrusion-color': '#ccc',
    'fill-extrusion-height': ['get', 'height']
  }
};

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function App({data}) {
  const [selectedPOI, setSelectedPOI] = useState('8a283082aa17fff');
  const [firstLabelLayerId, setFirstLabelLayerId] = useState();
  const mapRef = useRef();

  const onMapLoad = useCallback(() => {
    setFirstLabelLayerId(getFirstLabelLayerId(mapRef.current.getStyle()));
  }, []);

  const selectedPOICentroid = useMemo(() => {
    const [lat, lng] = cellToLatLng(selectedPOI);
    return [lng, lat];
  }, [selectedPOI]);

  const arcs = useMemo(() => filterArcs(data, selectedPOI), [data, selectedPOI]);

  const hexes = useMemo(() => aggregateHexes(data), [data]);

  const arcLayer = new ArcLayer({
    id: 'deckgl-connections',
    data: arcs,
    getSourcePosition: d => selectedPOICentroid,
    getTargetPosition: d => [d.home_lng, d.home_lat],
    getSourceColor: [255, 0, 128],
    getTargetColor: [0, 200, 255],
    getWidth: d => Math.max(2, d.count / 15)
  });

  const poiLayer = new H3HexagonLayer({
    id: 'deckgl-pois',
    data: hexes,
    opacity: 0.4,
    pickable: true,
    autoHighlight: true,
    onClick: ({object}) => object && setSelectedPOI(object.hex),
    getHexagon: d => d.hex,
    getFillColor: d => colorScale(d.count),
    extruded: false,
    stroked: false,
    beforeId: firstLabelLayerId
  });

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/light-v9"
      antialias={true}
      initialViewState={{
        longitude: -122.4034,
        latitude: 37.7845,
        zoom: 15.5,
        bearing: 20,
        pitch: 60
      }}
      onLoad={onMapLoad}
    >
      <DeckGLOverlay interleaved={true} layers={[poiLayer, arcLayer]} />
      <NavigationControl />
      <Layer {...buildings3DLayer} />
    </Map>
  );
}

function filterArcs(data, selectedPOI) {
  if (!data) {
    return null;
  }
  return data.filter(d => d.hex === selectedPOI);
}

function aggregateHexes(data) {
  if (!data) {
    return null;
  }
  const result = {};
  for (const object of data) {
    if (!result[object.hex]) {
      result[object.hex] = {hex: object.hex, count: 0};
    }
    result[object.hex].count += object.count;
  }
  return Object.values(result);
}

function getFirstLabelLayerId(style) {
  const layers = style.layers;
  // Find the index of the first symbol (i.e. label) layer in the map style
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      return layers[i].id;
    }
  }
  return undefined;
}

export function renderToDOM(container) {
  const root = createRoot(container);
  root.render(<App />);

  load(DATA_URL, CSVLoader).then(data => {
    root.render(<App data={data.data} />);
  });
}
