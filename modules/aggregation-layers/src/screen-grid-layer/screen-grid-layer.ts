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
  Color,
  GetPickingInfoParams,
  Layer,
  LayerContext,
  LayersList,
  log,
  PickingInfo,
  Position,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import type {Texture2D} from '@luma.gl/core';
import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION, getValueFunc} from '../utils/aggregation-operation-utils';
import ScreenGridCellLayer from './screen-grid-cell-layer';
import GridAggregationLayer, {GridAggregationLayerProps} from '../grid-aggregation-layer';
import {getFloatTexture} from '../utils/resource-utils.js';

const defaultProps: DefaultProps<ScreenGridLayerProps> = {
  ...ScreenGridCellLayer.defaultProps,
  getPosition: {type: 'accessor', value: d => d.position},
  getWeight: {type: 'accessor', value: 1},

  gpuAggregation: true,
  aggregation: 'SUM'
};

const POSITION_ATTRIBUTE_NAME = 'positions';
const DIMENSIONS = {
  data: {
    props: ['cellSizePixels']
  },
  weights: {
    props: ['aggregation'],
    accessors: ['getWeight']
  }
};

/** All properties supported by ScreenGridLayer. */
export type ScreenGridLayerProps<DataT = any> = _ScreenGridLayerProps<DataT> &
  GridAggregationLayerProps<DataT>;

/** Properties added by ScreenGridLayer. */
export type _ScreenGridLayerProps<DataT> = {
  /**
   * Unit width/height of the bins.
   * @default 100
   */
  cellSizePixels?: number;

  /**
   * Cell margin size in pixels.
   * @default 2
   */
  cellMarginPixels?: number;

  /**
   * Expressed as an rgba array, minimal color that could be rendered by a tile.
   * @default [0, 0, 0, 255]
   * @deprecated Deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.
   */
  minColor?: Color | null;

  /**
   * Expressed as an rgba array, maximal color that could be rendered by a tile.
   * @default [0, 255, 0, 255]
   * @deprecated Deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.
   */
  maxColor?: Color | null;

  /**
   * Color scale input domain. The color scale maps continues numeric domain into discrete color range.
   * @default [1, max(weight)]
   */
  colorDomain?: [number, number] | null;

  /**
   * Specified as an array of colors [color1, color2, ...].
   *
   * @default `6-class YlOrRd` - [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6)
   */
  colorRange?: Color[];

  /**
   * Method called to retrieve the position of each object.
   *
   * @default d => d.position
   */
  getPosition?: Accessor<DataT, Position>;

  /**
   * The weight of each object.
   *
   * @default 1
   */
  getWeight?: Accessor<DataT, number>;

  /**
   * Perform aggregation is performed on GPU.
   *
   * NOTE: GPU Aggregation requires WebGL2 support by the browser.
   * When `gpuAggregation` is set to true and browser doesn't support WebGL2, aggregation falls back to CPU.
   *
   * @default true
   */
  gpuAggregation?: boolean;

  /**
   * Defines the type of aggregation operation
   *
   * V valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'.
   *
   * @default 'SUM'
   */
  aggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';
};

/** Aggregates data into histogram bins and renders them as a grid. */
export default class ScreenGridLayer<
  DataT = any,
  ExtraProps extends {} = {}
