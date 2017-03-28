import React, {Component} from 'react';
import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES} from '../../constants/defaults';
import GeoJsonOverlay from '../../../../examples/geojson/deckgl-overlay';

const MAX_AGE = 160;
const colorScale = v => {
  const r = v / MAX_AGE;
  return [255 * r, 200 * (1 - r), 255 * (1 - r)];
};

export default class GeoJsonDemo extends Component {

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
      ...GeoJsonOverlay.defaultViewport,
      mapStyle: MAPBOX_STYLES.LIGHT
    };
  }

  static renderInfo(meta) {

    const legendCount = 5;
    const legendBlocks = (new Array(legendCount)).fill(0).map((d, i) => {
      const color = colorScale(i / (legendCount - 1) * MAX_AGE).map(Math.round);
      return `rgb(${color.join(',')})`;
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
          <span className="col-1-3 text-center">{ MAX_AGE / 2}</span>
          <span className="col-1-3 text-right">{ MAX_AGE }</span>
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
    const {viewport, data} = this.props;

    if (!data) {
      return null;
    }

    return (
      <GeoJsonOverlay viewport={viewport} dataArray={data} colorScale={colorScale} />
    );
  }
}
