// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

import {CompositeLayer, createIterable, log} from '@deck.gl/core';
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';
import PathLayer from '../path-layer/path-layer';
import * as Polygon from '../solid-polygon-layer/polygon';
import {replaceInRange} from '../utils';

const defaultLineColor = [0, 0, 0, 255];
const defaultFillColor = [0, 0, 0, 255];

const defaultProps = {
  stroked: true,
  filled: true,
  extruded: false,
  elevationScale: 1,
  wireframe: false,
  _normalize: true,

  lineWidthUnits: 'meters',
  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,

  getPolygon: {type: 'accessor', value: f => f.polygon},
  // Polygon fill color
  getFillColor: {type: 'accessor', value: defaultFillColor},
  // Point, line and polygon outline color
  getLineColor: {type: 'accessor', value: defaultLineColor},
  // Line and polygon outline accessors
  getLineWidth: {type: 'accessor', value: 1},
  // Polygon extrusion accessor
  getElevation: {type: 'accessor', value: 1000},

  // Optional material for 'lighting' shader module
  material: true
};

export default class PolygonLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      paths: []
    };

    if (this.props.getLineDashArray) {
      log.removed('getLineDashArray', 'PathStyleExtension')();
    }
  }

  updateState({oldProps, props, changeFlags}) {
    const geometryChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon));

    if (geometryChanged && Array.isArray(changeFlags.dataChanged)) {
      const paths = this.state.paths.slice();
      const pathsDiff = changeFlags.dataChanged.map(dataRange =>
        replaceInRange({
          data: paths,
          getIndex: p => p.__source.index,
          dataRange,
          replace: this._getPaths(dataRange)
        })
      );
      this.setState({paths, pathsDiff});
    } else if (geometryChanged) {
      this.setState({
        paths: this._getPaths(),
        pathsDiff: null
      });
    }
  }

  _getPaths(dataRange = {}) {
    const {data, getPolygon, positionFormat, _normalize} = this.props;
    const paths = [];
    const positionSize = positionFormat === 'XY' ? 2 : 3;
    const {startRow, endRow} = dataRange;

    const {iterable, objectInfo} = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      let polygon = getPolygon(object, objectInfo);
      if (_normalize) {
        polygon = Polygon.normalize(polygon, positionSize);
      }
      const {holeIndices} = polygon;
      const positions = polygon.positions || polygon;

      if (holeIndices) {
        // split the positions array into `holeIndices.length + 1` rings
        // holeIndices[-1] falls back to 0
        // holeIndices[holeIndices.length] falls back to positions.length
        for (let i = 0; i <= holeIndices.length; i++) {
          const path = positions.subarray(
            holeIndices[i - 1] || 0,
            holeIndices[i] || positions.length
          );
          paths.push(this.getSubLayerRow({path}, object, objectInfo.index));
        }
      } else {
        paths.push(this.getSubLayerRow({path: positions}, object, objectInfo.index));
      }
    }
    return paths;
  }

  /* eslint-disable complexity */
  renderLayers() {
    // Layer composition props
    const {
      data,
      _dataDiff,
      stroked,
      filled,
      extruded,
      wireframe,
      _normalize,
      elevationScale,
      transitions,
      positionFormat
    } = this.props;

    // Rendering props underlying layer
    const {
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineJointRounded,
      lineMiterLimit,
      lineDashJustified
    } = this.props;

    // Accessor props for underlying layers
    const {
      getFillColor,
      getLineColor,
      getLineWidth,
      getLineDashArray,
      getElevation,
      getPolygon,
      updateTriggers,
      material
    } = this.props;

    const {paths, pathsDiff} = this.state;

    const FillLayer = this.getSubLayerClass('fill', SolidPolygonLayer);
    const StrokeLayer = this.getSubLayerClass('stroke', PathLayer);

    // Filled Polygon Layer
    const polygonLayer =
      this.shouldRenderSubLayer('fill', paths) &&
      new FillLayer(
        {
          _dataDiff,
          extruded,
          elevationScale,

          filled,
          wireframe,
          _normalize,

          getElevation,
          getFillColor,
          getLineColor,

          material,
          transitions
        },
        this.getSubLayerProps({
          id: 'fill',
          updateTriggers: {
            getPolygon: updateTriggers.getPolygon,
            getElevation: updateTriggers.getElevation,
            getFillColor: updateTriggers.getFillColor,
            getLineColor: updateTriggers.getLineColor
          }
        }),
        {
          data,
          positionFormat,
          getPolygon
        }
      );

    // Polygon line layer
    const polygonLineLayer =
      !extruded &&
      stroked &&
      this.shouldRenderSubLayer('stroke', paths) &&
      new StrokeLayer(
        {
          _dataDiff: pathsDiff && (() => pathsDiff),
          widthUnits: lineWidthUnits,
          widthScale: lineWidthScale,
          widthMinPixels: lineWidthMinPixels,
          widthMaxPixels: lineWidthMaxPixels,
          rounded: lineJointRounded,
          miterLimit: lineMiterLimit,
          dashJustified: lineDashJustified,

          // Already normalized
          _pathType: 'loop',

          transitions: transitions && {
            getWidth: transitions.getLineWidth,
            getColor: transitions.getLineColor,
            getPath: transitions.getPolygon
          },

          getColor: this.getSubLayerAccessor(getLineColor),
          getWidth: this.getSubLayerAccessor(getLineWidth),
          getDashArray: this.getSubLayerAccessor(getLineDashArray)
        },
        this.getSubLayerProps({
          id: 'stroke',
          updateTriggers: {
            getWidth: updateTriggers.getLineWidth,
            getColor: updateTriggers.getLineColor,
            getDashArray: updateTriggers.getLineDashArray
          }
        }),
        {
          data: paths,
          positionFormat,
          getPath: x => x.path
        }
      );

    return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonLayer,
      polygonLineLayer,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonLayer
    ];
  }
  /* eslint-enable complexity */
}

PolygonLayer.layerName = 'PolygonLayer';
PolygonLayer.defaultProps = defaultProps;
