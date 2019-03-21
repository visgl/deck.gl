import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import DeckGL, {TileLayer, BitmapLayer} from 'deck.gl';

export const INITIAL_VIEW_STATE = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  // https://wiki.openstreetmap.org/wiki/Zoom_levels
  maxZoom: 20,
  pitch: 50,
  bearing: 0
};

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
// `s` represents sub-domain of tile servers
const s = 'c';

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
          <div className="tooltip-item">
            <div>tile:</div>
            <div>
              x: {tile.x}, y: {tile.y}, z: {tile.z}
            </div>
          </div>
          <div className="tooltip-item">
            <div>boundary:</div>
            <div>
              north: {sourceLayer.props.bounds[3].toFixed(4)}, west:{' '}
              {sourceLayer.props.bounds[0].toFixed(4)}
            </div>
          </div>
          <div className="tooltip-item">
            <div>coordinates:</div>
            <div>
              x: {x.toFixed(4)}, y: {y.toFixed(4)}
            </div>
          </div>
        </div>
      )
    );
  }

  _renderLayers() {
    return [
      new TileLayer({
        pickable: true,
        onHover: this._onHover,
        renderSubLayers: props => {
          const {x, y, z, bbox} = props.tile;
          const {west, south, east, north} = bbox;

          return new BitmapLayer({
            id: `bitmap-${props.id}`,
            image: `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`,
            bounds: [west, south, east, north],

            pickable: true,
            tile: props.tile
          });
        }
      })
    ];
  }

  render() {
    const {viewState, controller = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
