import 'babel-polyfill';
import React, {Component} from 'react';
import {ChoroplethLayer} from '../../../../../index';
import DeckGL from '../../../../../react';

import {readableInteger} from '../../utils/format-utils';
import {MAPBOX_STYLES} from '../../constants/defaults';

export default class ChoroplethDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

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
      longitude: 0,
      latitude: 0,
      zoom: 1,
      maxZoom: 12,
      pitch: 0,
      bearing: 0
    };
  }

  static renderInfo(meta) {

    const legendCount = 5;
    const legendBlocks = (new Array(legendCount)).fill(0).map(
      (d, i) => `rgb(255,${Math.round(255 * (1 - i / (legendCount - 1)))},0)`
    );
    const width = `${100 / legendCount}%`;

    return (
      <div>
        <h3>Regions With GDP Over 100 Billion US Dollars</h3>
        <p>
          <div className="layout">
          {legendBlocks.map((background, i) => (
              <div key={i} className="legend" style={{background, width}} />
            ))}
          </div>
          <div className="layout">
            <div className="col-1-2">$100B</div>
            <div className="col-1-2 text-right">$3,000B</div>
          </div>
        </p>
        <p>Source:&nbsp;
          <a href="https://en.wikipedia.org/wiki/List_of_country_subdivisions_by_GDP_over_100_billion_US_dollars">
            Wikipedia</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            Choropleths<b>{ readableInteger(meta.count) || 0 }</b>
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

    const layers = data.map((d, i) => new ChoroplethLayer({
      id: `buildings-${i}`,
      data: d,
      opacity: Math.min(1, Math.max(0, 3 - viewport.zoom / 3)),
      getColor: f => {
        const r = f.properties.value / 3000;
        return [255, 255 * (1 - r), 0]
      }
    }));

    return (
      <DeckGL {...viewport} layers={ layers } />
    );
  }
}
