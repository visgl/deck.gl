import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 37.785164,
  longitude: -122.41669,
  zoom: 16,
  bearing: -20,
  pitch: 60
};

class Root extends Component {
  render() {
    return (
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} width="100%" height="100%">
        <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
        <LineLayer
          data={[{sourcePosition: [-122.41669, 37.7883], targetPosition: [-122.41669, 37.781]}]}
          strokeWidth={5}
        />
        <ScatterplotLayer
          data={[{position: [-122.41669, 37.79]}]}
          radiusScale={100}
          getColor={x => [0, 0, 255]}
        />
      </DeckGL>
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
