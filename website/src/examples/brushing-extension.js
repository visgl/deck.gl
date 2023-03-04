import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {readableInteger} from '../utils/format-utils';
import App, {inFlowColors, outFlowColors} from 'website-examples/brushing/app';

import {makeExample} from '../components';

const colorRamp = inFlowColors
  .slice()
  .reverse()
  .concat(outFlowColors)
  .map(color => `rgb(${color.join(',')})`);

class BrushingDemo extends Component {
  static title = 'United States County-to-county Migration';

  static data = {
    url: `${DATA_URI}/arc-data.txt`,
    worker: '/workers/arc-data-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/brushing`;

  static parameters = {
    enableBrushing: {displayName: 'Enable Brushing', type: 'checkbox', value: true},
    lineWidth: {displayName: 'Width', type: 'range', value: 1, step: 1, min: 1, max: 10},
    opacity: {displayName: 'Arc Opacity', type: 'range', value: 0.4, step: 0.01, min: 0, max: 1},
    brushRadius: {
      displayName: 'Brush Radius',
      type: 'range',
      value: 200000,
      step: 1000,
      min: 50000,
      max: 1000000
    }
  };

  static mapStyle = MAPBOX_STYLES.LIGHT;

  static renderInfo(meta) {
    return (
      <div>
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
            No. of Counties<b>{meta.count || 0}</b>
          </div>
          <div className="stat col-1-2">
            No. of Arcs<b>{readableInteger(meta.flowCount || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {params} = this.props;

    return (
      <App
        {...this.props}
        enableBrushing={params.enableBrushing.value}
        strokeWidth={params.lineWidth.value}
        brushRadius={params.brushRadius.value}
        opacity={params.opacity.value}
      />
    );
  }
}

export default makeExample(BrushingDemo);
