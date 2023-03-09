// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
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

import GL from '@luma.gl/constants';
import {LineLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {generateContours} from './contour-utils';
import {
  Accessor,
  AccessorFunction,
  Color,
  Layer,
  log,
  Position,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';

import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION, getValueFunc} from '../utils/aggregation-operation-utils';
import {getBoundingBox, getGridParams} from '../utils/grid-aggregation-utils';
import GridAggregationLayer, {GridAggregationLayerProps} from '../grid-aggregation-layer';

const DEFAULT_COLOR = [255, 255, 255, 255];
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_THRESHOLD = 1;

const defaultProps: DefaultProps<ContourLayerProps> = {
  // grid aggregation
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: 1},
  gpuAggregation: true,
  aggregation: 'SUM',

  // contour lines
  contours: {
    type: 'object',
    value: [{threshold: DEFAULT_THRESHOLD}],
    optional: true,
    compare: 3
  },

  zOffset: 0.005
};

const POSITION_ATTRIBUTE_NAME = 'positions';

const DIMENSIONS = {
  data: {
    props: ['cellSize']
  },
  weights: {
    props: ['aggregation'],
    accessors: ['getWeight']
  }
};

/** All properties supported by ContourLayer. */
export type ContourLayerProps<DataT = any> = _ContourLayerProps<DataT> &
  GridAggregationLayerProps<DataT>;

/** Properties added by ContourLayer. */
export type _ContourLayerProps<DataT> = {
  /**
   * Size of each cell in meters.
   * @default 1000
   */
  cellSize?: number;

  /**
   * When set to true, aggregation is performed on GPU, provided other conditions are met.
   * @default true
   */
  gpuAggregation?: boolean;

  /**
   * Defines the type of aggregation operation, valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'.
   * @default 'SUM'
   */
  aggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';

  /**
   * Definition of contours to be drawn.
   * @default [{threshold: 1}]
   */
  contours: {
    /**
     * Isolines: `threshold` value must be a single `Number`, Isolines are generated based on this threshold value.
     *
     * Isobands: `threshold` value must be an Array of two `Number`s. Isobands are generated using `[threshold[0], threshold[1])` as threshold range, i.e area that has values `>= threshold[0]` and `< threshold[1]` are rendered with corresponding color. NOTE: `threshold[0]` is inclusive and `threshold[1]` is not inclusive.
     */
    threshold: number | number[];

    /**
     * RGBA color array to be used to render the contour.
     * @default [255, 255, 255, 255]
     */
    color?: Color;

    /**
     * Applicable for `Isoline`s only, width of the Isoline in pixels.
     * @default 1
     */
    strokeWidth?: number;

    /** Defines z order of the contour. */
    zIndex?: number;
  }[];

  /**
   * A very small z offset that is added for each vertex of a contour (Isoline or Isoband).
   * @default 0.005
   */
  zOffset?: number;

  /**
   * Method called to retrieve the position of each object.
   * @default object => object.position
   */
  getPosition?: AccessorFunction<DataT, Position>;

  /**
   * The weight of each object.
   * @default 1
   */
  getWeight?: Accessor<DataT, number>;
};

/** Aggregate data into iso-lines or iso-bands for a given threshold and cell size. */
export default class ContourLayer<
  DataT = any,
  ExtraPropsT extends {} = {}
