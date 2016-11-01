import 'babel-polyfill';
import React, {Component} from 'react';
import {ScreenGridLayer} from '../../../../../index';
import DeckGL from '../../../../../react';

import {MAPBOX_STYLES} from '../../constants/defaults';

export default class GridDemo extends Component {

  static get data() {
    return {
      url: 'data/grid-data.txt',
      worker: 'workers/grid-data-decoder.js'
    };
  }

  static get parameters() {
    return {
      cellSize: {displayName: 'Cell Size', type: 'number', value: 10, step: 5, min: 10}
    };
  }

  static get viewport() {
    return {
      mapStyle: MAPBOX_STYLES.DARK,
      longitude: -119.3,
      latitude: 35.6,
      zoom: 6,
      maxZoom: 20,
      pitch: 0,
      bearing: 0
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Public Transit Accessibility In California</h3>
        <p>Distribution of public transportation stops. <i>Source: OpenStreetMaps</i></p>
        <div className="stat">Samples<b>{ meta.count || 0 }</b></div>
      </div>
    );
  }

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    const layer = new ScreenGridLayer({
      id: 'grid',
      data: data,
      unitWidth: params.cellSize.value,
      unitHeight: params.cellSize.value
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } />
    );
  }
}
