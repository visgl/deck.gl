import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import App from 'website-examples/terrain/app';

const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const LOCATIONS = {
  'Mt. St Helens': {
    latitude: 46.2,
    longitude: -122.18,
    zoom: 12.5,
    bearing: 120
  },
  "Grand Canyon": {
    latitude: 36.1101,
    longitude: -112.1906,
    zoom: 12.5
  },
  'San Francisco': {
    latitude: 37.6,
    longitude: -122.1173,
    zoom: 10
  },
  'Los Angeles': {
    latitude: 34.0524,
    longitude: -118.2413,
    zoom: 10,
  },
  'New York City': {
    latitude: 40.7311,
    longitude: -73.9838,
    zoom: 13
  },
  Melbourne: {
    latitude: -37.8173,
    longitude: 144.9656,
    zoom: 11.5
  },
  Dallas: {
    latitude: 32.8,
    longitude: -97.0376,
    zoom: 10
  }
};

const SURFACE_IMAGES = {
  Sectional: 'https://wms.chartbundle.com/tms/1.0.0/sec/{z}/{x}/{y}.png?origin=nw',
  Satellite: `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`,
  Street: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
  None: null
};

export default class TerrainDemo extends Component {
  static get parameters() {
    return {
      location: {displayName: 'Location', type: 'select', options: Object.keys(LOCATIONS), value: 'Mt. St Helens'},
      surface: {displayName: 'Surface', type: 'select', options: Object.keys(SURFACE_IMAGES), value: 'Satellite'},
      wireframe: {displayName: 'Wireframe', type: 'checkbox', value: false}
    };
  }

  static get mapStyle() {
    return MAPBOX_STYLES.BLANK;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Terrains</h3>
        <p>Reconstructed 3D terrain from mapbox's Elevation service.</p>
        <p>Data sources:
          <div>Mapbox <a href="https://docs.mapbox.com/help/troubleshooting/access-elevation-data/">Terrain-RGB</a> and <a href="https://www.mapbox.com/maps/satellite/">Satellite</a></div>
          <div><a href="http://www.chartbundle.com/charts/">Chartbundle US Sectional</a></div>
          <div><a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a></div>
        </p>
      </div>
    );
  }

  render() {
    const {params, data, ...otherProps} = this.props;
    const {location, surface, wireframe} = params;

    const initialViewState = LOCATIONS[location.value];
    initialViewState.pitch = 45;

    return (
      <div style={{background: '#111', height: '100%'}}>
        <App
          {...otherProps}
          data={data}
          initialViewState={initialViewState}
          texture={SURFACE_IMAGES[surface.value]}
          wireframe={wireframe.value} />
      </div>
    );
  }
}
