import React, {Component} from 'react';

import {MAPBOX_STYLES} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import ArchBrushingOverlay, {inFlowColors, outFlowColors} from '../../../../examples/arc-brushing/deckgl-overlay';

const colorRamp = inFlowColors.slice().reverse().concat(outFlowColors)
  .map(color => `rgb(${color.join(',')})`);

export default class ArcBrushingDemo extends Component {
  static get trackMouseMove() {
    return true;
  }

  static get data() {
    return {
      url: 'data/arc-data.txt',
      worker: 'workers/arc-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      lineWidth: {displayName: 'Width', type: 'number', value: 1, step: 1, min: 1},
      opacity: {displayName: 'opacity', type: 'range', value: 0.3, step: 0.01, min: 0.01, max: 1}
    };
  }

  static get viewport() {
    return {
      ...ArchBrushingOverlay.defaultViewport,
      mapStyle: MAPBOX_STYLES.DARK
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

  render() {
    const {viewport, params, data, mousePosition} = this.props;

    if (!data) {
      return null;
    }

    return (
      <ArchBrushingOverlay viewport={viewport}
        data={data}
        mousePosition={mousePosition}
        strokeWidth={params.lineWidth.value}
        opacity={params.opacity.value}
      />
    );
  }
}
