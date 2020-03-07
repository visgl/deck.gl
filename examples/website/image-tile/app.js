import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import DeckGL, {OrthographicView, COORDINATE_SYSTEM} from 'deck.gl';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';
import {load} from '@loaders.gl/core';

const INITIAL_VIEW_STATE = {
  target: [13000, 13000, 0],
  zoom: -5
};

const ROOT_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/image-tiles/moon.image';

export default class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      height: null,
      width: null,
      tileSize: null
    };
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
    this.inTileBounds = this.inTileBounds.bind(this);
    this.cutOffImageBounds = this.cutOffImageBounds.bind(this);
    this.fetchDataFromDZI(`${ROOT_URL}/moon.image.dzi`);
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

  inTileBounds({x, y, z}) {
    const xInBounds = x < Math.ceil(this.state.width / (this.state.tileSize * 2 ** z)) && x >= 0;
    const yInBounds = y < Math.ceil(this.state.height / (this.state.tileSize * 2 ** z)) && y >= 0;
    return xInBounds && yInBounds;
  }

  cutOffImageBounds({left, bottom, right, top}) {
    return {
      left: Math.max(0, left),
      bottom: Math.max(0, Math.min(this.state.height, bottom)),
      right: Math.max(0, Math.min(this.state.width, right)),
      top: Math.max(0, top)
    };
  }

  fetchDataFromDZI(dziSource) {
    return (
      fetch(dziSource) // eslint-disable-line no-undef
        .then(response => response.text())
        // eslint-disable-next-line no-undef
        .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
        .then(dziXML => {
          if (Number(dziXML.getElementsByTagName('Image')[0].attributes.Overlap.value) !== 0) {
            // eslint-disable-next-line no-undef, no-console
            console.warn('Overlap paramter is nonzero and should be 0');
          }
          this.setState({
            height: Number(dziXML.getElementsByTagName('Size')[0].attributes.Height.value),
            width: Number(dziXML.getElementsByTagName('Size')[0].attributes.Width.value),
            tileSize: Number(dziXML.getElementsByTagName('Image')[0].attributes.TileSize.value)
          });
        })
    );
  }

  _renderLayers() {
    const {autoHighlight = true, highlightColor = [60, 60, 60, 40]} = this.props;
    const {tileSize} = this.state;
    return [
      new TileLayer({
        pickable: true,
        onHover: this._onHover,
        tileSize,
        autoHighlight,
        highlightColor,
        minZoom: -16,
        maxZoom: 0,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getTileData: ({x, y, z}) => {
          if (this.inTileBounds({x, y, z: -z})) {
            return load(`${ROOT_URL}/moon.image_files/${15 + z}/${x}_${y}.jpeg`);
          }
          return null;
        },

        renderSubLayers: props => {
          const {
            bbox: {left, bottom, right, top}
          } = props.tile;
          const newBounds = this.cutOffImageBounds({left, bottom, right, top});
          return new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [newBounds.left, newBounds.bottom, newBounds.right, newBounds.top]
          });
        }
      })
    ];
  }

  render() {
    return (
      <DeckGL
        views={[new OrthographicView({id: 'ortho'})]}
        layers={this.state.tileSize ? this._renderLayers() : []}
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
