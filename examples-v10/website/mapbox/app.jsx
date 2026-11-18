// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useCallback, useState, useRef, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {ArcLayer} from '@deck.gl/layers';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import {cellToLatLng} from 'h3-js';
import {load} from '@loaders.gl/core';
import {LOG10} from '@math.gl/sql/math-functions';
import {CSVLoader} from '@loaders.gl/tables/csv';
import {Map, NavigationControl, useControl, Layer} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/safegraph/sf-pois.csv';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

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

export default function App() {
  /** Share the native Arrow table; GROUP BY runs on loaded data. */
  const data = useMemo(() => load(DATA_URL, CSVLoader), []);
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

  /** Draws visitor trips for the selected POI. */
  const arcLayer = new ArcLayer({
    id: 'deckgl-connections',
    // Sample row (hex,home_lng,home_lat,count): 8a28308148effff,-122.28443,37.78696,65
    data,
    query: `SELECT home_lng, home_lat, count WHERE hex = '${selectedPOI}'`,
    getSourcePosition: selectedPOICentroid,
    getTargetPosition: {sql: 'ARRAY_FLOAT64(home_lng, home_lat)'},
    getSourceColor: [255, 0, 128],
    getTargetColor: [0, 200, 255],
    getWidth: {sql: 'CASE WHEN count > 30 THEN count / 15 ELSE 2 END'}
  });

  const poiLayer = new H3HexagonLayer({
    id: 'deckgl-pois',
    // Sample row (hex,home_lng,home_lat,count): 8a28308148effff,-122.28443,37.78696,65
    data,
    query: 'SELECT hex, SUM(count) AS count FROM data GROUP BY hex',
    opacity: 0.4,
    pickable: true,
    autoHighlight: true,
    onClick: ({object}) => object && setSelectedPOI(object.hex),
    getHexagon: {sql: 'hex'},
    sqlFunctions: [LOG10],
    getFillColor: {
      sql: `\
        RGBA8(
          (CASE WHEN count < 1000 THEN 256 - LOG10(count)
            ELSE 331 - 26 * LOG10(count) END) / 255,
          (CASE WHEN count < 100 THEN 306 - 51 * LOG10(count)
            WHEN count < 1000 THEN 330 - 63 * LOG10(count)
            ELSE 486 - 115 * LOG10(count) END) / 255,
          (CASE WHEN count < 100 THEN 264 - 86 * LOG10(count)
            ELSE 156 - 32 * LOG10(count) END) / 255, 1)`
    },
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
  createRoot(container).render(<App />);
}
