import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {ScreenGridLayer} from 'deck.gl';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/screen-grid/ca-transit-stops.json'; // eslint-disable-line

export const INITIAL_VIEW_STATE = {
  longitude: -119.3,
  latitude: 35.6,
  zoom: 6,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

export class App extends Component {
  _renderLayers() {
    const {data = DATA_URL, cellSize = 20, gpuAggregation = true, colorRange} = this.props;

    const props = {cellSizePixels: cellSize, gpuAggregation};
    if (colorRange) {
      props.colorRange = colorRange;
    }
    return [
      new ScreenGridLayer({
        ...props,
        id: 'grid',
        data,
        getPosition: d => d,
        cellSizePixels: cellSize,
        gpuAggregation
      })
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/dark-v9"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
