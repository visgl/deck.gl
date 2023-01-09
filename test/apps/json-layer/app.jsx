import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import * as layers from '@deck.gl/layers';
import JSONLayer from './json-layer/json-layer';

import LAYERS_JSON from './layers.json';

const INITIAL_VIEW_STATE = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 11,
  maxZoom: 16,
  pitch: 45,
  bearing: 0
};

export default class App extends Component {
  render() {
    const {data = LAYERS_JSON} = this.props;

    return (
      <DeckGL
        width="100%"
        height="100%"
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        views={[new MapView()]}
        layers={[
          new JSONLayer({
            data,
            configuration: {classes: layers}
          })
        ]}
      />
    );
  }
}

/* global document */
render(<App />, document.body.appendChild(document.createElement('div')));
