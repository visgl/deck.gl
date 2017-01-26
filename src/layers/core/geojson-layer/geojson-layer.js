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

import {get} from '../../../lib/utils';
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
  getHeight: f => 1000
};

const getCoordinates = f => get(f, 'geometry.coordinates');

export default class GeoJsonLayer extends Layer {
  initializeState() {
    this.state = {
      subLayers: null,
      hoverInfos: {},
      clickInfos: {}
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged) {
      const {data} = this.props;
      const features = getGeojsonFeatures(data);
      this.state.subLayers = separateGeojsonFeatures(features);
    }
    if (oldProps.onHover !== props.onHover) {
      this.state.onHover = props.onHover;
      this.props.onHover = this._onHover.bind(this);
    }
    if (oldProps.onClick !== props.onClick) {
      this.state.onClick = props.onClick;
      this.props.onClick = this._onClick.bind(this);
    }
  }

  _getPickingInfo(infos, defaultInfo) {
    const info = Object.values(infos).find(i => i.index >= 0) || defaultInfo;
    info.layer = this;
    info.feature = info.object ? (info.object.feature || info.object) : undefined;
    return info;
  }

  _onHover(info) {
    if (info.layer === this) {
      info = this._getPickingInfo(this.state.hoverInfos, info);
      this.state.onHover(info);
      this.state.hoverInfos = {};
    } else {
      this.state.hoverInfos[info.layer.id] = info;
    }
  }

  _onClick(info) {
    if (info.layer === this) {
      info = this._getPickingInfo(this.state.clickInfos, info);
      this.state.onClick(info);
      this.state.clickInfos = {};
    } else {
      this.state.clickInfos[info.layer.id] = info;
    }
  }

  renderLayers() {
    const {subLayers: {pointFeatures, lineFeatures, polygonFeatures,
      polygonOutlineFeatures}} = this.state;
    const {id, getPointColor, getPointSize, getStrokeColor, getStrokeWidth,
      getFillColor, getHeight} = this.props;
    const {extruded, wireframe} = this.props;

    let {drawPoints, drawLines, drawPolygons, fillPolygons} = this.props;
    drawPoints = drawPoints && pointFeatures && pointFeatures.length > 0;
    drawLines = drawLines && lineFeatures && lineFeatures.length > 0;
    drawPolygons = drawPolygons && polygonOutlineFeatures && polygonOutlineFeatures.length > 0;
    fillPolygons = fillPolygons && polygonFeatures && polygonFeatures.length > 0;

    // Filled Polygon Layer
    const polygonFillLayer = fillPolygons && new PolygonLayer(Object.assign({}, this.props, {
      id: `${id}-polygon-fill`,
      data: polygonFeatures,
      getPolygon: getCoordinates,
      getHeight,
      getColor: getFillColor,
      extruded,
      wireframe: false
    }));

    // Polygon outline or wireframe
    let polygonOutlineLayer = null;
    if (drawPolygons && extruded && wireframe) {
      polygonOutlineLayer = new PolygonLayer(Object.assign({}, this.props, {
        id: `${id}-polygon-wireframe`,
        data: polygonFeatures,
        getPolygon: getCoordinates,
        getHeight,
        getColor: getStrokeColor,
        extruded: true,
        wireframe: true
      }));
    } else if (drawPolygons) {
      polygonOutlineLayer = new PathLayer(Object.assign({}, this.props, {
        id: `${id}-polygon-outline`,
        data: polygonOutlineFeatures,
        getPath: getCoordinates,
        getColor: getStrokeColor,
        getWidth: getStrokeWidth
      }));
    }

    const lineLayer = drawLines && new PathLayer(Object.assign({}, this.props, {
      id: `${id}-line-paths`,
      data: lineFeatures,
      getPath: getCoordinates,
      getColor: getStrokeColor,
      getWidth: getStrokeWidth
    }));

    const pointLayer = drawPoints && new ScatterplotLayer(Object.assign({}, this.props, {
      id: `${id}-points`,
      data: pointFeatures,
      getPosition: getCoordinates,
      getColor: getPointColor,
      getRadius: getPointSize
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
