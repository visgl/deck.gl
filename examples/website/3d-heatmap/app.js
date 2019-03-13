import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {HexagonLayer, LayerPropAnimation} from 'deck.gl';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

export const INITIAL_VIEW_STATE = {
  longitude: -1.4157267858730052,
  latitude: 52.232395363869415,
  zoom: 6.6,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27.396674584323023
};

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

/* eslint-disable react/no-deprecated */
export class App extends Component {
  static get defaultColorRange() {
    return colorRange;
  }

  constructor(props) {
    super(props);

    this.startAnimationTimer = null;
    this.intervalTimer = null;
  }

  _renderLayers() {
    const {data, radius = 1000, upperPercentile = 100, coverage = 1} = this.props;

    return [
      new HexagonLayer({
        id: 'heatmap',
        colorRange,
        coverage,
        data,
        elevationRange: [0, 3000],
        elevationScale: data ? new LayerPropAnimation(0).to({value: 50, duration: 2000}) : 0,
        extruded: true,
        getPosition: d => d,
        onHover: this.props.onHover,
        opacity: 1,
        pickable: Boolean(this.props.onHover),
        radius,
        upperPercentile
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

  require('d3-request').csv(DATA_URL, (error, response) => {
    if (!error) {
      const data = response.map(d => [Number(d.lng), Number(d.lat)]);
      render(<App data={data} />, container);
    }
  });
}
