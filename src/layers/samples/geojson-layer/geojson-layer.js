// Copyright (c) 2016 Uber Technologies, Inc.
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
import {Layer} from '../../../lib';
import geoJsonToLayers from 'geojson-to-layers';

const DEFAULT_COLOR = [255, 0, 0];

const defaultGetElevation = x => x.elevation || 0;
const defaultGetColor = x => x.color || DEFAULT_COLOR;

const ChoroplethLayer = require('../choropleth-layer').default;
const LineLayer = require('../line-layer').default;
const ScatterplotLayer = require('../scatterplot-layer').default;

const getPosition = coord => [coord[0][0], coord[0][1]];
const getSourcePosition = segment => segment[0];
const getTargetPosition = segment => segment[1];

export default class GeoJsonLayer extends Layer {
  /**
   * @classdesc
   * HexagonLayer
   *
   * @class
   * @param {object} opts
   *
   * @param {number} opts.dotRadius - hexagon radius
   * @param {number} opts.elevation - hexagon height
   *
   * @param {function} opts.onHexagonHovered(index, e) - popup selected index
   * @param {function} opts.onHexagonClicked(index, e) - popup selected index
   */
  constructor({
    id = 'hexagon-layer',
    elevation = 1,
    getElevation = defaultGetElevation,
    getColor = defaultGetColor,
    ...opts
  } = {}) {
    super({
      id,
      elevation,
      getElevation,
      getColor,
      ...opts
    });
  }

  initializeState() {
    this.setState({
      layers: geoJsonToLayers(this.data)
    });
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);

    const {dataChanged} = this.state;

    if (dataChanged) {
      this.layers = geoJsonToLayers(this.data);
    }

  }

  renderSublayers() {
    const {props} = this;

    const layers = [];

    for (const feature of props.data.features) {
      let layer = null;

      const {type} = feature.geometry;
      switch (type) {

      case 'GeometryCollection':
      case 'MultiPolygon':
      case 'MultiLineString':
      case 'Point':
        throw new Error(`GeoJsonLayer: ${type} not implemented`);

      case 'Polygon':
        layer = new ChoroplethLayer({
          ...props,
          id: feature.properties.id,
          data: feature
        });
        break;

      // case 'LineSegment':
      case 'LineString':
        throw new Error(
          'LineString not implemented, use non-standard LineSegments instead');
        // TODO - need to cache following data, otherwise too expensive
        // Create a LineString layer?
        /*
        const {coordinates} = feature.geometry;
        const segments = [];
        for (let i = 0; i < coordinates.length - 2; ++i) {
          segments.push({
            sourcePosition: coordinates[i],
            targetPosition: coordinates[i + 1]
          });
        }
        */

      // NON STANDARD LINE SEGMENTS - remove once LineString is implemented
      case 'LineSegments':
        layer = new LineLayer({
          ...props,
          id: feature.properties.id,
          data: feature.geometry.coordinates,
          getSourcePosition,
          getTargetPosition
        });
        break;

      case 'MultiPoint':
        layer = new ScatterplotLayer({
          ...props,
          id: feature.properties.id,
          data: feature.geometry.coordinates,
          getPosition
        });
        break;

      default:
        throw new Error(`GeoJsonLayer: Unknown shape type ${type}`);
      }

      if (layer) {
        layers.push(layer);
      }
    }

    return layers;
  }
}
