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
import PrimitivePolygonLayer from '../primitive-polygon-layer/polygon-layer';
import PathLayer from '../path-layer/path-layer';

const defaultColor = [0xBD, 0xE2, 0x7A, 0xFF];
const defaultFillColor = [0xBD, 0xE2, 0x7A, 0xFF];

const defaultProps = {
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,
  fp64: false,

  // TODO: Missing props: radiusMinPixels, strokeWidthMinPixels, ...

  // Point, line and polygon outline color
  getColor: f => get(f, 'color') || get(f, 'strokeColor') || defaultColor,
  // Polygon fill color
  getFillColor: f => get(f, 'fillColor') || defaultFillColor,
  // Line and polygon outline accessors
  getStrokeWidth: f => get(f, 'strokeWidth') || 1,
  // Polygon extrusion accessor
  getElevation: f => 1000
};

export default class PolygonLayer extends CompositeLayer {
  renderLayers() {
    const {getColor, getFillColor, getStrokeWidth, getElevation} = this.props;
    const {data, id, stroked, filled, extruded, wireframe} = this.props;

    let {} = this.props;
    const drawPolygons = stroked && data && data.length > 0;
    const fillPolygons = filled && data && data.length > 0;

    // Filled Polygon Layer
    const polygonFillLayer = fillPolygons && new PrimitivePolygonLayer(Object.assign({},
      this.props, {
        id: `${id}-fill`,
        data,
        getElevation,
        getColor: getFillColor,
        extruded,
        wireframe: false,
        updateTriggers: Object.assign({}, this.props.updateTriggers, {
          getColor: this.props.updateTriggers.getFillColor
        })
      }));

    // Polygon outline or wireframe
    let polygonOutlineLayer = null;
    if (drawPolygons && extruded && wireframe) {
      polygonOutlineLayer = new PrimitivePolygonLayer(Object.assign({}, this.props, {
        id: `${id}-wireframe`,
        data,
        getElevation,
        getColor,
        extruded: true,
        wireframe: true,
        updateTriggers: Object.assign({}, this.props.updateTriggers, {
          getColor: this.props.updateTriggers.getFillColor
        })
      }));
    } else if (drawPolygons) {
      polygonOutlineLayer = new PathLayer(Object.assign({}, this.props, {
        id: `${id}-stroke`,
        data,
        getColor,
        getStrokeWidth
      }));
    }

    return [
      polygonFillLayer,
      polygonOutlineLayer
    ].filter(Boolean);
  }
}

PolygonLayer.layerName = 'PolygonLayer';
PolygonLayer.defaultProps = defaultProps;
