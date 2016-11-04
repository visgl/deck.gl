import 'babel-polyfill';
import React, {Component} from 'react';
import {ChoroplethLayer64} from '../../../../../index';
import DeckGL from '../../../../../react';

import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES} from '../../constants/defaults';

function colorScale(r) {
  return [255 * r, 200 * (1 - r), 255 * (1 - r)];
}

export default class ChoroplethDemo extends Component {

  static get data() {
    return {
      url: 'data/choropleth-data.txt',
      worker: 'workers/choropleth-data-decoder.js'
    };
  }

  static get parameters() {
    return {};
  }

  static get viewport() {
    return {
      mapStyle: MAPBOX_STYLES.LIGHT,
      latitude: 41.87,
      longitude: -87.62,
      zoom: 13,
      maxZoom: 16,
      pitch: 0,
      bearing: 0
    };
  }

  static renderInfo(meta) {

    const legendCount = 5;
    const legendBlocks = (new Array(legendCount)).fill(0).map((d, i) => {
      const color = colorScale(i / (legendCount - 1)).map(Math.round);
      return `rgb(${color.join(',')})`
    });
    const width = `${100 / legendCount}%`;

    return (
      <div>
        <h3>Chicago Building Ages</h3>
        <p>Age of Chicago Downtown Buildings</p>
        <div className="layout">
        {legendBlocks.map((background, i) => (
            <div key={i} className="legend" style={{background, width}} />
          ))}
        </div>
        <p className="layout">
          <span className="col-1-3">0</span>
          <span className="col-1-3 text-center">80</span>
          <span className="col-1-3 text-right">160</span>
        </p>
        <p>Source:&nbsp;
          <a href="https://data.cityofchicago.org/">City of Chicago</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            Polygons<b>{ readableInteger(meta.count) || 0 }</b>
          </div>
          <div className="stat col-1-2">
            Vertices<b>{ readableInteger(meta.vertexCount || 0) }</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    const layers = data.map((d, i) => new ChoroplethLayer64({
      id: `choropleth-${i}`,
      data: d,
      getColor: f => {
        const r = f.properties.value / 160;
        return colorScale(r);
      }
    }));

    return (
      <DeckGL {...viewport} layers={ layers } />
    );
  }
}
