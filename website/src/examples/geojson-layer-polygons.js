import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App, {COLOR_SCALE} from 'website-examples/geojson/app';

import {makeExample} from '../components';

class GeoJsonDemo extends Component {
  static title = 'Vancouver Property Value';

  static data = {
    url: `${DATA_URI}/vancouver-blocks.txt`,
    worker: '/workers/geojson-data-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/geojson`;

  static parameters = {};

  static mapStyle = MAPBOX_STYLES.LIGHT;

  static renderInfo(meta) {
    const legends = COLOR_SCALE.domain();
    const width = `${100 / legends.length}%`;

    return (
      <div>
        <p>The property value of Vancouver, BC</p>
        <p>
          Height of polygons - average property value per square meter of lot
          <br />
          Color - value growth from last assessment
        </p>
        <div className="layout">
          {legends.map((l, i) => (
            <div
              key={i}
              className="legend"
              style={{background: `rgb(${COLOR_SCALE(l).join(',')})`, width}}
            />
          ))}
        </div>
        <div className="layout">
          {legends.map(
            (l, i) =>
              i % 2 === 0 && (
                <div key={i} style={{width}}>
                  {Math.round(l * 100)}%
                </div>
              )
          )}
        </div>
        <p>
          Data source:&nbsp;
          <a href="http://data.vancouver.ca/">City of Vancouver</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            No. of Polygons<b>{readableInteger(meta.count) || 0}</b>
          </div>
          <div className="stat col-1-2">
            No. of Vertices<b>{readableInteger(meta.vertexCount || 0)}</b>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return <App {...this.props} />;
  }
}

export default makeExample(GeoJsonDemo);
