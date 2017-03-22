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
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';
import PathLayer from '../path-layer/path-layer';
import * as Polygon from '../solid-polygon-layer/polygon';

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

  getPolygon: f => get(f, 'polygon'),
  // Polygon fill color
  getFillColor: f => get(f, 'fillColor') || defaultFillColor,
  // Point, line and polygon outline color
  getLineColor: f => get(f, 'lineColor') || defaultLineColor,
  // Line and polygon outline accessors
  getLineWidth: f => get(f, 'lineWidth') || 1,
  // Polygon extrusion accessor
  getElevation: f => get(f, 'elevation') || 1000
};

export default class PolygonLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      paths: [],
      onHover: this._onPickSubLayer.bind(this, 'onHover'),
      onClick: this._onPickSubLayer.bind(this, 'onClick')
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged) {
      const {data, getPolygon} = this.props;
      this.state.paths = [];
      data.forEach(object => {
        const complexPolygon = Polygon.normalize(getPolygon(object));
        complexPolygon.forEach(polygon => this.state.paths.push({
          path: polygon,
          object
        }));
      });
    }
  }

  _onPickSubLayer(handler, info) {
    Object.assign(info, {
      layer: this,
      // override object with picked feature
      object: (info.object && info.object.object) || info.object
    });

    return this.props[handler](info);
  }

  renderLayers() {
    const {getFillColor, getLineColor, getLineWidth, getElevation,
      getPolygon, updateTriggers} = this.props;
    const {data, id, stroked, filled, extruded, wireframe} = this.props;
    const {lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels,
      lineJointRounded, lineMiterLimit, fp64} = this.props;
    // base layer props
    const {opacity, pickable, visible, projectionMode} = this.props;
    const {paths, onHover, onClick} = this.state;

    const hasData = data && data.length > 0;

    // Filled Polygon Layer
    const polygonLayer = filled && hasData && new SolidPolygonLayer({
      id: `${id}-fill`,
      data,
      extruded,
      wireframe: false,
      fp64,
      opacity,
      pickable,
      visible,
      projectionMode,
      getPolygon,
      getElevation,
      getColor: getFillColor,
      onHover,
      onClick,
      updateTriggers: {
        getElevation: updateTriggers.getElevation,
        getColor: updateTriggers.getFillColor
      }
    });

    const polygonWireframeLayer = extruded &&
      wireframe &&
      hasData &&
      new SolidPolygonLayer({
        id: `${id}-wireframe`,
        data,
        extruded: true,
        wireframe: true,
        fp64,
        opacity,
        pickable,
        visible,
        projectionMode,
        getPolygon,
        getElevation,
        getColor: getLineColor,
        onHover,
        onClick,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getLineColor
        }
      });

    // Polygon line layer
    const polygonLineLayer = !extruded &&
      stroked &&
      hasData &&
      new PathLayer({
        id: `${id}-stroke`,
        data: paths,
        widthScale: lineWidthScale,
        widthMinPixels: lineWidthMinPixels,
        widthMaxPixels: lineWidthMaxPixels,
        rounded: lineJointRounded,
        miterLimit: lineMiterLimit,
        fp64,
        opacity,
        pickable,
        visible,
        projectionMode,
        getPath: x => x.path,
        getColor: getLineColor,
        getWidth: getLineWidth,
        onHover,
        onClick,
        updateTriggers: {
          getWidth: updateTriggers.getLineWidth,
          getColor: updateTriggers.getLineColor
        }
      });

    return [
      polygonLayer,
      polygonWireframeLayer,
      polygonLineLayer
    ].filter(Boolean);
  }
}

PolygonLayer.layerName = 'PolygonLayer';
PolygonLayer.defaultProps = defaultProps;
