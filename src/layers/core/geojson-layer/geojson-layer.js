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
import ScatterplotLayer from '../scatterplot-layer';
import PathLayer from '../path-layer/path-layer';
import PolygonLayer from '../polygon-layer/polygon-layer';
import flatten from 'lodash.flatten';

import {Container, getGeojsonFeatures} from '../../../lib/utils';

const noop = () => {};

const defaultProps = {
  pointColor: '#FF8800',
  pointSize: 5,
  pointOpacity: 1,

  strokeColor: '#333333',
  strokeWidth: 1,
  strokeOpacity: 1,

  fillColor: '#BDE27A',
  fillOpacity: 1,

  getPointColor: f => f.properties && f.properties.color,
  getPointSize: f => f.properties && f.properties.size,
  getPointOpacity: f => f.properties && f.properties.opacity,

  getStrokeColor: f => f.properties && f.properties.strokeColor,
  getStrokeWidth: f => (f.properties && f.properties.strokeWidth) || 1,
  getStrokeOpacity: f => f.properties && f.properties.strokeOpacity,

  getFillColor: f => f.properties && f.properties.fillColor,
  getFillOpacity: f => f.properties && f.properties.fillOpacity,

  onHover: noop,
  onClick: noop
};

export default class GeoJsonLayer extends Layer {
  constructor(props) {
    const data = (props.data && props.data.features) || props.data || [];
    super(Object.assign({}, defaultProps, props, {data}));
  }

  // Must be defined
  initializeState() {
    this.state = {
      subLayers: null
    };
  }

  updateState({changeFlags}) {
    if (changeFlags.dataChanged) {
      this.state.subLayers = this._extractSublayers();
    }
  }

  _extractSublayers() {
    const {data} = this.props;
    const features = getGeojsonFeatures(data);

    const pointFeatures = [];
    const lineFeatures = [];
    const polygonFeatures = [];
    Container.forEach(features, feature => {
      const type = Container.get(feature, 'geometry.type');
      switch (type) {
      case 'Point':
      case 'MultiPoint':
        pointFeatures.push(feature);
        break;
      case 'LineString':
      case 'MultiLineString':
        lineFeatures.push(feature);
        break;
      case 'Polygon':
      case 'MultiPolygon':
        lineFeatures.push(feature);
        polygonFeatures.push(feature);
        break;
      default:
        throw new Error(`GeoJsonLayer: ${type} not supported.`);
      }
    });

    return {
      pointLayerData: this._extractPoints(pointFeatures),
      // pathLayerData: lineFeatures,
      polygonLayerData: polygonFeatures
    };
  }

  _extractPoints(pointFeatures) {
    const {pointColor, pointSize, getPointColor, getPointSize} = this.props;
    const points = [];

    pointFeatures.forEach(feature => {
      const {coordinates, type} = feature.geometry;
      (type === 'Point' ? [coordinates] : coordinates).forEach(coord => {
        points.push({
          position: [Number(coord[0]), Number(coord[1]), 0],
          color: getPointColor(feature) || pointColor,
          radius: getPointSize(feature) || pointSize
        });
      });
    });

    return points;
  }

  _extractPaths(feature) {
    const {coordinates, type} = feature.geometry;

    let paths = [];

    switch (type) {
    case 'LineString':
      paths = [coordinates];
      break;
    case 'Polygon':
    case 'MultiLineString':
    case 'LineSegments':
      paths = coordinates;
      break;
    case 'MultiPolygon':
      paths = flatten(coordinates);
      break;
    default:
      break;
    }

    return paths.map(
      path => path.map(
        coordinate => [coordinate[0], coordinate[1], coordinate[2] || 0]
      )
    );
  }

  getFeaturePolygons(feature) {
    const type = Container.get(feature, 'geometry.type');
    const coordinates = Container.get(feature, 'geometry.coordinates');
    switch (type) {
    case 'MultiPolygon':
      return coordinates;
    case 'Polygon':
      return [coordinates];
    default:
      return [];
    }
  }

  renderLayers() {
    const {
      id,
      getStrokeColor, getStrokeWidth, getStrokeOpacity,
      getFillColor, getFillOpacity,
      onHover, onClick
    } = this.props;

    const {subLayers: {pointLayerData, pathLayerData, polygonLayerData}} = this.state;

    const pointLayer = pointLayerData && pointLayerData.length &&
      new ScatterplotLayer(Object.assign({}, this.props, {
        id: `${id}-point-sublayer`,
        data: pointLayerData,
        pickable: false,
        onHover,
        onClick
      }));

    const pathLayer = pathLayerData &&
      new PathLayer(Object.assign({}, this.props, {
        id: `${id}-path-sublayer`,
        data: pathLayerData,
        getPaths: this._extractPaths,
        getColor: getStrokeColor,
        getWidth: getStrokeWidth,
        getOpacity: getStrokeOpacity,
        pickable: false,
        onHover,
        onClick
      }));

    const polygonLayer = polygonLayerData &&
      new PolygonLayer(Object.assign({}, this.props, {
        id: `${id}-polygon-sublayer`,
        data: polygonLayerData,
        getPolygons: this.getFeaturePolygons,
        getColor: getFillColor,
        getOpacity: getFillOpacity,
        pickable: false,
        onHover,
        onClick
      }));

    return [polygonLayer, pathLayer, pointLayer].filter(Boolean);
  }
}
GeoJsonLayer.layerName = 'GeoJsonLayer';
