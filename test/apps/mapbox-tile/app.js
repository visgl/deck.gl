/* global document fetch */
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {TileLayer} from '@deck.gl/geo-layers';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

import {decodeTile} from './utils/decode';

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
  stroked: true,
  extruded: true,

  getElevation: f => (f.properties.extrude && f.properties.height) || 0,

  getLineColor: [192, 192, 192],

  getFillColor: f => {
    switch (f.properties.layer) {
      case 'water':
        return [140, 170, 180];
      case 'landcover':
        return [120, 190, 100];
      default:
        return [218, 218, 218];
    }
  },

  getLineWidth: f => {
    if (f.properties.layer === 'transportation') {
      switch (f.properties.class) {
        case 'primary':
          return 12;
        case 'motorway':
          return 16;
        default:
          return 6;
      }
    }
    return 1;
  },
  lineWidthMinPixels: 1,

  getPointRadius: 100,
  pointRadiusMinPixels: 2,
  opacity: 1
};

function getTileData({x, y, z}) {
  const mapSource = `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/${z}/${x}/${y}.vector.pbf?access_token=${MAPBOX_TOKEN}`;
  return fetch(mapSource)
    .then(response => response.arrayBuffer())
    .then(buffer => decodeTile(x, y, z, buffer));
}

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

    return <div className="clicked-info">{JSON.stringify(clickedItem.properties)}</div>;
  }

  render() {
    return (
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        onClick={this._onClick}
        layers={[
          new TileLayer({
            ...MAP_LAYER_STYLES,
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            pickable: true,
            getTileData
          })
        ]}
      >
        {this._renderClickedItem()}
      </DeckGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
