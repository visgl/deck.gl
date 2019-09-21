import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import DeckGL from '@deck.gl/react';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';
import {load} from '@loaders.gl/core';

const INITIAL_VIEW_STATE = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  maxZoom: 20,
  bearing: 0
};

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
const tileServer = 'https://c.tile.openstreetmap.org/';

export class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  _onHover({x, y, sourceLayer, tile}) {
    this.setState({x, y, hoveredObject: {sourceLayer, tile}});
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    const {sourceLayer, tile} = hoveredObject || {};
    return (
      sourceLayer &&
      tile && (
        <div className="tooltip" style={{left: x, top: y}}>
          tile: x: {tile.x}, y: {tile.y}, z: {tile.z}
        </div>
      )
    );
  }

  _renderLayers() {
    const {autoHighlight = true, highlightColor = [60, 60, 60, 40]} = this.props;

    return [
      new TileLayer({
        pickable: true,
        onHover: this._onHover,
        autoHighlight,
        highlightColor,
        opacity: 1,
        // https://wiki.openstreetmap.org/wiki/Zoom_levels
        minZoom: 0,
        maxZoom: 19,

        getTileData: ({x, y, z}) => load(`${tileServer}/${z}/${x}/${y}.png`),

        renderSubLayers: props => {
          const {
            bbox: {west, south, east, north}
          } = props.tile;

          return new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north]
          });
        }
      })
    ];
  }

  render() {
    return (
      <DeckGL layers={this._renderLayers()} initialViewState={INITIAL_VIEW_STATE} controller={true}>
        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
