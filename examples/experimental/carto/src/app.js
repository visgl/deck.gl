import React from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {CartoLayer, setDefaultCredentials} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2
};

setDefaultCredentials({
  username: 'public'
});

export default function App() {
  const layer = new CartoLayer({
    data: `SELECT * FROM world_population_2015 WHERE continent_name='Africa'`, // world_population_2015 | `SELECT * FROM world_population_2015 WHERE continent_name='Africa'`,
    minZoom: 0,
    maxZoom: 23,
    getLineColor: [192, 192, 192],
    getFillColor: [255, 0, 0, 50],
    getRadius: 100,
    pointRadiusMinPixels: 6
  });

  return (
    <DeckGL
      width="100%"
      height="100%"
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={[layer]}
    />
  );
}

/* global document */
render(<App />, document.body.appendChild(document.createElement('div')));
