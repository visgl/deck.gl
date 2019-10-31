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

import AggregationLayer from './aggregation-layer';
import GPUGridAggregator from './utils/gpu-grid-aggregation/gpu-grid-aggregator';

export default class GridAggregationLayer extends AggregationLayer {
  initializeState(aggregationProps) {
    const {gl} = this.context;
    super.initializeState(aggregationProps);
    this.setState({
      gpuGridAggregator: new GPUGridAggregator(gl, {id: `${this.id}-gpu-aggregator`})
    });
  }

  finalizeState() {
    super.finalizeState();
    const {gpuGridAggregator} = this.state;
    if (gpuGridAggregator) {
      gpuGridAggregator.delete();
    }
  }

  _updateShaders(shaders) {
    this.state.gpuGridAggregator.updateShaders(shaders);
  }

  _getAggregationModel() {
    return this.state.gpuGridAggregator.gridAggregationModel;
  }
}

GridAggregationLayer.layerName = 'GridAggregationLayer';
