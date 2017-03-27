import React, {Component} from 'react';
import DeckGL, {HexagonLayer} from 'deck.gl';
import {readableInteger} from '../../utils/format-utils';

import {MAPBOX_STYLES} from '../../constants/defaults';

// const colorRange = [
//   [1, 152, 189],
//   [1, 202, 252],
//   [73, 227, 206],
//   [143, 253, 159],
//   [216, 254, 181]
// ];

const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.6,
  diffuseRatio: 0.6,
  specularRatio: 0.3,
  lightsStrength: [1, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const colorRamp = colorRange.slice()
  .map(color => `rgb(${color.join(',')})`);

export default class HeatmapDemo extends Component {

  static get data() {
    return {
      url: 'data/heatmap-data.csv',
      worker: 'workers/heatmap-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      radius: {
        displayName: 'Radius',
        type: 'number',
        value: 1000,
        step: 1000,
        min: 1000
      },
      upperPercentile: {
        displayName: 'Upper Percentile',
        type: 'number',
        value: 100,
        step: 1,
        min: 0
      }
    };
  }

  static get viewport() {
    return {
      mapStyle: MAPBOX_STYLES.DARK,
      longitude: -1.4855092665310963,
      latitude: 52.38821282001933,
      zoom: 6.6,
      maxZoom: 15,
      pitch: 60,
      bearing: -14
    };
  }

  static renderInfo(meta) {

    return (
      <div>
        <h3>United Kingdom Road Safty</h3>
        <p>Personal injury road accidents in GB from 1979</p>

        <div className="layout">
          {colorRamp.map((c, i) => (
            <div key={i}
                 className="legend"
                 style={{background: c, width: `${100 / colorRamp.length}%`}} />
          ))}
        </div>
        <p className="layout">
          <span className="col-1-2">Less Accidents</span>
          <span className="col-1-2 text-right">More Accidents</span>
        </p>

        <p>Data source: <a href="https://data.gov.uk">DATA.GOV.UK</a></p>

        <div className="layout">
          <div className="stat col-1-2">
            Accidents<b>{ readableInteger(meta.count) || 0 }</b>
          </div>
          <div className="stat col-1-2">
          </div>
        </div>
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const {data} = nextProps;
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, params, data} = this.props;
    if (!data) {
      return null;
    }

    const layers = [
      new HexagonLayer({
        id: 'heatmap',
        data,
        opacity: 1,
        colorRange,
        extruded: true,
        pickable: true,
        radius: params.radius.value,
        upperPercentile: params.upperPercentile.value,
        elevationScale: 1,
        elevationRange: [0, 3000],
        coverage: 1,
        getPosition: d => d,
        lightSettings: LIGHT_SETTINGS
      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize}/>
    );
  }
}
