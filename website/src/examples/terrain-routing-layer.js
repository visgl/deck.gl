import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/terrain-routing/app';

import {makeExample} from '../components';

const LOCATIONS = {
  'Stage 5': {
    latitude: 43.09822,
    longitude: -0.6194,
    zoom: 10
  },
  'Stage 6': {
    latitude: 43.02905,
    longitude: 0.11472,
    zoom: 10
  },
  'Stage 9': {
    latitude: 45.82382,
    longitude: 2.2899,
    zoom: 8
  },
  'Stage 13': {
    latitude: 46.07586,
    longitude: 5.38004,
    zoom: 9
  },
  "Stage 14": {
    latitude: 45.75779, 
    longitude: 6.48885,
    zoom: 9
  },
  'Stage 15': {
    latitude: 45.90044,
    longitude: 6.49025,
    zoom: 9
  },
  'Stage 17': {
    latitude: 45.89081,
    longitude: 6.66961,
    zoom: 9
  },
  'Stage 20': {
    latitude: 47.8761,
    longitude: 6.99999,
    zoom: 10
  }
};

class TerrainRoutingDemo extends Component {
  static title = 'Terrains Routing';

  static code = `${GITHUB_TREE}/examples/website/terrain`;

  static parameters = {
    location: {displayName: 'Location', type: 'select', options: Object.keys(LOCATIONS), value: 'Mt. St Helens'},
  };

  static mapStyle = MAPBOX_STYLES.BLANK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Reconstructed 3D terrain with routes from mapbox's Elevation service.</p>
        <p>Data sources:
          <div>Mapbox <a href="https://docs.mapbox.com/help/troubleshooting/access-elevation-data/">Terrain-RGB</a> and <a href="https://www.mapbox.com/maps/satellite/">Satellite</a></div>
        </p>
      </div>
    );
  }

  render() {
    const {params, data, ...otherProps} = this.props;
    const {location} = params;

    const initialViewState = LOCATIONS[location.value];
    initialViewState.pitch = 45;

    return (
      <div style={{background: '#111', height: '100%'}}>
        <App
          {...otherProps}
          data={data}
          initialViewState={initialViewState}
        />
      </div>
    );
  }
}

export default makeExample(TerrainRoutingDemo);
