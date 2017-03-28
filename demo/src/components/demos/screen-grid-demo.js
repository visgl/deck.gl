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
      cellSize: {displayName: 'Cell Size', type: 'number', value: 10, step: 5, min: 10}
    };
  }

  static get viewport() {
    return {
      ...ScreenGridOverlay.defaultViewport,
      mapStyle: MAPBOX_STYLES.DARK
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Public Transit Accessibility In California</h3>
        <p>Distribution of public transportation stops.</p>
        <p>Data source: <a href="http://openstreetmap.org">OpenStreetMaps</a></p>
        <div className="stat">Samples<b>{ readableInteger(meta.count || 0) }</b></div>
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
