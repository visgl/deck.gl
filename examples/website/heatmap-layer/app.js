/* global document */
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from 'deck.gl';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/screen-grid/uber-pickup-locations.json'; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -73.75,
  latitude: 40.73,
  zoom: 9,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v9';

class Root extends PureComponent {
  constructor(props) {
    super(props);
  }

  _renderLayers() {
    const {data = DATA_URL, intensity = 1, threshold = 0.03} = this.props;

    return [
      new HeatmapLayer({
        data,
        id: 'heatmp-layer',
        opacity: 1,
        pickable: false,
        getPosition: d => [d[0], d[1]],
        getWeight: d => d[2],
        intensity,
        threshold
      })
    ];
  }

  render() {
    return (
      <div>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={this._renderLayers()}
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
