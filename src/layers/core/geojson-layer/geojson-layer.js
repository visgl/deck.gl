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
// Use primitive layer to avoid "Composite Composite" layers for now
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';

import {getGeojsonFeatures, separateGeojsonFeatures} from './geojson';

const defaultLineColor = [0x0, 0x0, 0x0, 0xFF];
const defaultFillColor = [0x0, 0x0, 0x0, 0xFF];

const defaultProps = {
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,

  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,
  fp64: false,

  // Line and polygon outline color
  getLineColor: f => get(f, 'properties.lineColor') || defaultLineColor,
  // Point and polygon fill color
  getFillColor: f => get(f, 'properties.fillColor') || defaultFillColor,
  // Point radius
  getRadius: f => get(f, 'properties.radius') || get(f, 'properties.size') || 1,
  // Line and polygon outline accessors
  getLineWidth: f => get(f, 'properties.lineWidth') || 1,
  // Polygon extrusion accessor
  getElevation: f => get(f, 'properties.elevation') || 1000
};

const getCoordinates = f => get(f, 'geometry.coordinates');

export default class GeoJsonLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      features: {}
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged) {
      const {data} = this.props;
      const features = getGeojsonFeatures(data);
      this.state.features = separateGeojsonFeatures(features);
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
    const {features} = this.state;
    const {pointFeatures, lineFeatures, polygonFeatures, polygonOutlineFeatures} = features;
    const {getLineColor, getFillColor, getRadius,
      getLineWidth, getElevation, updateTriggers} = this.props;
    const {id, stroked, filled, extruded, wireframe} = this.props;
    const {lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels,
      lineJointRounded, lineMiterLimit, fp64, opacity} = this.props;

    const drawPoints = pointFeatures && pointFeatures.length > 0;
    const drawLines = lineFeatures && lineFeatures.length > 0;
    const hasPolygonLines = polygonOutlineFeatures && polygonOutlineFeatures.length > 0;
    const hasPolygon = polygonFeatures && polygonFeatures.length > 0;

    const onHover = this._onHoverSubLayer.bind(this);
    const onClick = this._onClickSubLayer.bind(this);

    // Filled Polygon Layer
    const polygonFillLayer = filled &&
      hasPolygon &&
      new SolidPolygonLayer({
        id: `${id}-polygon-fill`,
        data: polygonFeatures,
        extruded,
        wireframe: false,
        fp64,
        opacity,
        getPolygon: getCoordinates,
        getElevation,
        getColor: getFillColor,
        onHover,
        onClick,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getFillColor
        }
      });

    const polygonWireframeLayer = wireframe &&
      extruded &&
      hasPolygon &&
      new SolidPolygonLayer({
        id: `${id}-polygon-wireframe`,
        data: polygonFeatures,
        extruded,
        wireframe: true,
        fp64,
        opacity,
        getPolygon: getCoordinates,
        getElevation,
        getColor: getLineColor,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getLineColor
        },
        onHover,
        onClick
      });

    const polygonLineLayer = !extruded &&
      stroked &&
      hasPolygonLines &&
      new PathLayer({
        id: `${id}-polygon-outline`,
        data: polygonOutlineFeatures,
        widthScale: lineWidthScale,
        widthMinPixels: lineWidthMinPixels,
        widthMaxPixels: lineWidthMaxPixels,
        rounded: lineJointRounded,
        miterLimit: lineMiterLimit,
        fp64,
        opacity,
        getPath: getCoordinates,
        getColor: getLineColor,
        getWidth: getLineWidth,
        onHover,
        onClick,
        updateTriggers: {
          getColor: updateTriggers.getLineColor,
          getWidth: updateTriggers.getLineWidth
        }
      });

    const pathLayer = drawLines && new PathLayer({
      id: `${id}-line-paths`,
      data: lineFeatures,
      widthScale: lineWidthScale,
      widthMinPixels: lineWidthMinPixels,
      widthMaxPixels: lineWidthMaxPixels,
      rounded: lineJointRounded,
      miterLimit: lineMiterLimit,
      fp64,
      opacity,
      getPath: getCoordinates,
      getColor: getLineColor,
      getWidth: getLineWidth,
      onHover,
      onClick,
      updateTriggers: {
        getColor: updateTriggers.getLineColor,
        getWidth: updateTriggers.getLineWidth
      }
    });

    const pointLayer = drawPoints && new ScatterplotLayer({
      id: `${id}-points`,
      data: pointFeatures,
      fp64,
      opacity,
      getPosition: getCoordinates,
      getColor: getFillColor,
      getRadius,
      onHover,
      onClick,
      updateTriggers: {
        getColor: updateTriggers.getFillColor,
        getRadius: updateTriggers.getRadius
      }
    });

    return [
      polygonFillLayer,
      polygonWireframeLayer,
      polygonLineLayer,
      pathLayer,
      pointLayer
    ].filter(Boolean);
  }
}

GeoJsonLayer.layerName = 'GeoJsonLayer';
GeoJsonLayer.defaultProps = defaultProps;
