import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import HeatmapOverlay from '../../../../examples/3d-heatmap/deckgl-overlay';

import {MAPBOX_STYLES} from '../../constants/defaults';

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
        value: 2000,
        step: 500,
        min: 500
      },
      coverage: {
        displayName: 'Coverage',
        type: 'number',
        value: 1,
        step: 0.1,
        min: 0,
        max: 1
      },
      upperPercentile: {
        displayName: 'Upper Percentile',
        type: 'number',
        value: 100,
        step: 0.5,
        min: 0,
        max: 100
      }
    };
  }

  static get viewport() {
    return {
      ...HeatmapOverlay.defaultViewport,
      mapStyle: MAPBOX_STYLES.DARK
    };
  }

  static renderInfo(meta) {

    const colorRamp = HeatmapOverlay.defaultColorRange.slice()
      .map(color => `rgb(${color.join(',')})`);

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
        </div>
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {viewport, params, data} = this.props;
    if (!data) {
      return null;
    }

    return (
      <HeatmapOverlay
        viewport={viewport}
        data={data}
        radius={params.radius.value}
        upperPercentile={params.upperPercentile.value}
        coverage={params.coverage.value}
      />
    );
  }
}
