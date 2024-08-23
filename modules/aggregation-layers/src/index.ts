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

export {default as ScreenGridLayer} from './screen-grid-layer/screen-grid-layer';
export {default as HexagonLayer} from './hexagon-layer/hexagon-layer';
export {default as ContourLayer} from './contour-layer/contour-layer';
export {default as GridLayer} from './grid-layer/grid-layer';
export {default as HeatmapLayer} from './heatmap-layer/heatmap-layer';

export {default as _AggregationLayer} from './common/aggregation-layer';
export {WebGLAggregator} from './common/gpu-aggregator/webgl-aggregator';
export {CPUAggregator} from './common/cpu-aggregator/cpu-aggregator';

// types
export type {ContourLayerProps, ContourLayerPickingInfo} from './contour-layer/contour-layer';
export type {HeatmapLayerProps} from './heatmap-layer/heatmap-layer';
export type {HexagonLayerProps, HexagonLayerPickingInfo} from './hexagon-layer/hexagon-layer';
export type {GridLayerProps, GridLayerPickingInfo} from './grid-layer/grid-layer';
export type {
  ScreenGridLayerProps,
  ScreenGridLayerPickingInfo
} from './screen-grid-layer/screen-grid-layer';

export type {Aggregator, AggregationOperation, AggregationProps} from './common/aggregator';
export type {WebGLAggregatorProps} from './common/gpu-aggregator/webgl-aggregator';
export type {CPUAggregatorProps} from './common/cpu-aggregator/cpu-aggregator';
