// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import App, {colorRange} from 'website-examples/zoom-bands/app';

import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import {makeExample} from '../components';
import {readableInteger} from '../utils/format-utils';

class GridDemo extends Component {
  static title = 'Paris Street Trees';

  static code = `${GITHUB_TREE}/examples/website/zoom-bands`;

  static parameters = {
    cellPixels: {
      displayName: 'Cell Size (px)',
      type: 'range',
      value: 24,
      step: 1,
      min: 8,
      max: 64
    },
    fadeWidth: {
      displayName: 'Fade Width (zoom)',
      type: 'range',
      value: 0.5,
      step: 0.05,
      min: 0.1,
      max: 1
    }
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Street trees managed by the City of Paris.</p>
        <p>
          A stack of GridLayers with power-of-two cell sizes crossfades as you zoom, ending with the
          individual trees. Each band is colored by its own quantiles.
        </p>
        <div className="layout">
          {colorRange.map((color, index) => (
            <div
              key={index}
              className="legend"
              style={{
                background: `rgb(${color.join(',')})`,
                width: `${100 / colorRange.length}%`
              }}
            />
          ))}
        </div>
        <p className="layout">
          <span className="col-1-2">Fewer Trees</span>
          <span className="col-1-2 text-right">More Trees</span>
        </p>
        <p>
          Data source:{' '}
          <a href="https://opendata.paris.fr/explore/dataset/les-arbres/">Paris Data</a>
        </p>
        {meta.band && <p>Showing: {meta.band}</p>}
        <div className="layout">
          <div className="stat col-1-2">
            Trees<b>{readableInteger(meta.count || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {params, mapStyle, onStateChange} = this.props;

    return (
      <App
        mapStyle={mapStyle}
        cellPixels={params.cellPixels.value}
        fadeWidth={params.fadeWidth.value}
        onDataLoad={count => onStateChange({count})}
        onBandChange={band => onStateChange({band})}
      />
    );
  }
}

export default makeExample(GridDemo);
