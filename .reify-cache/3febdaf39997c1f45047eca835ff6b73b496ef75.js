"use strict";module.export({experimental:()=>experimental},true);module.link('./screen-grid-layer/screen-grid-layer',{default:"ScreenGridLayer"},0);module.link('./grid-layer/grid-layer',{default:"GridLayer"},1);module.link('./hexagon-layer/hexagon-layer',{default:"HexagonLayer"},2);module.link('./contour-layer/contour-layer',{default:"ContourLayer"},3);module.link('./gpu-grid-layer/gpu-grid-layer',{default:"_GPUGridLayer"},4);module.link('./utils/gpu-grid-aggregation/gpu-grid-aggregator',{default:"_GPUGridAggregator"},5);module.link('./utils/gpu-grid-aggregation/gpu-grid-aggregator-constants',{AGGREGATION_OPERATION:"AGGREGATION_OPERATION"},6);module.link('./utils/gpu-grid-aggregation/grid-aggregation-utils',{pointToDensityGridData:"_pointToDensityGridData"},7);var BinSorter;module.link('./utils/bin-sorter',{default(v){BinSorter=v}},8);var linearScale,getLinearScale,quantizeScale,getQuantizeScale;module.link('./utils/scale-utils',{linearScale(v){linearScale=v},getLinearScale(v){getLinearScale=v},quantizeScale(v){quantizeScale=v},getQuantizeScale(v){getQuantizeScale=v}},9);var defaultColorRange;module.link('./utils/color-utils',{defaultColorRange(v){defaultColorRange=v}},10);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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
/* eslint-disable max-len */






// Experimental layer exports












const experimental = {
  BinSorter,

  linearScale,
  getLinearScale,
  quantizeScale,
  getQuantizeScale,

  defaultColorRange
};
