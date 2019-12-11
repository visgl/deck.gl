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

import {GridCellLayer} from '@deck.gl/layers';

import {defaultColorRange} from '../utils/color-utils';
import {pointToDensityGridDataCPU} from './grid-aggregator';
import CPUAggregator from '../utils/cpu-aggregator';
import AggregationLayer from '../aggregation-layer';

function nop() {}

const defaultProps = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: {type: 'accessor', value: null}, // default value is calculated from `getColorWeight` and `colorAggregation`
  getColorWeight: {type: 'accessor', value: x => 1},
  colorAggregation: 'SUM',
  lowerPercentile: {type: 'number', min: 0, max: 100, value: 0},
  upperPercentile: {type: 'number', min: 0, max: 100, value: 100},
  colorScaleType: 'quantize',
  onSetColorDomain: nop,

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationValue: {type: 'accessor', value: null}, // default value is calculated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: {type: 'accessor', value: x => 1},
  elevationAggregation: 'SUM',
  elevationLowerPercentile: {type: 'number', min: 0, max: 100, value: 0},
  elevationUpperPercentile: {type: 'number', min: 0, max: 100, value: 100},
  elevationScale: {type: 'number', min: 0, value: 1},
  elevationScaleType: 'linear',
  onSetElevationDomain: nop,

  gridAggregator: pointToDensityGridDataCPU,

  // grid
  cellSize: {type: 'number', min: 0, max: 1000, value: 1000},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  getPosition: {type: 'accessor', value: x => x.position},
  extruded: false,

  // Optional material for 'lighting' shader module
  material: true,

  // data filter
  _filterData: {type: 'function', value: null, optional: true}
};

export default class CPUGridLayer extends AggregationLayer {
  initializeState() {
    const cpuAggregator = new CPUAggregator({
      getAggregator: props => props.gridAggregator,
      getCellSize: props => props.cellSize
    });

    this.state = {
      cpuAggregator,
      aggregatorState: cpuAggregator.state
    };
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {size: 3, accessor: 'getPosition'}
    });
    // color and elevation attributes can't be added as attributes
    // they are calcualted using 'getValue' accessor that takes an array of pints.
  }

  updateState(opts) {
    super.updateState(opts);
    this.setState({
      // make a copy of the internal state of cpuAggregator for testing
      aggregatorState: this.state.cpuAggregator.updateState(opts, {
        viewport: this.context.viewport,
        attributes: this.getAttributes(),
        numInstances: this.getNumInstances(opts.props)
      })
    });
  }

  getPickingInfo({info}) {
    return this.state.cpuAggregator.getPickingInfo({info});
  }

  // create a method for testing
  _onGetSublayerColor(cell) {
    return this.state.cpuAggregator.getAccessor('fillColor')(cell);
  }

  // create a method for testing
  _onGetSublayerElevation(cell) {
    return this.state.cpuAggregator.getAccessor('elevation')(cell);
  }

  _getSublayerUpdateTriggers() {
    return this.state.cpuAggregator.getUpdateTriggers(this.props);
  }

  renderLayers() {
    const {elevationScale, extruded, cellSize, coverage, material, transitions} = this.props;
    const {cpuAggregator} = this.state;
    const SubLayerClass = this.getSubLayerClass('grid-cell', GridCellLayer);
    const updateTriggers = this._getSublayerUpdateTriggers();

    return new SubLayerClass(
      {
        cellSize,
        coverage,
        material,
        elevationScale,
        extruded,

        getFillColor: this._onGetSublayerColor.bind(this),
        getElevation: this._onGetSublayerElevation.bind(this),
        transitions: transitions && {
          getFillColor: transitions.getColorValue || transitions.getColorWeight,
          getElevation: transitions.getElevationValue || transitions.getElevationWeight
        }
      },
      this.getSubLayerProps({
        id: 'grid-cell',
        updateTriggers
      }),
      {
        data: cpuAggregator.state.layerData.data
      }
    );
  }
}

CPUGridLayer.layerName = 'CPUGridLayer';
CPUGridLayer.defaultProps = defaultProps;
