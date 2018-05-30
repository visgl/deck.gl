/* global document, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, {MapView, ScreenGridLayer} from 'deck.gl';

const INITIAL_VIEW_STATE = {
  longitude: -119.3,
  latitude: 35.6,
  zoom: 6,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/screen-grid/ca-transit-stops.json'; // eslint-disable-line

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewState: INITIAL_VIEW_STATE
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    const viewState = Object.assign(this.state.viewState, {
      width: window.innerWidth,
      height: window.innerHeight
    });
    this._onViewStateChange({viewState});
  }

  _onViewStateChange({viewState}) {
    this.setState({
      viewState: {...this.state.viewState, ...viewState}
    });
  }

  render() {
    const {
      data = DATA_URL,
      cellSize = 20,

      onViewStateChange = this._onViewStateChange.bind(this),
      viewState = this.state.viewState,

      mapboxApiAccessToken = MAPBOX_TOKEN,
      mapStyle = "mapbox://styles/mapbox/dark-v9"
    } = this.props;

    const layer = new ScreenGridLayer({
      id: 'grid',
      data,
      minColor: [0, 0, 0, 0],
      getPosition: d => d,
      cellSizePixels: cellSize
    });

    return (
      <MapGL
        {...viewState}
        reuseMaps

        onViewportChange={viewport => onViewStateChange({viewState: viewport})}
        mapStyle={mapStyle}
        preventStyleDiffing={true}
        mapboxApiAccessToken={mapboxApiAccessToken}
      >

        <DeckGL
          layers={[layer]}
          views={new MapView({id: 'map'})}
          viewState={viewState}
          />;

      </MapGL>
    );
  }
}

// NOTE: EXPORTS FOR DECK.GL WEBSITE DEMO LAUNCHER - CAN BE REMOVED IN APPS
export {App, INITIAL_VIEW_STATE};

if (!window.demoLauncherActive) {
  render(<App />, document.body.appendChild(document.createElement('div')));
}
