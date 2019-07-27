/* global document */
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from 'deck.gl';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// const DATA_URL_EQ = 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson';
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/screen-grid/uber-pickup-locations.json'; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -73.75,
  latitude: 40.73,
  zoom: 9.6,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v9';
const colorRange = [
  [33, 102, 172, 0],
  [103, 169, 207],
  [209, 229, 240],
  [253, 219, 199],
  [239, 138, 98],
  [178, 24, 43]
];
class Root extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={[
            new HeatmapLayer({
              data: DATA_URL,
              id: 'heatmp-layer-eq',
              opacity: 1,
              pickable: false,
              getPosition: d => [d[0], d[1]],
              getWeight: d => d[2],
              colorRange,
              enhanceFactor: 100
            })
          ]}
        >
          <StaticMap
            reuseMaps
            mapStyle={MAP_STYLE}
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        </DeckGL>
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
