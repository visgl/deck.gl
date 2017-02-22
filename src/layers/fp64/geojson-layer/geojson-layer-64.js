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
import {get} from '../../../lib';
import GeoJsonLayer from '../../core/geojson-layer/geojson-layer';
import PathLayer from '../../core/path-layer/path-layer';
// import PolygonLayer64 from '../polygon-layer/polygon-layer-64';
import ScatterplotLayer64 from '../scatterplot-layer/scatterplot-layer-64';
import PolygonLayer from '../../core/polygon-layer/polygon-layer';

function noop() {}

const getCoordinates = f => get(f, 'geometry.coordinates');

export default class GeoJsonLayer64 extends GeoJsonLayer {

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

    // Override user's onHover and onClick props
    const handlers = {
      onHover: this._onHoverSublayer.bind(this),
      onClick: noop
    };

    // Filled Polygon Layer
    const polygonFillLayer = fillPolygons && new PolygonLayer(Object.assign({},
      this.props, handlers, {
        id: `${id}-polygon-fill`,
        data: polygonFeatures,
        getPolygon: getCoordinates,
        getElevation,
        getColor: getFillColor,
        extruded,
        wireframe: false,
        fp64: true,
        updateTriggers: {
          getElevation: this.props.updateTriggers.getElevation,
          getColor: this.props.updateTriggers.getFillColor
        }
      }));

    // Polygon outline or wireframe
    let polygonOutlineLayer = null;
    if (drawPolygons && extruded && wireframe) {
      polygonOutlineLayer = new PolygonLayer(Object.assign({}, this.props, handlers, {
        id: `${id}-polygon-wireframe`,
        data: polygonFeatures,
        getPolygon: getCoordinates,
        getElevation,
        getColor: getStrokeColor,
        extruded: true,
        wireframe: true,
        fp64: true,
        updateTriggers: {
          getColor: this.props.updateTriggers.getStrokeColor
        }
      }));
    } else if (drawPolygons) {
      polygonOutlineLayer = new PathLayer(Object.assign({}, this.props, handlers, {
        id: `${id}-polygon-outline`,
        data: polygonOutlineFeatures,
        getPath: getCoordinates,
        getColor: getStrokeColor,
        getWidth: getStrokeWidth,
        updateTriggers: {
          getColor: this.props.updateTriggers.getStrokeColor,
          getWidth: this.props.updateTriggers.getStrokeWidth
        }
      }));
    }

    const lineLayer = drawLines && new PathLayer(Object.assign({},
      this.props, handlers, {
        id: `${id}-line-paths`,
        data: lineFeatures,
        getPath: getCoordinates,
        getColor: getStrokeColor,
        getWidth: getStrokeWidth,
        updateTriggers: {
          getColor: this.props.updateTriggers.getStrokeColor,
          getWidth: this.props.updateTriggers.getStrokeWidth
        }
      }));

    const pointLayer = drawPoints && new ScatterplotLayer64(Object.assign({},
      this.props, handlers, {
        id: `${id}-points`,
        data: pointFeatures,
        getPosition: getCoordinates,
        getColor: getPointColor,
        getRadius: getPointSize,
        updateTriggers: {
          getColor: this.props.updateTriggers.getPointColor,
          getRadius: this.props.updateTriggers.getPointSize
        }
      }));

    return [
      polygonFillLayer,
      polygonOutlineLayer,
      lineLayer,
      pointLayer
    ].filter(Boolean);
  }
}

GeoJsonLayer64.layerName = 'GeoJsonLayer64';
