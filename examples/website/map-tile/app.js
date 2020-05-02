import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer, PathLayer} from '@deck.gl/layers';

const INITIAL_VIEW_STATE = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  maxZoom: 20,
  maxPitch: 89,
  bearing: 0
};

export default class App extends PureComponent {
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
    const {showBorder = false} = this.props;

    return [
      new TileLayer({
        // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
        data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',

        pickable: true,
        onHover: this._onHover,
        autoHighlight: showBorder,
        highlightColor: [60, 60, 60, 40],
        // https://wiki.openstreetmap.org/wiki/Zoom_levels
        minZoom: 0,
        maxZoom: 19,

        renderSubLayers: props => {
          const {
            bbox: {west, south, east, north}
          } = props.tile;

          return [
            new BitmapLayer(props, {
              data: null,
              image: props.data,
              bounds: [west, south, east, north]
            }),
            showBorder &&
              new PathLayer({
                id: `${props.id}-border`,
                data: [[[west, north], [west, south], [east, south], [east, north], [west, north]]],
                getPath: d => d,
                getColor: [255, 0, 0],
                widthMinPixels: 4
              })
          ];
        }
      })
    ];
  }

  render() {
    return (
      <DeckGL
        layers={this._renderLayers()}
        views={new MapView({repeat: true})}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
      >
        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
