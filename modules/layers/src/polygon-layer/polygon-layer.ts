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
  Accessor,
  AccessorFunction,
  Color,
  CompositeLayer,
  CompositeLayerProps,
  createIterable,
  Layer,
  LayerDataSource,
  LayersList,
  log,
  Unit,
  Material,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';
import PathLayer from '../path-layer/path-layer';
import * as Polygon from '../solid-polygon-layer/polygon';
import {replaceInRange} from '../utils';

/**
 * All properties supported by `PolygonLayer`.
 */
export type PolygonLayerProps<DataT = any> = _PolygonLayerProps<DataT> & CompositeLayerProps;

/**
 * Properties added by `PolygonLayer`.
 */
type _PolygonLayerProps<DataT = any> = {
  data: LayerDataSource<DataT>;
  /**
   * Whether to draw an outline around the polygon (solid fill).
   *
   * Note that both the outer polygon as well the outlines of any holes will be drawn.
   *
   * @default true
   */
  stroked?: boolean;

  /**
   * Whether to draw a filled polygon (solid fill).
   *
   * Note that only the area between the outer polygon and any holes will be filled.
   *
   * @default true
   */
  filled?: boolean;

  /**
   * Whether to extrude the polygons.
   *
   * Based on the elevations provided by the `getElevation` accessor.
   *
   * If set to `false`, all polygons will be flat, this generates less geometry and is faster
   * than simply returning 0 from getElevation.
   *
   * @default false
   */
  extruded?: boolean;

  /**
   * Elevation multiplier.
   *
   * The final elevation is calculated by `elevationScale * getElevation(d)`.
   * `elevationScale` is a handy property to scale all elevation without updating the data.
   *
   * @default 1
   */
  elevationScale?: number;

  /**
   * Whether to generate a line wireframe of the hexagon.
   *
   * The outline will have "horizontal" lines closing the top and bottom polygons and a vertical
   * line (a "strut") for each vertex on the polygon.
   *
   * @default false
   */
  wireframe?: boolean;

  /**
   * The units of the line width, one of `meters`, `common`, and `pixels`.
   *
   * @default 'meters'
   * @see Unit.
   */
  lineWidthUnits?: Unit;

  /**
   * The line width multiplier that multiplied to all outlines of `Polygon` and `MultiPolygon`
   * features if the stroked attribute is true.
   *
   * @default 1
   */
  lineWidthScale?: number;

  /**
   * The minimum line width in pixels.
   *
   * @default 0
   */
  lineWidthMinPixels?: number;

  /**
   * The maximum line width in pixels
   *
   * @default Number.MAX_SAFE_INTEGER
   */
  lineWidthMaxPixels?: number;

  /**
   * Type of joint. If `true`, draw round joints. Otherwise draw miter joints.
   *
   * @default false
   */
  lineJointRounded?: boolean;

  /**
   * The maximum extent of a joint in ratio to the stroke width.
   *
   * Only works if `lineJointRounded` is false.
   *
   * @default 4
   */
  lineMiterLimit?: number;

  lineDashJustified?: boolean;

  /** Called on each object in the data stream to retrieve its corresponding polygon. */
  getPolygon?: AccessorFunction<DataT, any>;

  /**
   * Fill collor value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getFillColor?: Accessor<DataT, Color>;

  /**
   * Line color value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getLineColor?: Accessor<DataT, Color>;

  /**
   * Line width value or accessor.
   *
   * @default [0, 0, 0, 255]
   */
  getLineWidth?: Accessor<DataT, number>;

  /**
   * Elevation valur or accessor.
   *
   * Only used if `extruded: true`.
   *
   * @default 1000
   */
  getElevation?: Accessor<DataT, number>;

  /**
   * This property has been moved to `PathStyleExtension`.
   *
   * @deprecated
   */
  getLineDashArray?: Accessor<DataT, number> | null;

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

  /**
   * Material settings for lighting effect. Applies if `extruded: true`.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;
};

const defaultLineColor: [number, number, number, number] = [0, 0, 0, 255];
const defaultFillColor: [number, number, number, number] = [0, 0, 0, 255];

const defaultProps: DefaultProps<PolygonLayerProps> = {
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

/** A composite layer that renders filled, stroked and/or extruded polygons. */
export default class PolygonLayer<DataT = any, ExtraProps extends {} = {}> extends CompositeLayer<
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

  updateState({changeFlags}: UpdateParameters<this>) {
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
