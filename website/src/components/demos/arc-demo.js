import React, {Component} from 'react';
import autobind from 'autobind-decorator';

import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import App, {inFlowColors, outFlowColors} from 'website-examples/arc/app';

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
      lineWidth: {displayName: 'Width', type: 'range', value: 1, step: 0.1, min: 0, max: 10}
    };
  }

  static get mapStyle() {
    return MAPBOX_STYLES.LIGHT;
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

  @autobind
  _onSelectCounty(f) {
    this.props.onStateChange({sourceName: f.properties.name});
  }

  render() {
    const {params, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        strokeWidth={params.lineWidth.value}
        onSelectCounty={this._onSelectCounty} />
    );
  }
}
