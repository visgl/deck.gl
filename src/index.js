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
/* eslint-disable max-len */

// Utilities
export {assembleShaders} from './shader-utils';

// Lib
export {Layer, CompositeLayer, LayerManager, AttributeManager} from './lib';
export {COORDINATE_SYSTEM} from './lib';
export {default as PerspectiveViewport} from './lib/viewports/perspective-viewport';

// Core Layers
export {default as ArcLayer} from './layers/core/arc-layer/arc-layer';
export {default as GridLayer} from './layers/core/grid-layer/grid-layer';
export {default as PointDensityGridLayer} from './layers/core/point-density-grid-layer/point-density-grid-layer';
export {default as PointDensityHexagonLayer} from './layers/core/point-density-hexagon-layer/point-density-hexagon-layer';
export {default as HexagonLayer} from './layers/core/hexagon-layer/hexagon-layer';
export {default as IconLayer} from './layers/core/icon-layer/icon-layer';
export {default as LineLayer} from './layers/core/line-layer/line-layer';
export {default as PointCloudLayer} from './layers/core/point-cloud-layer/point-cloud-layer';
export {default as ScatterplotLayer} from './layers/core/scatterplot-layer/scatterplot-layer';
export {default as ScreenGridLayer} from './layers/core/screen-grid-layer/screen-grid-layer';

export {default as PathLayer} from './layers/core/path-layer/path-layer';
export {default as PolygonLayer} from './layers/core/polygon-layer/polygon-layer';
export {default as GeoJsonLayer} from './layers/core/geojson-layer/geojson-layer';

// 64-bit Layers
export {default as ScatterplotLayer64} from './layers/fp64/scatterplot-layer/scatterplot-layer-64';
export {default as ArcLayer64} from './layers/fp64/arc-layer/arc-layer-64';
export {default as LineLayer64} from './layers/fp64/line-layer/line-layer-64';

// Deprecated Layers
export {default as ChoroplethLayer} from './layers/deprecated/choropleth-layer/choropleth-layer';
export {default as ChoroplethLayer64} from './layers/deprecated/choropleth-layer-64/choropleth-layer-64';
export {default as ExtrudedChoroplethLayer64} from './layers/deprecated/extruded-choropleth-layer-64/extruded-choropleth-layer-64';

// React exports
export {default as DeckGL} from './react/deckgl';
export {default as default} from './react/deckgl';

// Experimental Features (May change in minor version bumps, use at your own risk)
import {get} from './lib/utils/container';
import {EffectManager, Effect} from './experimental/lib';
import {default as ReflectionEffect} from './experimental/effects/reflection-effect';

export const experimental = {
  get,
  EffectManager,
  Effect,
  ReflectionEffect
};
