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

import {Container} from '../../../lib/utils';
import {getGeojsonFeatures, separateAndFlattenGeojsonFeatures} from './geojson';

const defaultPointColor = [0xFF, 0x88, 0x00, 0xFF];
const defaultStrokeColor = [0x33, 0x33, 0x33, 0xFF];
const defaultFillColor = [0xBD, 0xE2, 0x7A, 0xFF];

const defaultProps = {
  drawPoints: false,
  drawLines: true,
  drawPolygons: true,
  fillPolygons: true,
  // extrudePolygons: false,
  // wireframe: false,

  // Point accessors
  getPointColor: f => Container.get(f, 'properties.color') || defaultPointColor,
  getPointSize: f => Container.get(f, 'properties.size') || 5,

  // Line and polygon outline accessors
  getStrokeColor: f => Container.get(f, 'properties.strokeColor') || defaultStrokeColor,
  getStrokeWidth: f => Container.get(f, 'properties.strokeWidth') || 1,

  // Polygon fill accessors
  getFillColor: f => Container.get(f, 'properties.fillColor') || defaultFillColor,

  // Polygon extrusion accessor
  getHeight: f => 1000
};

export default class GeoJsonLayer extends Layer {
  initializeState() {
    this.state = {
      pointFeatures: [],
      lineFeatures: [],
      polygonOutlineFeatures: [],
      polygonFeatures: []
    };
  }

  updateState({changeFlags}) {
    if (changeFlags.dataChanged) {
      const {data} = this.props;
      const features = getGeojsonFeatures(data);

      // Generates separate feature lists to support the various draw/fill props
      // Also "flattens" geojson `Multi*` primitives into multiple single primitives
      // that can be understood by the sub layers
      const {pointFeatures, lineFeatures, polygonOutlineFeatures, polygonFeatures} =
        separateAndFlattenGeojsonFeatures(features);
      this.state = {
        pointFeatures, // props.drawPoints
        lineFeatures, // props.drawLines
        polygonOutlineFeatures, // props.drawPolygons
        polygonFeatures // props.fillPolygons
      };
    }
  }

  _addFeatureToInfo(info, features) {
    let feature = null;
    if (info.index >= 0) {
      feature = this.state.pointFeatures[info.index];
      feature = feature.feature || feature;
    }
    info.feature = feature;
    return info;
  }

  _onHoverPoint(info) {
    this.props.onHover(this._addFeatureToInfo(info, this.state.pointFeatures));
  }

  _onClickPoint(info) {
    this.props.onClick(this._addFeatureToInfo(info, this.state.pointFeatures));
  }

  _onHoverLine(info) {
    this.props.onHover(this._addFeatureToInfo(info, this.state.lineFeatures));
  }

  _onClickLine(info) {
    this.props.onClick(this._addFeatureToInfo(info, this.state.lineFeatures));
  }

  // TODO - add PolygonOutline support

  _onHoverPolygon(info) {
    this.props.onHover(this._addFeatureToInfo(info, this.state.polygonFeatures));
  }

  _onClickPolygon(info) {
    this.props.onClick(this._addFeatureToInfo(info, this.state.polygonFeatures));
  }

  renderLayers() {
    const {pointFeatures, lineFeatures, polygonOutlineFeatures, polygonFeatures} = this.state;
    const {id, getStrokeColor, getStrokeWidth, getFillColor, getHeight} = this.props;
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
      getPolygon: f => Container.get(f, 'geometry.coordinates'),
      getHeight,
      getColor: getFillColor,
      extruded,
      wireframe: false,
      onHover: this._onHoverPolygon,
      onClick: this._onClickPolygon
    }));

    // Polygon outline or wireframe
    let polygonOutlineLayer = null;
    if (drawPolygons && extruded && wireframe) {
      polygonOutlineLayer = new PolygonLayer(Object.assign({}, this.props, {
        id: `${id}-polygon-wireframe`,
        data: polygonFeatures,
        getPolygon: f => Container.get(f, 'geometry.coordinates'),
        getHeight,
        getColor: getFillColor,
        extruded: true,
        wireframe: true,
        onHover: this._onHoverPolygon,
        onClick: this._onClickPolygon
      }));
    } else if (drawPolygons) {
      polygonOutlineLayer = new PathLayer(Object.assign({}, this.props, {
        id: `${id}-polygon-outline`,
        data: polygonFeatures,
        getPaths: f => Container.get(f, 'geometry.coordinates'),
        getColor: getStrokeColor,
        getWidth: getStrokeWidth,
        onHover: this._onHoverPolygon,
        onClick: this._onClickPolygon
      }));
    }

    const lineLayer = drawPolygons && drawLines && new PathLayer(Object.assign({}, this.props, {
      id: `${id}-line-paths`,
      data: lineFeatures,
      getPaths: f => Container.get(f, 'geometry.coordinates'),
      getColor: getStrokeColor,
      getWidth: getStrokeWidth,
      onHover: this._onHoverLine,
      onClick: this._onClickLine
    }));

    const pointLayer = drawPoints && new ScatterplotLayer(Object.assign({}, this.props, {
      id: `${id}-points`,
      data: pointFeatures,
      pickable: false,
      onHover: this._onHoverPoint,
      onClick: this._onClickPoint
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
