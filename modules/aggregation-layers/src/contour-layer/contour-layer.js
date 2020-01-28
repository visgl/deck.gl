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
import {log} from '@deck.gl/core';

import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION, getValueFunc} from '../utils/aggregation-operation-utils';
import {getBoundingBox, getGridParams} from '../utils/grid-aggregation-utils';
import GridAggregationLayer from '../grid-aggregation-layer';

const DEFAULT_COLOR = [255, 255, 255, 255];
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_THRESHOLD = 1;

const defaultProps = {
  // grid aggregation
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: x => 1},
  gpuAggregation: true,
  aggregation: 'SUM',

  // contour lines
  contours: [{threshold: DEFAULT_THRESHOLD}],

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

export default class ContourLayer extends GridAggregationLayer {
  initializeState() {
    super.initializeState({
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
    const attributeManager = this.getAttributeManager();
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

  updateState(opts) {
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

  renderLayers() {
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

  _updateAccessors(opts) {
    const {getWeight, aggregation} = opts.props;
    const {count} = this.state.weights;
    if (count) {
      count.getWeight = getWeight;
      count.operation = AGGREGATION_OPERATION[aggregation];
    }
    this.setState({getValue: getValueFunc(aggregation, getWeight)});
  }

  _resetResults() {
    const {count} = this.state.weights;
    if (count) {
      count.aggregationData = null;
    }
  }

  // Private (Contours)

  _generateContours() {
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

  _updateThresholdData(props) {
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

ContourLayer.layerName = 'ContourLayer';
ContourLayer.defaultProps = defaultProps;
