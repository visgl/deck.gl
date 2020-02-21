// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {CompositeLayer} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {WebMercatorViewport, COORDINATE_SYSTEM} from '@deck.gl/core';
import {load} from '@loaders.gl/core';
import {TerrainLoader} from '@loaders.gl/terrain';
import TileLayer from '../tile-layer/tile-layer';

const defaultProps = {
  ...TileLayer.defaultProps,
  // Image url that encodes height data
  terrainImage: {type: 'string', value: null},
  // Image url to use as texture
  surfaceImage: {type: 'string', value: null, optional: true},
  // Martini error tolerance in meters, smaller number -> more detailed mesh
  meshMaxError: {type: 'number', value: 4.0},
  // Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates
  bounds: {type: 'array', value: null, optional: true, compare: true},
  // Color to use if surfaceImage is unavailable
  color: {type: 'color', value: [255, 255, 255]},
  // Object to decode height data, from (r, g, b) to height in meters
  elevationDecoder: {
    type: 'object',
    value: {
      rScaler: 1,
      gScaler: 0,
      bScaler: 0,
      offset: 0
    }
  },
  // Supply url to local terrain worker bundle. Only required if running offline and cannot access CDN.
  workerUrl: {type: 'string', value: null},
  // Same as SimpleMeshLayer wireframe
  wireframe: false
};

/**
 * state: {
 *   isTiled: True renders TileLayer of many SimpleMeshLayers, false renders one SimpleMeshLayer
 *   terrain: Mesh object. Only defined when isTiled is false.
 * }
 */
export default class TerrainLayer extends CompositeLayer {
  updateState({props, oldProps}) {
    if (props.terrainImage !== oldProps.terrainImage) {
      const isTiled = props.terrainImage.includes('{x}') && props.terrainImage.includes('{y}');
      this.setState({isTiled});
    }

    // Reloading for single terrain mesh
    const shouldReload =
      props.meshMaxError !== oldProps.meshMaxError ||
      props.elevationDecoder !== oldProps.elevationDecoder ||
      props.bounds !== oldProps.bounds;

    if (!this.state.isTiled && shouldReload) {
      const terrain = this.loadTerrain(props);
      this.setState({terrain});
    }
  }

  loadTerrain({terrainImage, bounds, elevationDecoder, meshMaxError, workerUrl}) {
    const options = {
      terrain: {
        bounds,
        meshMaxError,
        elevationDecoder
      }
    };
    if (workerUrl !== null) {
      options.terrain.workerUrl = workerUrl;
    }
    return load(terrainImage, TerrainLoader, options);
  }

  getTiledTerrainData({bbox, x, y, z}) {
    const {terrainImage, elevationDecoder, meshMaxError, workerUrl} = this.props;
    const url = terrainImage
      .replace('{x}', x)
      .replace('{y}', y)
      .replace('{z}', z);

    const viewport = new WebMercatorViewport({
      longitude: (bbox.west + bbox.east) / 2,
      latitude: (bbox.north + bbox.south) / 2,
      zoom: z
    });
    const bottomLeft = viewport.projectFlat([bbox.west, bbox.south]);
    const topRight = viewport.projectFlat([bbox.east, bbox.north]);
    const bounds = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];

    return this.loadTerrain({
      terrainImage: url,
      bounds,
      elevationDecoder,
      meshMaxError,
      workerUrl
    });
  }

  renderSubLayers(props) {
    const {x, y, z} = props.tile;
    const surfaceUrl = props.surfaceImage
      ? props.surfaceImage
          .replace('{x}', x)
          .replace('{y}', y)
          .replace('{z}', z)
      : false;

    return new SimpleMeshLayer({
      id: props.id,
      wireframe: props.wireframe,
      mesh: props.data,
      data: [1],
      texture: surfaceUrl,
      getPolygonOffset: null,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPosition: d => [0, 0, 0],
      getColor: d => props.color
    });
  }

  renderLayers() {
    const {
      color,
      terrainImage,
      surfaceImage,
      wireframe,
      meshMaxError,
      elevationDecoder
    } = this.props;

    if (this.state.isTiled) {
      return new TileLayer(this.props, {
        id: `${this.props.id}-tiles`,
        getTileData: this.getTiledTerrainData.bind(this),
        renderSubLayers: this.renderSubLayers,
        updateTriggers: {
          getTileData: {terrainImage, meshMaxError, elevationDecoder}
        }
      });
    }
    return new SimpleMeshLayer(
      this.getSubLayerProps({
        id: 'mesh'
      }),
      {
        data: [1],
        mesh: this.state.terrain,
        texture: surfaceImage,
        getPosition: d => [0, 0, 0],
        getColor: d => color,
        wireframe
      }
    );
  }
}

TerrainLayer.layerName = 'TerrainLayer';
TerrainLayer.defaultProps = defaultProps;
