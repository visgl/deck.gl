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

import {CompositeLayer, get} from '../../../lib';
import ScatterplotLayer from '../scatterplot-layer/scatterplot-layer';
import PathLayer from '../path-layer/path-layer';
import PolygonLayer from '../polygon-layer/polygon-layer';

import {getGeojsonFeatures, separateGeojsonFeatures} from './geojson';

const defaultPointColor = [0xFF, 0x88, 0x00, 0xFF];
const defaultStrokeColor = [0x33, 0x33, 0x33, 0xFF];
const defaultFillColor = [0xBD, 0xE2, 0x7A, 0xFF];

const defaultProps = {
  drawPoints: true,
  drawLines: true,
  drawPolygons: true,
  fillPolygons: true,
  // extrudePolygons: false,
  // wireframe: false,

  // Point accessors
  getPointColor: f => get(f, 'properties.color') || defaultPointColor,
  getPointSize: f => get(f, 'properties.size') || 5,

  // Line and polygon outline accessors
  getStrokeColor: f => get(f, 'properties.strokeColor') || defaultStrokeColor,
  getStrokeWidth: f => get(f, 'properties.strokeWidth') || 1,

  // Polygon fill accessors
  getFillColor: f => get(f, 'properties.fillColor') || defaultFillColor,

  // Polygon extrusion accessor
  getElevation: f => 1000,
  fp64: false
};

const getCoordinates = f => get(f, 'geometry.coordinates');

export default class GeoJsonLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      subLayers: null
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged) {
      const {data} = this.props;
      const features = getGeojsonFeatures(data);
      this.state.subLayers = separateGeojsonFeatures(features);
    }
  }

  _onHoverSubLayer(info) {
    info.object = (info.object && info.object.feature) || info.object;
    this.props.onHover(info);
  }

  _onClickSubLayer(info) {
    info.object = (info.object && info.object.feature) || info.object;
    this.props.onClick(info);
  }

  renderLayers() {
    const {subLayers: {pointFeatures, lineFeatures, polygonFeatures,
      polygonOutlineFeatures}} = this.state;
    const {id, getPointColor, getPointSize, getStrokeColor, getStrokeWidth,
      getFillColor, getElevation} = this.props;
    const {extruded, wireframe} = this.props;

    let {drawPoints, drawLines, drawPolygons, fillPolygons} = this.props;
    drawPoints = drawPoints && pointFeatures && pointFeatures.length > 0;
    drawLines = drawLines && lineFeatures && lineFeatures.length > 0;
    drawPolygons = drawPolygons && polygonOutlineFeatures && polygonOutlineFeatures.length > 0;
    fillPolygons = fillPolygons && polygonFeatures && polygonFeatures.length > 0;

    const onHover = this._onHoverSubLayer.bind(this);
    const onClick = this._onClickSubLayer.bind(this);

    // Filled Polygon Layer
    const polygonFillLayer = fillPolygons && new PolygonLayer(Object.assign({},
      this.props, {
        id: `${id}-polygon-fill`,
        data: polygonFeatures,
        getPolygon: getCoordinates,
        getElevation,
        getColor: getFillColor,
        extruded,
        wireframe: false,
        onHover,
        onClick,
        updateTriggers: {
          getElevation: this.props.updateTriggers.getElevation,
          getColor: this.props.updateTriggers.getFillColor
        }
      }));

    // Polygon outline or wireframe
    let polygonOutlineLayer = null;
    if (drawPolygons && extruded && wireframe) {
      polygonOutlineLayer = new PolygonLayer(Object.assign({}, this.props, {
        id: `${id}-polygon-wireframe`,
        data: polygonFeatures,
        getPolygon: getCoordinates,
        getElevation,
        getColor: getStrokeColor,
        extruded: true,
        wireframe: true,
        onHover,
        onClick,
        updateTriggers: {
          getColor: this.props.updateTriggers.getStrokeColor
        }
      }));
    } else if (drawPolygons) {
      polygonOutlineLayer = new PathLayer(Object.assign({}, this.props, {
        id: `${id}-polygon-outline`,
        data: polygonOutlineFeatures,
        getPath: getCoordinates,
        getColor: getStrokeColor,
        getStrokeWidth,
        onHover,
        onClick,
        updateTriggers: {
          getColor: this.props.updateTriggers.getStrokeColor,
          getStrokeWidth: this.props.updateTriggers.getStrokeWidth
        }
      }));
    }

    const lineLayer = drawLines && new PathLayer(Object.assign({},
      this.props, {
        id: `${id}-line-paths`,
        data: lineFeatures,
        getPath: getCoordinates,
        getColor: getStrokeColor,
        getStrokeWidth,
        onHover,
        onClick,
        updateTriggers: {
          getColor: this.props.updateTriggers.getStrokeColor,
          getStrokeWidth: this.props.updateTriggers.getStrokeWidth
        }
      }));

    const pointLayer = drawPoints && new ScatterplotLayer(Object.assign({},
      this.props, {
        id: `${id}-points`,
        data: pointFeatures,
        getPosition: getCoordinates,
        getColor: getPointColor,
        getRadius: getPointSize,
        onHover,
        onClick,
        updateTriggers: {
          getColor: this.props.updateTriggers.getPointColor,
          getRadius: this.props.updateTriggers.getPointSize
        },
        fp64: this.props.fp64
      }));

    return [
      polygonFillLayer,
      polygonOutlineLayer,
      lineLayer,
      pointLayer
    ].filter(Boolean);
  }
}

GeoJsonLayer.layerName = 'GeoJsonLayer';
GeoJsonLayer.defaultProps = defaultProps;
