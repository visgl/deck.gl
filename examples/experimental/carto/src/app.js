import React, {useState} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {CartoSQLLayer, CartoBQTilerLayer} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2
};

const selectStyles = {
  position: 'absolute',
  zIndex: 1
};

function getContinentCondition(continent) {
  return continent ? `WHERE continent_name='${continent}'` : '';
}

export default function App() {
  const [continent, setContinent] = useState(null);

  const layer = new CartoSQLLayer({
    data: `SELECT * FROM world_population_2015 ${getContinentCondition(continent)}`, // world_population_2015 | `SELECT * FROM world_population_2015 WHERE continent_name='Africa'`,
    minZoom: 0,
    maxZoom: 23,
    getLineColor: [192, 192, 192],
    getFillColor: [255, 0, 0, 50],
    getRadius: 100,
    pointRadiusMinPixels: 6
  });

  const tileset = new CartoBQTilerLayer({
    data: 'cartobq.maps.nyc_taxi_points_demo_id',
    getLineColor: [192, 192, 192],
    getFillColor: [255, 0, 0, 50],
    getRadius: 100,
    pointRadiusMinPixels: 6
  });

  return (
    <div>
      <select style={selectStyles} onChange={e => setContinent(e.currentTarget.value)}>
        <option value="">All</option>
        <option value="Africa">Africa</option>
        <option value="Europe">Europe</option>
      </select>

      <DeckGL
        width="100%"
        height="100%"
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[layer, tileset]}
      />
    </div>
  );
}

/* global document */
render(<App />, document.body.appendChild(document.createElement('div')));
