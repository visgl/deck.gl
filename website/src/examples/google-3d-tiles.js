import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/google-3d-tiles/app';

import {makeExample} from '../components';

class HeatmapDemo extends Component {
  static title = 'Photorealistic 3D Tiles';

  static code = `${GITHUB_TREE}/examples/website/google-3d-tiles`;

  static parameters = {
    opacity: {displayName: 'Opacity', type: 'range', value: 0.2, step: 0.01, min: 0, max: 0.5}
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Photorealistic 3D Tiles</p>
        <div>
          <img
            src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"
            alt="color scale"
            style={{height: 8, width: '100%'}}
          />
        </div>
        <p className="layout">
          <span className="col-1-2">Close</span>
          <span className="col-1-2 text-right">Far</span>
        </p>
        <p>
          Data source: <a href="https://todo">TODO</a>
        </p>
      </div>
    );
  }

  render() {
    const {params} = this.props;
    const opacity = params.opacity.value;

    return <App {...this.props} opacity={opacity} />;
  }
}

export default makeExample(HeatmapDemo);
