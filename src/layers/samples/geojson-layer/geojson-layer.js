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
import ChoroplethLayer from '../../core/choropleth-layer';
// import LineLayer from '../../core/line-layer';
// import ScatterplotLayer from '../../core/scatterplot-layer';

const DEFAULT_COLOR = [255, 0, 0];

const defaultGetElevation = x => x.elevation || 0;
const defaultGetColor = x => x.properties.color || DEFAULT_COLOR;

// const getPosition = coord => [coord[0][0], coord[0][1]];
// const getSourcePosition = segment => segment[0];
// const getTargetPosition = segment => segment[1];

export default class GeoJsonLayer extends Layer {
  /**
   * @classdesc
   * GeoJsonLayer
   *
   * @class
   * @param {object} opts
   * @param {number} opts.elevation - hexagon height
   */
  constructor({
    elevation = 1,
    getElevation = defaultGetElevation,
    getColor = defaultGetColor,
    data = [],
    ...opts
  } = {}) {
    // Extract features array
    data = (data && data.features) || data || [];
    super({
      elevation,
      getElevation,
      getColor,
      data,
      ...opts
    });
  }

  initializeState() {
    this._breakGeoJsonIntoSublayerProps();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);
    if (this.state.dataChanged) {
      this._breakGeoJsonIntoSublayerProps();
    }
  }

  _breakGeoJsonIntoSublayerProps() {
    // TODO
    // Prepares sublayer data elements when GeoJson changes
    // So that rerendering the SubLayers becomes trivial
    const features = [];

    let count = 0;
    for (const feature of this.props.data) {
      count++;

      const {type} = feature.geometry;
      switch (type) {

      case 'GeometryCollection':
      case 'MultiPolygon':
      case 'MultiLineString':
      case 'Point':
        throw new Error(`GeoJsonLayer: ${type} not implemented`);

      case 'Polygon':
        feature.properties.color = [
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255
        ];
        features.push({type: 'FeatureCollection', features: [feature]});
        break;

      // case 'LineSegment':
      case 'LineString':
        throw new Error(
          'LineString not implemented, use non-standard LineSegments instead');

      // NON STANDARD LINE SEGMENTS - remove once LineString is implemented
      case 'LineSegments':
        // layer = new LineLayer({
        //   ...props,
        //   id: feature.properties.id,
        //   data: feature.geometry.coordinates,
        //   getSourcePosition,
        //   getTargetPosition
        // });
        break;

      case 'MultiPoint':
        // layer = new ScatterplotLayer({
        //   ...props,
        //   id: feature.properties.id,
        //   data: feature.geometry.coordinates,
        //   getPosition
        // });
        break;

      default:
        throw new Error(`GeoJsonLayer: Unknown shape type ${type}`);
      }
    }

    this.setState({features});
  }

  renderLayers() {
    const {props} = this;

    let count = 0;
    const layers = [];
    for (const featureCollection of this.state.features) {
      count++;
      const id = featureCollection.features[0].properties.ID;
      layers.push(
        new ChoroplethLayer({
          ...props,
          id: `choropleth-${count}-${id}`,
          data: featureCollection
        })
      );
    }
    return layers;
  }
}
