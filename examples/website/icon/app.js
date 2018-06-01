/* global document, fetch, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {MapView, MapController, IconLayer, WebMercatorViewport} from 'deck.gl';
import rbush from 'rbush';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/icon/meteorites.json'; // eslint-disable-line

const ICON_SIZE = 60;

const INITIAL_VIEW_STATE = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

function getIconName(size) {
  if (size === 0) {
    return '';
  }
  if (size < 10) {
    return `marker-${size}`;
  }
  if (size < 100) {
    return `marker-${Math.floor(size / 10)}0`;
  }
  return 'marker-100';
}

function getIconSize(size) {
  return Math.min(100, size) / 100 * 0.5 + 0.5;
}

/* eslint-disable react/no-deprecated */
class App extends Component {
  constructor(props) {
    super(props);

    // build spatial index
    this._tree = rbush(9, ['.x', '.y', '.x', '.y']);

    this.state = {
      viewState: INITIAL_VIEW_STATE,

      x: 0,
      y: 0,
      hoveredItems: null,
      expanded: false,

      data: null,
      iconMapping: null
    };

    if (!window.demoLauncherActive) {
      fetch(DATA_URL)
        .then(resp => resp.json())
        .then(data => {
          this.setState({data});
        });

      fetch('./data/location-icon-mapping.json')
        .then(resp => resp.json())
        .then(data => this.setState({iconMapping: data}));
    }
  }

  _onViewStateChange({viewState}) {
    this.setState({
      viewState: {...this.state.viewState, ...viewState}
    });
  }

  // Compute icon clusters
  // We use the projected positions instead of longitude and latitude to build
  // the spatial index, because this particular dataset is distributed all over
  // the world, we can't use some fixed deltaLon and deltaLat
  _updateCluster({data, viewState}) {
    const oldViewState = this._oldViewState || {};
    const oldData = this._oldData;
    const changed =
      data !== oldData ||
      viewState.width !== oldViewState.width ||
      viewState.height !== oldViewState.height;

    if (!data || !changed) {
      return;
    }

    this._oldViewState = viewState;
    this._oldData = data;

    const tree = this._tree;

    const transform = new WebMercatorViewport({
      ...viewState,
      zoom: 0
    });

    data.forEach(p => {
      const screenCoords = transform.project(p.coordinates);
      p.x = screenCoords[0];
      p.y = screenCoords[1];
      p.zoomLevels = [];
    });

    tree.clear();
    tree.load(data);

    for (let z = 0; z <= 20; z++) {
      const radius = ICON_SIZE / 2 / Math.pow(2, z);

      data.forEach(p => {
        if (p.zoomLevels[z] === undefined) {
          // this point does not belong to a cluster
          const {x, y} = p;

          // find all points within radius that do not belong to a cluster
          const neighbors = tree
            .search({
              minX: x - radius,
              minY: y - radius,
              maxX: x + radius,
              maxY: y + radius
            })
            .filter(neighbor => neighbor.zoomLevels[z] === undefined);

          // only show the center point at this zoom level
          neighbors.forEach(neighbor => {
            if (neighbor === p) {
              p.zoomLevels[z] = {
                icon: getIconName(neighbors.length),
                size: getIconSize(neighbors.length),
                points: neighbors
              };
            } else {
              neighbor.zoomLevels[z] = null;
            }
          });
        }
      });
    }
  }

  render() {
    const {
      data = this.state.data,
      iconMapping = this.state.iconMapping,
      iconAtlas = 'data/location-icon-atlas.png',
      showCluster = true,

      onViewStateChange = this._onViewStateChange.bind(this),
      viewState = this.state.viewState,

      mapboxApiAccessToken = MAPBOX_TOKEN,
      mapStyle = 'mapbox://styles/mapbox/dark-v9'
    } = this.props;

    this._updateCluster({data, viewState});

    const z = Math.floor(viewState.zoom);
    const size = showCluster ? 1 : Math.min(Math.pow(1.5, viewState.zoom - 10), 1);
    const updateTrigger = z * showCluster;

    const layers = [
      iconMapping &&
        new IconLayer({
          id: 'icon',
          data,
          pickable: this.props.onHover || this.props.onClick,
          iconAtlas,
          iconMapping,
          sizeScale: ICON_SIZE * size * window.devicePixelRatio,
          getPosition: d => d.coordinates,
          getIcon: d => (showCluster ? d.zoomLevels[z] && d.zoomLevels[z].icon : 'marker'),
          getSize: d => (showCluster ? d.zoomLevels[z] && d.zoomLevels[z].size : 1),
          onHover: this.props.onHover,
          onClick: this.props.onClick,
          updateTriggers: {
            getIcon: updateTrigger,
            getSize: updateTrigger
          }
        })
    ];

    return (
      <DeckGL
        layers={layers}
        views={new MapView({id: 'map'})}
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        controller={MapController}
      >
        <StaticMap
          viewId="map"
          {...viewState}
          reuseMaps
          mapStyle={mapStyle}
          mapboxApiAccessToken={mapboxApiAccessToken}
          preventStyleDiffing={true}
        />

        <div>
          {this.props.children}
        </div>

      </DeckGL>
    );
  }
}

// NOTE: EXPORTS FOR DECK.GL WEBSITE DEMO LAUNCHER - CAN BE REMOVED IN APPS
export {App, INITIAL_VIEW_STATE};

if (!window.demoLauncherActive) {
  render(<App />, document.body.appendChild(document.createElement('div')));
}
