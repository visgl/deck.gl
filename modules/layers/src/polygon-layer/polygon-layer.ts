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

import {
  AccessorFunction,
  CompositeLayer,
  CompositeLayerProps,
  createIterable,
  Layer,
  LayersList,
  log,
  UpdateParameters
} from '@deck.gl/core';
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';
import PathLayer from '../path-layer/path-layer';
import * as Polygon from '../solid-polygon-layer/polygon';
import {replaceInRange} from '../utils';
import {FillProps, Polygon3DProps, StrokeProps} from '../types';

/**
 * All properties supported by `PolygonLayer`.
 */
export type PolygonLayerProps<DataT = any> = _PolygonLayerProps<DataT> & CompositeLayerProps<DataT>;

/**
 * Properties added by `PolygonLayer`.
 */
export type _PolygonLayerProps<DataT = any> = FillProps<DataT> &
  StrokeProps<DataT> &
  Polygon3DProps<DataT> & {
    /** Called on each object in the data stream to retrieve its corresponding polygon. */
    getPolygon?: AccessorFunction<DataT, any>;

    /**
     * If `false`, will skip normalizing the coordinates returned by `getPolygon`.
     *
     * **Note**: This prop is experimental
     *
     * @default true
     */
    _normalize?: boolean;

    /**
     * Specifies the winding order of rings in the polygon data.
     *
     * **Note**: This prop is experimental
     *
     * @default 'CW'
     */
    _windingOrder?: 'CW' | 'CCW';

    /** @deprecated */
    lineDashJustified?: boolean;
  };

const defaultLineColor = [0, 0, 0, 255];
const defaultFillColor = [0, 0, 0, 255];

const defaultProps = {
  stroked: true,
  filled: true,
  extruded: false,
  elevationScale: 1,
  wireframe: false,
  _normalize: true,
  _windingOrder: 'CW',

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

export default class PolygonLayer<DataT = any, ExtraProps = {}> extends CompositeLayer<
  Required<_PolygonLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'PolygonLayer';
  static defaultProps = defaultProps;

  initializeState(): void {
    this.state = {
      paths: []
    };

    if (this.props.getLineDashArray) {
      log.removed('getLineDashArray', 'PathStyleExtension')();
    }
  }

  updateState({changeFlags}: UpdateParameters<PolygonLayer>) {
    const geometryChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon));

    if (geometryChanged && Array.isArray(changeFlags.dataChanged)) {
      // @ts-expect-error state is always initialized on instantiated layer
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

  private _getPaths(dataRange: {startRow?: number; endRow?: number} = {}): {path: number[]}[] {
    const {data, getPolygon, positionFormat, _normalize} = this.props;
    const paths: {path: number[]}[] = [];
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
          const path = positions.slice(holeIndices[i - 1] || 0, holeIndices[i] || positions.length);
          paths.push(this.getSubLayerRow({path}, object, objectInfo.index));
        }
      } else {
        paths.push(this.getSubLayerRow({path: positions}, object, objectInfo.index));
      }
    }
    return paths;
  }

  /* eslint-disable complexity */
  renderLayers(): Layer | null | LayersList {
    // Layer composition props
    const {
      data,
      _dataDiff,
      stroked,
      filled,
      extruded,
      wireframe,
      _normalize,
      _windingOrder,
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

    // @ts-expect-error state is always initialized on instantiated layer
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
          _windingOrder,

          getElevation,
          getFillColor,
          getLineColor: extruded && wireframe ? getLineColor : defaultLineColor,

          material,
          transitions
        },
        this.getSubLayerProps({
          id: 'fill',
          updateTriggers: updateTriggers && {
            getPolygon: updateTriggers.getPolygon,
            getElevation: updateTriggers.getElevation,
            getFillColor: updateTriggers.getFillColor,
            // using a legacy API to invalid lineColor attributes
            // if (extruded && wireframe) has changed
            lineColors: extruded && wireframe,
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
          jointRounded: lineJointRounded,
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
          updateTriggers: updateTriggers && {
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
