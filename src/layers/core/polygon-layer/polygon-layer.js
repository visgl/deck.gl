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

const defaultColor = [0xBD, 0xE2, 0x7A, 0xFF];
const defaultFillColor = [0xBD, 0xE2, 0x7A, 0xFF];

const defaultProps = {
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,
  fp64: false,

  // TODO: Missing props: radiusMinPixels, strokeWidthMinPixels, ...

  // Polygon fill color
  getFillColor: f => get(f, 'fillColor') || defaultFillColor,
  // Point, line and polygon outline color
  getColor: f => get(f, 'color') || get(f, 'strokeColor') || defaultColor,
  // Line and polygon outline accessors
  getWidth: f => get(f, 'strokeWidth') || 1,
  // Polygon extrusion accessor
  getElevation: f => 1000
};

export default class PolygonLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      paths: [],
      onHover: this._onHoverSubLayer.bind(this),
      onClick: this._onClickSubLayer.bind(this)
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

  _onHoverSubLayer(info) {
    info.object = (info.object && info.object.feature) || info.object;
    this.props.onHover(info);
  }

  _onClickSubLayer(info) {
    info.object = (info.object && info.object.feature) || info.object;
    this.props.onClick(info);
  }

  renderLayers() {
    const {getFillColor, getColor, getWidth, getElevation, updateTriggers} = this.props;
    const {data, id, stroked, filled, extruded, wireframe} = this.props;
    const {paths, onHover, onClick} = this.state;

    const polygon = data && data.length > 0;

    // Filled Polygon Layer
    const polygonFillLayer = filled && polygon && new SolidPolygonLayer(Object.assign({},
      this.props, {
        id: `${id}-fill`,
        data,
        getElevation,
        getColor: getFillColor,
        extruded,
        wireframe: false,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getFillColor
        }
      }));

    // Polygon outline layer
    let polygonOutlineLayer = null;
    if (!extruded && stroked && polygon) {
      polygonOutlineLayer = new PathLayer(Object.assign({}, this.props, {
        id: `${id}-stroke`,
        data: paths,
        getPath: x => x.path,
        getColor,
        getWidth,
        onHover,
        onClick,
        updateTriggers: {
          getWidth: updateTriggers.getWidth,
          getColor: updateTriggers.getColor
        }
      }));
    } else if (extruded && wireframe && polygon) {
      polygonOutlineLayer = new SolidPolygonLayer(Object.assign({},
      this.props, {
        id: `${id}-wireframe`,
        data,
        getElevation,
        getColor: getFillColor,
        extruded,
        wireframe: true,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getFillColor
        }
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
