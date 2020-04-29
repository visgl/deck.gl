import React, {PureComponent, Fragment} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {ContourLayer} from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import RangeSlider from './rangeSlider';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -1.4157267858730052,
  latitude: 52.232395363869415,
  zoom: 6.6,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27.396674584323023
};

const THRESHOLD = {
  MIN: 1,
  MAX: 500
};

export class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      thresholdValue1: 100,
      thresholdValue2: 300,
      cellSize: 1000
    };
    this.onCellSizeChange = this.onCellSizeChange.bind(this);
    this.onThresholdChange = this.onThresholdChange.bind(this);
  }

  onThresholdChange(thresholdValue1, thresholdValue2) {
    this.setState({
      thresholdValue1,
      thresholdValue2
    });
  }

  onCellSizeChange(event) {
    const cellSize = event.target.value;
    this.setState({cellSize});
  }

  _renderLayers() {
    const {data} = this.props;
    const {thresholdValue1, thresholdValue2, cellSize} = this.state;
    return [
      new ContourLayer({
        id: 'contourlayer',
        data,
        getPosition: d => d,
        contours: [
          {threshold: [THRESHOLD.MIN, thresholdValue1], color: [255, 255, 178]},
          {threshold: [thresholdValue1, thresholdValue2], color: [253, 141, 60]},
          {threshold: [thresholdValue2, THRESHOLD.MAX], color: [189, 0, 38]}
        ],
        cellSize
      })
    ];
  }

  render() {
    const {mapStyle = 'mapbox://styles/mapbox/dark-v9'} = this.props;
    return (
      <Fragment>
        <DeckGL
          layers={this._renderLayers()}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
        >
          <StaticMap
            reuseMaps
            mapStyle={mapStyle}
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        </DeckGL>
        <div id="control-panel">
          <div className="input-group">
            <label className="input-label">Threshold</label>
            <RangeSlider
              handleChange={this.onThresholdChange}
              range={[THRESHOLD.MIN, THRESHOLD.MAX]}
              defaultMin={this.state.thresholdValue1}
              defaultMax={this.state.thresholdValue2}
            />
          </div>
          <div className="input-group">
            <label className="input-label" style={{marginRight: '15px'}}>
              cellSize
            </label>
            <input
              style={{width: '180px'}}
              id="cellSize"
              type="range"
              min="100"
              max="2000"
              step="100"
              value={this.state.cellSize}
              onChange={this.onCellSizeChange}
            />
          </div>
        </div>
      </Fragment>
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
