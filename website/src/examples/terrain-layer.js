// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Component} from 'react';
import App from 'website-examples/terrain/app';
import {GITHUB_TREE, MAPBOX_STYLES} from '../constants/defaults';

import {makeExample} from '../components';

const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const LOCATIONS = {
  'Mt. St Helens': {
    latitude: 46.2,
    longitude: -122.18,
    zoom: 12.5,
    bearing: 120
  },
  'Grand Canyon': {
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
    zoom: 10
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

class TerrainDemo extends Component {
  static title = 'Terrains';

  static code = `${GITHUB_TREE}/examples/website/terrain`;

  static parameters = {
    globeView: {displayName: 'Globe View', type: 'checkbox', value: false},
    location: {
      displayName: 'Location',
      type: 'select',
      options: Object.keys(LOCATIONS),
      value: 'Mt. St Helens'
    },
    surface: {
      displayName: 'Surface',
      type: 'select',
      options: Object.keys(SURFACE_IMAGES),
      value: 'Satellite'
    },
    wireframe: {displayName: 'Wireframe', type: 'checkbox', value: false},
    minZoom: {
      displayName: 'Min Zoom',
      type: 'range',
      value: 0,
      step: 1,
      min: 0,
      max: 19,
      accentColor: '#0275ff'
    },
    maxZoom: {
      displayName: 'Max Zoom',
      type: 'range',
      value: 14,
      step: 1,
      min: 0,
      max: 19,
      accentColor: '#0275ff'
    },
    visibleMinZoom: {
      displayName: 'Visible Min Zoom',
      type: 'range',
      value: 0,
      step: 1,
      min: 0,
      max: 19,
      accentColor: '#1a2b4a'
    },
    visibleMaxZoom: {
      displayName: 'Visible Max Zoom',
      type: 'range',
      value: 19,
      step: 1,
      min: 0,
      max: 19,
      accentColor: '#1a2b4a'
    },
    zoomOffset: {
      displayName: 'Zoom Offset',
      type: 'range',
      value: 0,
      min: -2,
      max: 2,
      step: 1
    }
  };

  static mapStyle = MAPBOX_STYLES.BLANK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Reconstructed 3D terrain from mapbox's Elevation service.</p>
        <p>
          Data sources:
          <div>
            Mapbox{' '}
            <a href="https://docs.mapbox.com/help/troubleshooting/access-elevation-data/">
              Terrain-RGB
            </a>{' '}
            and <a href="https://www.mapbox.com/maps/satellite/">Satellite</a>
          </div>
          <div>
            <a href="http://www.chartbundle.com/charts/">Chartbundle US Sectional</a>
          </div>
          <div>
            <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>
          </div>
        </p>
        <div className="layout">
          <div className="stat col-1-2">
            Viewport Zoom<b>{meta.zoom != null ? meta.zoom.toFixed(1) : '-'}</b>
          </div>
        </div>
      </div>
    );
  }

  _onZoomChange = zoom => {
    this.props.onStateChange({zoom});
  };

  render() {
    const {params, data, ...otherProps} = this.props;
    const {
      location,
      surface,
      wireframe,
      globeView,
      minZoom,
      maxZoom,
      visibleMinZoom,
      visibleMaxZoom,
      zoomOffset
    } = params;

    const initialViewState = LOCATIONS[location.value];
    initialViewState.pitch = 45;

    return (
      <div style={{background: '#111', height: '100%'}}>
        <App
          {...otherProps}
          data={data}
          initialViewState={initialViewState}
          texture={SURFACE_IMAGES[surface.value]}
          wireframe={wireframe.value}
          globeView={globeView.value}
          minZoom={minZoom.value}
          maxZoom={maxZoom.value}
          visibleMinZoom={visibleMinZoom.value}
          visibleMaxZoom={visibleMaxZoom.value}
          zoomOffset={zoomOffset.value}
          onZoomChange={this._onZoomChange}
        />
      </div>
    );
  }
}

export default makeExample(TerrainDemo);
