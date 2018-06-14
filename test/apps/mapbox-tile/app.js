/* global document */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {MapController} from 'deck.gl';

import MapLayer from './map-layer/map-layer';
import {MAP_STYLE} from './constants';
import CustomView from './views';

import './shaderlib';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

class Root extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewState: {
        longitude: -122.45,
        latitude: 37.78,
        zoom: 12,
        minZoom: 2,
        maxZoom: 14
      }
    };

    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  render() {
    return (
      <DeckGL
        views={new CustomView()}
        controller={MapController}
        viewState={this.state.viewState}
        onViewStateChange={this._onViewStateChange}
        layers={[
          new MapLayer({
            source: 'https://d3dt5tsgfu6lcf.cloudfront.net/tile/v1/{z}/{x}/{y}/COMPOSITE?v=4',
            style: MAP_STYLE,
            onClick: info => console.log(JSON.stringify(info.object))
          })
        ]} />
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
