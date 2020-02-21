import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import DeckGL, {OrthographicView, COORDINATE_SYSTEM} from 'deck.gl';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';
import {load} from '@loaders.gl/core';

const INITIAL_VIEW_STATE = {
  target: [10000, 10000, 0],
  zoom: 0
};

function inTileBounds({x, y, z}) {
  const xInBounds = x < Math.ceil(31728 / (256 * 2 ** z)) && x >= 0;
  const yInBounds = y < Math.ceil(51669 / (256 * 2 ** z)) && y >= 0;
  return xInBounds && yInBounds;
}

function inImageBounds({top, bottom, left, right}) {
  const bottomInBounds = bottom <= 51669;
  const leftInBounds = left >= 0;
  const rightInBounds = right <= 31728;
  const topInBounds = top >= 0;
  return topInBounds && bottomInBounds && leftInBounds && rightInBounds;
}

function cutOffBounds({left, bottom, right, top}) {
  return {left, bottom: Math.min(51669, bottom), right: Math.min(31728, right), top};
}

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
    const {autoHighlight = true, highlightColor = [60, 60, 60, 40]} = this.props;

    return [
      new TileLayer({
        pickable: true,
        onHover: this._onHover,
        autoHighlight,
        highlightColor,
        minZoom: -16,
        maxZoom: 0,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getTileData: ({x, y, z}) => {
          if (inTileBounds({x, y, z: -z})) {
            return load(`sample_image/${16 + z}/${x}_${y}.jpeg`);
          }
          return null;
        },

        renderSubLayers: props => {
          const {
            bbox: {left, bottom, right, top}
          } = props.tile;
          const newBounds = cutOffBounds({left, bottom, right, top});
          if (inImageBounds(newBounds)) {
            return new BitmapLayer(props, {
              data: null,
              image: props.data,
              bounds: [newBounds.left, newBounds.bottom, newBounds.right, newBounds.top]
            });
          }
          return null;
        }
      })
    ];
  }

  render() {
    return (
      <DeckGL
        views={[new OrthographicView({id: 'ortho'})]}
        layers={this._renderLayers()}
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
