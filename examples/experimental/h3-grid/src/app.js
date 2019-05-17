import React, {Component, Fragment} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';

import {StaticMap} from 'react-map-gl';

import H3GridLayer from './h3-grid-layer';
import {getMinZoom} from './h3-utils';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const CONTROL_PANEL_STYLE = {
  position: 'fixed',
  top: 20,
  left: 20,
  padding: 20,
  fontSize: 13,
  background: '#fff'
};

// `repeat` will draw multiple copies of the map at low zoom leveles
const MAP_VIEW = new MapView({repeat: true});
// hexagon per tile at minZoom
const MAX_HEX_COUNT = 1000;

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialViewState: {
        longitude: 0,
        latitude: 0,
        zoom: 2,
        pitch: 0,
        bearing: 0
      },
      resolution: 1
    };

    this._onResolutionChange = this._onResolutionChange.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);

    this._viewState = this.state.initialViewState;
  }

  _onViewStateChange({viewState}) {
    // Just save a copy of the viewState, no need to trigger rerender
    this._viewState = viewState;
  }

  _onResolutionChange(evt) {
    const resolution = Number(evt.target.value);
    const minZoom = getMinZoom(resolution, MAX_HEX_COUNT);
    const initialViewState = {
      ...this._viewState,
      zoom: Math.max(this._viewState.zoom, minZoom),
      minZoom
    };

    this.setState({initialViewState, resolution});
  }

  render() {
    const {resolution, initialViewState} = this.state;
    const layer = new H3GridLayer({
      // highPrecision: true,
      resolution,
      maxHexCount: MAX_HEX_COUNT,
      filled: true,
      extruded: false,
      stroked: true,
      lineWidthUnits: 'pixels',
      getLineWidth: 2,
      getFillColor: [0, 0, 0, 1],
      pickable: true,
      autoHighlight: true
    });

    return (
      <Fragment>
        <DeckGL
          initialViewState={initialViewState}
          controller={true}
          views={MAP_VIEW}
          layers={[layer]}
          onViewStateChange={this._onViewStateChange}
          getTooltip={info => info.object}
        >
          <StaticMap
            mapStyle="mapbox://styles/mapbox/light-v9"
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        </DeckGL>
        <div style={CONTROL_PANEL_STYLE}>
          <div>Resolution: {resolution}</div>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            value={resolution}
            onInput={this._onResolutionChange}
          />
        </div>
      </Fragment>
    );
  }
}

/* global document */
document.body.style.overflow = 'hidden';
render(<App />, document.body.appendChild(document.createElement('div')));
