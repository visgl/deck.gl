// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {MVTLayer} from '@deck.gl/geo-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  bearing: 0,
  pitch: 0,
  longitude: -122.45,
  latitude: 37.78,
  zoom: 12
};

const MAP_LAYER_STYLES = {
  maxZoom: 14,

  getFillColor: f => {
    switch (f.properties.layerName) {
      case 'poi':
        return [255, 0, 0];
      case 'water':
        return [120, 150, 180];
      case 'building':
        return [218, 218, 218];
      default:
        return [240, 240, 240];
    }
  },

  getLineWidth: 1,
  lineWidthUnits: 'pixels',
  getLineColor: [192, 192, 192],

  getPointRadius: 4,
  pointRadiusUnits: 'pixels'
};

class Root extends PureComponent {
  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
    this.state = {
      clickedItem: null
    };
  }

  _onClick(info) {
    this.setState({clickedItem: info.object});
  }

  _renderClickedItem() {
    const {clickedItem} = this.state;
    if (!clickedItem || !clickedItem.properties) {
      return null;
    }

    return (
      <div className="clicked-info">
        id: {clickedItem.id} {JSON.stringify(clickedItem.properties)}
      </div>
    );
  }

  render() {
    return (
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        onClick={this._onClick}
        layers={[
          new MVTLayer({
            ...MAP_LAYER_STYLES,
            data: 'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt',

            onClick: this._onClick.bind(this),
            pickable: true,
            autoHighlight: true,
            binary: true
          })
        ]}
      >
        {this._renderClickedItem()}
      </DeckGL>
    );
  }
}

const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