> extends GridAggregationLayer<DataT, ExtraProps & Required<_ScreenGridLayerProps<DataT>>> {
  static layerName = 'ScreenGridLayer';
  static defaultProps = defaultProps;

  state!: GridAggregationLayer<DataT>['state'] & {
    supported: boolean;
    gpuGridAggregator?: any;
    gpuAggregation?: any;
    weights?: any;
    maxTexture?: Texture2D;
  };

  initializeState() {
    const {gl} = this.context;
    if (!ScreenGridCellLayer.isSupported(gl)) {
      // max aggregated value is sampled from a float texture
      this.setState({supported: false});
      log.error(`ScreenGridLayer: ${this.id} is not supported on this browser`)();
      return;
    }
    super.initializeAggregationLayer({
      dimensions: DIMENSIONS,
      // @ts-expect-error
      getCellSize: props => props.cellSizePixels // TODO
    });
    const weights = {
      count: {
        size: 1,
        operation: AGGREGATION_OPERATION.SUM,
        needMax: true,
        maxTexture: getFloatTexture(gl, {id: `${this.id}-max-texture`})
      }
    };
    this.setState({
      supported: true,
      projectPoints: true, // aggregation in screen space
      weights,
      subLayerData: {attributes: {}},
      maxTexture: weights.count.maxTexture,
      positionAttributeName: 'positions',
      posOffset: [0, 0],
      translation: [1, -1]
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

  shouldUpdateState({changeFlags}: UpdateParameters<this>) {
    return this.state.supported && changeFlags.somethingChanged;
  }

  updateState(opts: UpdateParameters<this>) {
    super.updateState(opts);
  }

  renderLayers(): LayersList | Layer {
    if (!this.state.supported) {
      return [];
    }
    const {maxTexture, numRow, numCol, weights} = this.state;
    const {updateTriggers} = this.props;
    const {aggregationBuffer} = weights.count;
    const CellLayerClass = this.getSubLayerClass('cells', ScreenGridCellLayer);

    return new CellLayerClass(
      this.props,
      this.getSubLayerProps({
        id: 'cell-layer',
        updateTriggers
      }),
      {
        data: {attributes: {instanceCounts: aggregationBuffer}},
        maxTexture,
        numInstances: numRow * numCol
      }
    );
  }

  finalizeState(context: LayerContext): void {
    super.finalizeState(context);

    const {aggregationBuffer, maxBuffer, maxTexture} = this.state;

    aggregationBuffer?.delete();
    maxBuffer?.delete();
    maxTexture?.delete();
  }

  getPickingInfo({info}: GetPickingInfoParams): PickingInfo {
    const {index} = info;
    if (index >= 0) {
      const {gpuGridAggregator, gpuAggregation, weights} = this.state;
      // Get count aggregation results
      const aggregationResults = gpuAggregation
        ? gpuGridAggregator.getData('count')
        : weights.count;

      // Each instance (one cell) is aggregated into single pixel,
      // Get current instance's aggregation details.
      info.object = GPUGridAggregator.getAggregationData({
        pixelIndex: index,
        ...aggregationResults
      });
    }

    return info;
  }

  // Aggregation Overrides

  updateResults({aggregationData, maxData}) {
    const {count} = this.state.weights;
    count.aggregationData = aggregationData;
    count.aggregationBuffer.setData({data: aggregationData});
    count.maxData = maxData;
    count.maxTexture.setImageData({data: maxData});
  }

  /* eslint-disable complexity, max-statements */
  updateAggregationState(opts) {
    const cellSize = opts.props.cellSizePixels;
    const cellSizeChanged = opts.oldProps.cellSizePixels !== cellSize;
    const {viewportChanged} = opts.changeFlags;
    let gpuAggregation = opts.props.gpuAggregation;
    if (this.state.gpuAggregation !== opts.props.gpuAggregation) {
      if (gpuAggregation && !GPUGridAggregator.isSupported(this.context.gl)) {
        log.warn('GPU Grid Aggregation not supported, falling back to CPU')();
        gpuAggregation = false;
      }
    }
    const gpuAggregationChanged = gpuAggregation !== this.state.gpuAggregation;
    this.setState({
      gpuAggregation
    });

    const positionsChanged = this.isAttributeChanged(POSITION_ATTRIBUTE_NAME);

    const {dimensions} = this.state;
    const {data, weights} = dimensions;
    const aggregationDataDirty =
      positionsChanged ||
      gpuAggregationChanged ||
      viewportChanged ||
      this.isAggregationDirty(opts, {
        compareAll: gpuAggregation, // check for all (including extentions props) when using gpu aggregation
        dimension: data
      });
    const aggregationWeightsDirty = this.isAggregationDirty(opts, {dimension: weights});

    this.setState({
      aggregationDataDirty,
      aggregationWeightsDirty
    });

    const {viewport} = this.context;

    if (viewportChanged || cellSizeChanged) {
      const {width, height} = viewport;
      const numCol = Math.ceil(width / cellSize);
      const numRow = Math.ceil(height / cellSize);
      this.allocateResources(numRow, numCol);
      this.setState({
        // transformation from clipspace to screen(pixel) space
        scaling: [width / 2, -height / 2, 1],

        gridOffset: {xOffset: cellSize, yOffset: cellSize},
        width,
        height,
        numCol,
        numRow
      });
    }

    if (aggregationWeightsDirty) {
      this._updateAccessors(opts);
    }
    if (aggregationDataDirty || aggregationWeightsDirty) {
      this._resetResults();
    }
  }
  /* eslint-enable complexity, max-statements */

  // Private

  _updateAccessors(opts) {
    const {getWeight, aggregation, data} = opts.props;
    const {count} = this.state.weights;
    if (count) {
      count.getWeight = getWeight;
      count.operation = AGGREGATION_OPERATION[aggregation];
    }
    this.setState({getValue: getValueFunc(aggregation, getWeight, {data})});
  }

  _resetResults() {
    const {count} = this.state.weights;
    if (count) {
      count.aggregationData = null;
    }
  }
}
