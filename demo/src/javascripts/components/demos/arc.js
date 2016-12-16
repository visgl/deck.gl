import 'babel-polyfill';
import React, {Component} from 'react';
import {ChoroplethLayer, ArcLayer} from '../../../../../index';
import DeckGL from '../../../../../react';
import {scaleQuantile} from 'd3-scale';

import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES} from '../../constants/defaults';

const inFlowColors = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132],
];

const outFlowColors = [
  [255,255,178],
  [254,217,118],
  [254,178,76],
  [253,141,60],
  [252,78,42],
  [227,26,28],
  [177,0,38],
];

const colorRamp = inFlowColors.slice().reverse().concat(outFlowColors)
  .map(color => `rgb(${color.join(',')})`);

export default class ArcDemo extends Component {
  constructor(props) {
    super(props);
    this.state = this._updateFlows(props);
  }

  static get data() {
    return {
      url: 'data/arc-data.txt',
      worker: 'workers/arc-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      lineWidth: {displayName: 'Width', type: 'number', value: 1, step: 1, min: 1}
    };
  }

  static get viewport() {
    return {
      mapStyle: MAPBOX_STYLES.LIGHT,
      longitude: -100,
      latitude: 40.7,
      zoom: 3,
      maxZoom: 15,
      pitch: 30,
      bearing: 30
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>United States County-to-county Migration</h3>
        <p>People moving in and out of <b>{meta.sourceName}</b> between 2009-2013</p>

        <div className="layout">
          {colorRamp.map((c, i) => (
              <div key={i} className="legend" style={{background: c, width: `${100 / colorRamp.length}%`}} />
            ))}
        </div>
        <p className="layout">
          <span className="col-1-2">Net gain</span>
          <span className="col-1-2 text-right">Net loss</span>
        </p>

        <p>Data source: <a href="http://www.census.gov">US Census Bureau</a></p>

        <div className="layout">
          <div className="stat col-1-2">
            Counties<b>{ meta.count || 0 }</b>
          </div>
          <div className="stat col-1-2">
            Arcs<b>{ readableInteger(meta.flowCount || 0) }</b>
          </div>
        </div>
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    const {data} = nextProps;
    if (data && data !== this.props.data) {
      this.setState(this._updateFlows(nextProps));
    }
  }

  _updateFlows(props, selectedFeature) {
    const {data} = props;

    if (!data || !data.length) {
      return {};
    }
    const {features} = data[0];
    selectedFeature = selectedFeature || features[362];

    const {flows, centroid, name} = selectedFeature.properties;
    const arcs = [];

    for (let toId in flows) {
      const f = features[toId];
      arcs.push({
        source: centroid,
        target: f.properties.centroid,
        value: flows[toId]
      });
    }

    const scale = scaleQuantile()
      .domain(arcs.map(a => Math.abs(a.value)))
      .range(inFlowColors.map((c, i) => i));
    arcs.forEach(a => {
      a.gain = Math.sign(a.value);
      a.quantile = scale(Math.abs(a.value));
    });

    this.props.onStateChange({sourceName: name});

    return {arcs, scale, selectedFeature};
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  _onClickFeature(evt) {
    const {feature} = evt;
    if (this.state.selectedFeature !== feature) {
      this.setState(this._updateFlows(this.props, feature));
    }
  }

  render() {
    const {viewport, params, data} = this.props;
    const {scale, arcs, selectedFeature} = this.state;

    if (!data) {
      return null;
    }

    const layers = [
      new ChoroplethLayer({
        id: 'choropleth',
        data: data[0],
        opacity: 0,
        getColor: () => [0, 0, 0, 0],
        onClick: this._onClickFeature.bind(this),
        pickable: true
      }),
      new ChoroplethLayer({
        id: 'selected-choropleth',
        data: {type: 'FeatureCollection', features: [selectedFeature]},
        drawContour: true,
        strokeWidth: 4,
        opacity: 0.2,
        getColor: () => [0, 0, 0]
      }),
      new ArcLayer({
        id: 'arc',
        data: arcs,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile],
        getTargetColor: d => (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile],
        strokeWidth: params.lineWidth.value
      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers }
        onWebGLInitialized={this._initialize} />
    );
  }
}
