// Copyright (c) 2015 Uber Technologies, Inc.
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

export * from './lib';
export * from './experimental/lib';
export * from './shader-utils';

// Effects
export * from './experimental/effects';

// Core Layers
export {default as ArcLayer} from './layers/core/arc-layer';
export {default as ChoroplethLayer} from './layers/core/choropleth-layer';
export {default as LineLayer} from './layers/core/line-layer';
export {default as ScatterplotLayer} from './layers/core/scatterplot-layer';
export {default as ScreenGridLayer} from './layers/core/screen-grid-layer';

// 64-bit Layers
export {default as ScatterplotLayer64} from './layers/fp64/scatterplot-layer';
export {default as ArcLayer64} from './layers/fp64/arc-layer';
export {default as ChoroplethLayer64} from './layers/fp64/choropleth-layer';
export {default as ExtrudedChoroplethLayer64} from './layers/fp64/extruded-choropleth-layer';
export {default as LineLayer64} from './layers/fp64/line-layer';
