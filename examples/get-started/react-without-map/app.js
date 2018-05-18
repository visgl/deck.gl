import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {GeoJsonLayer, MapController} from 'deck.gl';

// source: Natural Earth http://www.naturalearthdata.com/
// via geojson.xyz
const GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 40,
  longitude: -100,
  zoom: 3,
  bearing: 0,
  pitch: 60
};

class Root extends Component {
  render() {
    return (
      <DeckGL
        width="100%"
        height="100%"
        controller={MapController}
        initialViewState={INITIAL_VIEW_STATE}
        layers={[
          new GeoJsonLayer({
            data: GEOJSON,
            stroked: true,
            filled: true,
            lineWidthMinPixels: 2,
            getLineColor: () => [255, 255, 255],
            getFillColor: () => [200, 200, 200]
          })
        ]}
      />
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