> extends GridAggregationLayer<DataT, ExtraPropsT & Required<_ContourLayerProps<DataT>>> {
  static layerName = 'ContourLayer';
  static defaultProps = defaultProps;

  initializeState(): void {
    super.initializeAggregationLayer({
      dimensions: DIMENSIONS
    });
    this.setState({
      contourData: {},
      projectPoints: false,
      weights: {
        count: {
          size: 1,
          operation: AGGREGATION_OPERATION.SUM
        }
      }
    });
    const attributeManager = this.getAttributeManager()!;
    attributeManager.add({
      [POSITION_ATTRIBUTE_NAME]: {
        size: 3,
        accessor: 'getPosition',
        type: GL.DOUBLE,
        fp64: this.use64bitPositions()
      },
      // this attribute is used in gpu aggregation path only
      count: {size: 3, accessor: 'getWeight'}
    });
  }

  updateState(opts: UpdateParameters<this>): void {
    super.updateState(opts);
    let contoursChanged = false;
    const {oldProps, props} = opts;
    const {aggregationDirty} = this.state;

    if (oldProps.contours !== props.contours || oldProps.zOffset !== props.zOffset) {
      contoursChanged = true;
      this._updateThresholdData(opts.props);
    }

    if (this.getNumInstances() > 0 && (aggregationDirty || contoursChanged)) {
      this._generateContours();
    }
  }

  renderLayers(): Layer[] {
    const {contourSegments, contourPolygons} = this.state.contourData;

    const LinesSubLayerClass = this.getSubLayerClass('lines', LineLayer);
    const BandsSubLayerClass = this.getSubLayerClass('bands', SolidPolygonLayer);

    // Contour lines layer
    const lineLayer =
      contourSegments &&
      contourSegments.length > 0 &&
      new LinesSubLayerClass(
        this.getSubLayerProps({
          id: 'lines'
        }),
        {
          data: this.state.contourData.contourSegments,
          getSourcePosition: d => d.start,
          getTargetPosition: d => d.end,
          getColor: d => d.contour.color || DEFAULT_COLOR,
          getWidth: d => d.contour.strokeWidth || DEFAULT_STROKE_WIDTH
        }
      );

    // Contour bands layer
    const bandsLayer =
      contourPolygons &&
      contourPolygons.length > 0 &&
      new BandsSubLayerClass(
        this.getSubLayerProps({
          id: 'bands'
        }),
        {
          data: this.state.contourData.contourPolygons,
          getPolygon: d => d.vertices,
          getFillColor: d => d.contour.color || DEFAULT_COLOR
        }
      );

    return [lineLayer, bandsLayer];
  }

  // Aggregation Overrides

  /* eslint-disable max-statements, complexity */
  updateAggregationState(opts) {
    const {props, oldProps} = opts;
    const {cellSize, coordinateSystem} = props;
    const {viewport} = this.context;
    const cellSizeChanged = oldProps.cellSize !== cellSize;
    let gpuAggregation = props.gpuAggregation;
    if (this.state.gpuAggregation !== props.gpuAggregation) {
      if (gpuAggregation && !GPUGridAggregator.isSupported(this.context.gl)) {
        log.warn('GPU Grid Aggregation not supported, falling back to CPU')();
        gpuAggregation = false;
      }
    }
    const gpuAggregationChanged = gpuAggregation !== this.state.gpuAggregation;
    this.setState({
      gpuAggregation
    });

    const {dimensions} = this.state;
    const positionsChanged = this.isAttributeChanged(POSITION_ATTRIBUTE_NAME);
    const {data, weights} = dimensions;

    let {boundingBox} = this.state;
    if (positionsChanged) {
      boundingBox = getBoundingBox(this.getAttributes(), this.getNumInstances());
      this.setState({boundingBox});
    }
    if (positionsChanged || cellSizeChanged) {
      const {gridOffset, translation, width, height, numCol, numRow} = getGridParams(
        boundingBox,
        cellSize,
        viewport,
        coordinateSystem
      );
      this.allocateResources(numRow, numCol);
      this.setState({
        gridOffset,
        boundingBox,
        translation,
        posOffset: translation.slice(), // Used for CPU aggregation, to offset points
        gridOrigin: [-1 * translation[0], -1 * translation[1]],
        width,
        height,
        numCol,
        numRow
      });
    }

    const aggregationDataDirty =
      positionsChanged ||
      gpuAggregationChanged ||
      this.isAggregationDirty(opts, {
        dimension: data,
        compareAll: gpuAggregation // check for all (including extentions props) when using gpu aggregation
      });
    const aggregationWeightsDirty = this.isAggregationDirty(opts, {
      dimension: weights
    });

    if (aggregationWeightsDirty) {
      this._updateAccessors(opts);
    }
    if (aggregationDataDirty || aggregationWeightsDirty) {
      this._resetResults();
    }
    this.setState({
      aggregationDataDirty,
      aggregationWeightsDirty
    });
  }
  /* eslint-enable max-statements, complexity */

  // Private (Aggregation)

  private _updateAccessors(opts) {
    const {getWeight, aggregation, data} = opts.props;
    const {count} = this.state.weights;
    if (count) {
      count.getWeight = getWeight;
      count.operation = AGGREGATION_OPERATION[aggregation];
    }
    this.setState({getValue: getValueFunc(aggregation, getWeight, {data})});
  }

  private _resetResults() {
    const {count} = this.state.weights;
    if (count) {
      count.aggregationData = null;
    }
  }

  // Private (Contours)

  private _generateContours() {
    const {numCol, numRow, gridOrigin, gridOffset, thresholdData} = this.state;
    const {count} = this.state.weights;
    let {aggregationData} = count;
    if (!aggregationData) {
      aggregationData = count.aggregationBuffer.getData();
      count.aggregationData = aggregationData;
    }

    const {cellWeights} = GPUGridAggregator.getCellData({countsData: aggregationData});
    const contourData = generateContours({
      thresholdData,
      cellWeights,
      gridSize: [numCol, numRow],
      gridOrigin,
      cellSize: [gridOffset.xOffset, gridOffset.yOffset]
    });

    // contourData contains both iso-lines and iso-bands if requested.
    this.setState({contourData});
  }

  private _updateThresholdData(props) {
    const {contours, zOffset} = props;
    const count = contours.length;
    const thresholdData = new Array(count);
    for (let i = 0; i < count; i++) {
      const contour = contours[i];
      thresholdData[i] = {
        contour,
        zIndex: contour.zIndex || i,
        zOffset
      };
    }
    this.setState({thresholdData});
  }
}
