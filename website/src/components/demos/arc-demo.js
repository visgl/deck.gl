import React, {Component} from 'react';

import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import {App, INITIAL_VIEW_STATE, inFlowColors, outFlowColors} from 'website-examples/arc/app';

const colorRamp = inFlowColors.slice().reverse().concat(outFlowColors)
  .map(color => `rgb(${color.join(',')})`);

export default class ArcDemo extends Component {

  static get data() {
    return {
      url: `${DATA_URI}/arc-data.txt`,
      worker: 'workers/arc-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      lineWidth: {displayName: 'Width', type: 'range', value: 2, step: 0.1, min: 0, max: 10}
    };
  }

  static get viewport() {
    return {
      ...INITIAL_VIEW_STATE,
      mapStyle: MAPBOX_STYLES.LIGHT
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>United States County-to-county Migration</h3>
        <p>People moving in and out of <b>{meta.sourceName}</b> between 2009-2013</p>

        <div className="layout">
          {colorRamp.map((c, i) => (
            <div key={i}
              className="legend"
              style={{background: c, width: `${100 / colorRamp.length}%`}} />
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

  constructor(props) {
    super(props);
    this.state = {
      hoveredCounty: null,
      // Set default selection to San Francisco
      selectedCounty: props.data ? props.data[362] : null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({
        // Set default selection to San Francisco
        selectedCounty: nextProps.data[362]
      });
    }
  }

  _onHoverCounty({x, y, object}) {
    this.setState({x, y, hoveredCounty: object});
  }

  _onSelectCounty({object}) {
    this.setState({selectedCounty: object});
    this.props.onStateChange({sourceName: object.properties.name});
  }

  _renderTooltip() {
    const {x, y, hoveredCounty} = this.state;
    return hoveredCounty && (
      <div className="tooltip" style={{left: x, top: y}}>
        {hoveredCounty.properties.name}
      </div>
    );
  }

  render() {
    const {params} = this.props;
    const {selectedCounty} = this.state;

    return (
      <div>
        <App
          {...this.props}
          selectedFeature={selectedCounty}
          strokeWidth={params.lineWidth.value}
          onHover={this._onHoverCounty.bind(this)}
          onClick={this._onSelectCounty.bind(this)} />

        {this._renderTooltip()}

      </div>
    );
  }
}
