/* global fetch */
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
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/layer-browser/sf.bike.parking.json'; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 37.752,
  longitude: -122.427,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

const CONTOUR_TYPE = {
  ISOLINE: 1,
  ISOBAND: 2
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
      cellSize: 1000,
      contourType: CONTOUR_TYPE.ISOBAND,
      linearInterpolation: true
    };
    this.onCellSizeChange = this.onCellSizeChange.bind(this);
    this.onThresholdChange = this.onThresholdChange.bind(this);
    this.onContourTypeChange = this.onContourTypeChange.bind(this);
    this.onIsLinearInterpolationChange = this.onIsLinearInterpolationChange.bind(this);
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

  onContourTypeChange(event) {
    const type = parseInt(event.target.value, 10);
    this.setState({contourType: type});
  }

  onIsLinearInterpolationChange(event) {
    this.setState(prevState => {
      return {
        linearInterpolation: !prevState.linearInterpolation
      };
    });
  }

  _renderLayers() {
    const {data} = this.props;
    const {thresholdValue1, thresholdValue2, cellSize, contourType} = this.state;
    let thresholdLayer1;
    let thresholdLayer2;
    let thresholdLayer3;
    if (contourType === CONTOUR_TYPE.ISOLINE) {
      thresholdLayer1 = THRESHOLD.MIN;
      thresholdLayer2 = thresholdValue1;
      thresholdLayer3 = thresholdValue2;
    } else {
      thresholdLayer1 = [THRESHOLD.MIN, thresholdValue1];
      thresholdLayer2 = [thresholdValue1, thresholdValue2];
      thresholdLayer3 = [thresholdValue2, THRESHOLD.MAX];
    }
    return [
      new ContourLayer({
        id: 'contourlayer',
        data,
        getPosition: d => d.COORDINATES,
        contours: [
          {threshold: thresholdLayer1, color: [255, 255, 178]},
          {threshold: thresholdLayer2, color: [253, 141, 60]},
          {threshold: thresholdLayer3, color: [189, 0, 38]}
        ],
        cellSize,
        isLI: this.state.linearInterpolation
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
            <label className="input-label">Type</label>
            <div className="radio-group">
              <input
                className="radio"
                type="radio"
                name="contour-type"
                value={CONTOUR_TYPE.ISOLINE}
                checked={this.state.contourType === CONTOUR_TYPE.ISOLINE}
                onChange={this.onContourTypeChange}
              />
              <label className="input-label">Isoline</label>

              <input
                className="radio"
                type="radio"
                name="contour-type"
                value={CONTOUR_TYPE.ISOBAND}
                checked={this.state.contourType === CONTOUR_TYPE.ISOBAND}
                onChange={this.onContourTypeChange}
              />
              <label className="input-label">Isoband</label>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">LI</label>
            <div className="radio-group">
              <input
                className="radio"
                type="checkbox"
                name="li"
                checked={this.state.linearInterpolation}
                onChange={this.onIsLinearInterpolationChange}
              />
              <label className="input-label">Linear Interpolation</label>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">threshold</label>
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

  // require('d3-request').csv(DATA_URL, (error, response) => {
  //   if (!error) {
  //     const data = response.map(d => [Number(d.lng), Number(d.lat)]);
  //     render(<App data={data} />, container);
  //   }
  // });
  fetch(DATA_URL)
    .then(response => response.json())
    .then(data => {
      render(<App data={data} />, container);
    });
}
