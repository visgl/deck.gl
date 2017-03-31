import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES} from '../../constants/defaults';
import ScreenGridOverlay from '../../../../examples/screen-grid/deckgl-overlay';

export default class ScreenGridDemo extends Component {

  static get data() {
    return {
      url: 'data/screen-grid-data.txt',
      worker: 'workers/screen-grid-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      cellSize: {displayName: 'Cell Size', type: 'range', value: 30, step: 1, min: 10, max: 100}
    };
  }

  static get viewport() {
    return {
      ...ScreenGridOverlay.defaultViewport,
      perspectiveEnabled: false,
      mapStyle: MAPBOX_STYLES.DARK
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Public Transit Accessibility In California</h3>
        <p>Distribution of public transportation stops.</p>
        <p>The layer aggregates data within the boundary of screen grid cells and maps the aggregated values to a dynamic color scale</p>
        <p>Data source: <a href="http://openstreetmap.org">OpenStreetMaps</a></p>
        <div className="stat">No. of Samples<b>{ readableInteger(meta.count || 0) }</b></div>
      </div>
    );
  }

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    return (
      <ScreenGridOverlay viewport={viewport} data={data} cellSize={params.cellSize.value} />
    );
  }
}
