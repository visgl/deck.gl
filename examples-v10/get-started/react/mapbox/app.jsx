// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map, NavigationControl, Popup} from 'react-map-gl/mapbox';
import {DeckGL} from '@deck.gl/react/mapbox';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/react/layers';
import 'mapbox-gl/dist/mapbox-gl.css';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

// Set your Mapbox token here or via environment variable
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30
};

const MAP_STYLE = 'mapbox://styles/mapbox/light-v9';

function Root() {
  const [map, setMap] = useState(null);
  const [selected, setSelected] = useState(null);

  return (
    <Map
      ref={setMap}
      initialViewState={INITIAL_VIEW_STATE}
      mapStyle={MAP_STYLE}
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      {selected && (
        <Popup
          key={selected.properties.name}
          anchor="bottom"
          style={{zIndex: 10}} /* position above deck.gl canvas */
          longitude={selected.geometry.coordinates[0]}
          latitude={selected.geometry.coordinates[1]}
        >
          {selected.properties.name} ({selected.properties.abbrev})
        </Popup>
      )}
      <DeckGL map={map} /* interleaved */>
        <GeoJsonLayer
          id="airports"
          data={AIR_PORTS}
          // Styles
          filled={true}
          pointRadiusMinPixels={2}
          pointRadiusScale={2000}
          getPointRadius={f => 11 - f.properties.scalerank}
          getFillColor={[200, 0, 80, 180]}
          // Interactive props
          pickable={true}
          autoHighlight={true}
          onClick={info => setSelected(info.object)}
          // beforeId="waterway-label" // In interleaved mode, render the layer under map labels
        />
        <ArcLayer
          id="arcs"
          data={AIR_PORTS}
          dataTransform={d => d.features.filter(f => f.properties.scalerank < 4)}
          // Styles
          getSourcePosition={f => [-0.4531566, 51.4709959]} // London
          getTargetPosition={f => f.geometry.coordinates}
          getSourceColor={[0, 128, 200]}
          getTargetColor={[200, 0, 80]}
          getWidth={1}
        />
      </DeckGL>
      <NavigationControl position="top-left" />
    </Map>
  );
}

/* global document */
const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
