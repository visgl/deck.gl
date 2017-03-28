import React, {Component} from 'react';

import {MAPBOX_STYLES} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import ArcOverlay, {inFlowColors, outFlowColors} from '../../../../examples/arc/deckgl-overlay';

const colorRamp = inFlowColors.slice().reverse().concat(outFlowColors)
  .map(color => `rgb(${color.join(',')})`);

export default class ArcDemo extends Component {

  static get data() {
    return {
      url: 'data/arc-data.txt',
      worker: 'workers/arc-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      lineWidth: {displayName: 'Width', type: 'number', value: 2, step: 1, min: 1}
    };
  }

  static get viewport() {
    return {
      ...ArcOverlay.defaultViewport,
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
      selectedCounty: props.data ? props.data[362] : null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({
        selectedCounty: nextProps.data[362]
      });
    }
  }

  _onSelectCounty({object}) {
    this.setState({selectedCounty: object});
    this.props.onStateChange({sourceName: object.properties.name});
  }

  render() {
    const {viewport, params, data} = this.props;
    const {selectedCounty} = this.state;

    if (!data) {
      return null;
    }

    return (
      <ArcOverlay viewport={viewport}
        data={data}
        selectedFeature={selectedCounty}
        strokeWidth={params.lineWidth.value}
        onClick={this._onSelectCounty.bind(this)} />
    );
  }
}
