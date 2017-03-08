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
  getColor: f => get(f, 'properties.color') || get(f, 'properties.strokeColor') || defaultColor,
  // Polygon fill color
  getFillColor: f => get(f, 'properties.fillColor') || defaultFillColor,
  // Point radius
  getRadius: f => get(f, 'properties.radius') || get(f, 'properties.size') || 5,
  // Line and polygon outline accessors
  getStrokeWidth: f => get(f, 'properties.strokeWidth') || 1,
  // Polygon extrusion accessor
  getElevation: f => 1000
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
    const {getColor, getFillColor, getRadius, getStrokeWidth, getElevation} = this.props;
    const {id, stroked, filled, extruded, wireframe} = this.props;

    let {} = this.props;
    const drawPoints = pointFeatures && pointFeatures.length > 0;
    const drawLines = lineFeatures && lineFeatures.length > 0;
    const drawPolygons = stroked && polygonOutlineFeatures && polygonOutlineFeatures.length > 0;
    const fillPolygons = filled && polygonFeatures && polygonFeatures.length > 0;

    const onHover = this._onHoverSubLayer.bind(this);
    const onClick = this._onClickSubLayer.bind(this);

    // Filled Polygon Layer
    const polygonFillLayer = fillPolygons && new SolidPolygonLayer(Object.assign({},
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
      polygonOutlineLayer = new SolidPolygonLayer(Object.assign({}, this.props, {
        id: `${id}-polygon-wireframe`,
        data: polygonFeatures,
        getPolygon: getCoordinates,
        getElevation,
        getColor,
        extruded: true,
        wireframe: true,
        onHover,
        onClick,
        updateTriggers: Object.assign({}, this.props.updateTriggers, {
          getColor: this.props.updateTriggers.getFillColor
        })
      }));
    } else if (drawPolygons) {
      polygonOutlineLayer = new PathLayer(Object.assign({}, this.props, {
        id: `${id}-polygon-outline`,
        data: polygonOutlineFeatures,
        getPath: getCoordinates,
        getColor,
        getStrokeWidth,
        onHover,
        onClick
      }));
    }

    const lineLayer = drawLines && new PathLayer(Object.assign({},
      this.props, {
        id: `${id}-line-paths`,
        data: lineFeatures,
        getPath: getCoordinates,
        getColor,
        getStrokeWidth,
        onHover,
        onClick
      }));

    const pointLayer = drawPoints && new ScatterplotLayer(Object.assign({},
      this.props, {
        id: `${id}-points`,
        data: pointFeatures,
        getPosition: getCoordinates,
        getColor,
        getRadius,
        onHover,
        onClick,
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
