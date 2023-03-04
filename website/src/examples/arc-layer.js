import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App, {inFlowColors, outFlowColors} from 'website-examples/arc/app';

import {makeExample} from '../components';

const colorRamp = inFlowColors
  .slice()
  .reverse()
  .concat(outFlowColors)
  .map(color => `rgb(${color.join(',')})`);

class ArcDemo extends Component {
  static title = 'United States County-to-county Migration';

  static data = {
    url: `${DATA_URI}/arc-data.txt`,
    worker: '/workers/arc-data-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/arc`;

  static parameters = {
    lineWidth: {displayName: 'Width', type: 'range', value: 1, step: 0.1, min: 0, max: 10}
  };

  static mapStyle = MAPBOX_STYLES.LIGHT;

  static renderInfo(meta) {
    return (
      <>
        <p>
          People moving in and out of <b>{meta.sourceName}</b> between 2009-2013
        </p>

        <div className="layout">
          {colorRamp.map((c, i) => (
            <div
              key={i}
              className="legend"
              style={{background: c, width: `${100 / colorRamp.length}%`}}
            />
          ))}
        </div>
        <p className="layout">
          <span className="col-1-2">Net gain</span>
          <span className="col-1-2 text-right">Net loss</span>
        </p>

        <p>
          Data source: <a href="http://www.census.gov">US Census Bureau</a>
        </p>

        <div className="layout">
          <div className="stat col-1-2">
            Counties<b>{meta.count || 0}</b>
          </div>
          <div className="stat col-1-2">
            Arcs<b>{readableInteger(meta.flowCount || 0)}</b>
          </div>
        </div>
      </>
    );
  }

  _onSelectCounty = f => {
    this.props.onStateChange({sourceName: f.properties.name});
  };

  render() {
    const {params, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        strokeWidth={params.lineWidth.value}
        onSelectCounty={this._onSelectCounty}
      />
    );
  }
}

export default makeExample(ArcDemo);
