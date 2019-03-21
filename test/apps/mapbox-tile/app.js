/* global document fetch window */
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL from 'deck.gl';
import {TileLayer} from '@deck.gl/geo-layers';

import {decodeTile} from './utils/decode';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  bearing: 0,
  pitch: 0,
  longitude: -122.45,
  latitude: 37.78,
  zoom: 12,
  minZoom: 2,
  maxZoom: 14,
  height: window.innerHeight,
  width: window.innerWidth
};

const MAP_LAYER_STYLES = {
  stroked: false,

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
    .then(response => {
      return response.arrayBuffer();
    })
    .then(buffer => {
      return decodeTile(x, y, z, buffer);
    });
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
    this.setState({clickedItem: info && info.object});
  }

  _renderClickedItem() {
    const {clickedItem} = this.state;
    if (!clickedItem || !clickedItem.properties) {
      return null;
    }

    return (
      <div
        style={{
          position: 'fixed',
          zIndex: 9,
          margin: '20px',
          left: 0,
          bottom: 0,
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}
      >
        {JSON.stringify(clickedItem.properties)}
      </div>
    );
  }

  render() {
    return (
      <div>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          // onLayerClick={this._onClick}
          layers={[
            new TileLayer({
              ...MAP_LAYER_STYLES,
              pickable: true,
              onClick: this._onClick,
              getTileData
            })
          ]}
        />
        {this._renderClickedItem()}
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
