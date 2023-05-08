import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App, {COLORS} from 'website-examples/google-3d-tiles/app';

import {makeExample} from '../components';

class Google3dTilesDemo extends Component {
  static title = 'Photorealistic 3D Tiles';

  static code = `${GITHUB_TREE}/examples/website/google-3d-tiles`;

  static parameters = {
    filter: {displayName: 'Filter', type: 'range', value: 0, step: 1, min: 0, max: 400},
    opacity: {displayName: 'Opacity', type: 'range', value: 0.2, step: 0.01, min: 0, max: 0.5}
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Draping colored building outlines of Google Photorealistic 3D Tiles</p>
        <div className="layout">
          {COLORS.map((color, i) => {
            return (
              <div
                className="legend"
                key={i}
                style={{
                  background: `rgb(${color.join(',')})`,
                  width: `${100 / COLORS.length}%`
                }}
              />
            );
          })}
        </div>
        <p className="layout">
          <span className="col-1-2">Close</span>
          <span className="col-1-2 text-right">Far</span>
        </p>
        <p>Buildings are colored according to the distance to the nearest tree</p>
        <p>Data sources:</p>
        <ul>
          <li>
            <a href="https://land.copernicus.eu/pan-european/high-resolution-layers/forests/tree-cover-density">
              Tree Cover Density
            </a>
          </li>
          <li>
            <a href="https://wiki.openstreetmap.org/wiki/BigQuery_dataset">Building footprints</a>
          </li>
        </ul>
      </div>
    );
  }

  render() {
    const {params} = this.props;
    const filter = params.filter.value;
    const opacity = params.opacity.value;

    return <App {...this.props} filter={filter} opacity={opacity} />;
  }
}

export default makeExample(Google3dTilesDemo);
