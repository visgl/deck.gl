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
/* eslint-disable max-len */

// Core Library
export {COORDINATE_SYSTEM} from './lib/constants';
export {default as LayerManager} from './lib/layer-manager';
export {default as AttributeManager} from './lib/attribute-manager';
export {default as Layer} from './lib/layer';
export {default as CompositeLayer} from './lib/composite-layer';

// Viewports
export {default as Viewport} from './viewports/viewport';
export {default as FirstPersonViewport} from './viewports/first-person-viewport';
export {default as ThirdPersonViewport} from './viewports/third-person-viewport';
export {default as WebMercatorViewport} from './viewports/web-mercator-viewport';

// TODO - Do we need to export? Move to experimental?
export {default as ViewportControls} from './controllers/controls';
export {default as FirstPersonState} from './controllers/first-person-state';
export {default as OrbitState} from './controllers/orbit-state';
export {default as MapState} from './controllers/map-state';

// Core Layers
export {default as ArcLayer} from './layers/core/arc-layer/arc-layer';
export {default as IconLayer} from './layers/core/icon-layer/icon-layer';
export {default as LineLayer} from './layers/core/line-layer/line-layer';
export {default as PointCloudLayer} from './layers/core/point-cloud-layer/point-cloud-layer';
export {default as ScatterplotLayer} from './layers/core/scatterplot-layer/scatterplot-layer';

export {default as ScreenGridLayer} from './layers/core/screen-grid-layer/screen-grid-layer';
export {default as GridLayer} from './layers/core/grid-layer/grid-layer';
export {default as GridCellLayer} from './layers/core/grid-cell-layer/grid-cell-layer';

export {default as HexagonLayer} from './layers/core/hexagon-layer/hexagon-layer';
export {default as HexagonCellLayer} from './layers/core/hexagon-cell-layer/hexagon-cell-layer';

export {default as PathLayer} from './layers/core/path-layer/path-layer';
export {default as PolygonLayer} from './layers/core/polygon-layer/polygon-layer';
export {default as GeoJsonLayer} from './layers/core/geojson-layer/geojson-layer';

// React bindings
export {default as DeckGL} from './react/deckgl';
export {default as default} from './react/deckgl';

export {default as ViewportController} from './react/controllers/viewport-controller';
// MapController is just a convenience to set up a ViewportController
export {default as MapController} from './react/controllers/map-controller';

// Experimental Features (May change in minor version bumps, use at your own risk)
import {get} from './lib/utils/get';
import {count} from './lib/utils/count';
import {default as EffectManager} from './experimental/lib/effect-manager';
import {default as Effect} from './experimental/lib/effect';
import {default as ReflectionEffect} from './experimental/effects/reflection-effect/reflection-effect';

// Experimental React bindings
import {default as DeckGLMultiView} from './experimental/react/deckgl-multiview';
import {default as ViewportLayout} from './experimental/react/viewport-layout';
import AnimationMapController from './experimental/react/controllers/animation-map-controller';

export const experimental = {
  get,
  count,
  EffectManager,
  Effect,
  ReflectionEffect,

  DeckGLMultiView,
  ViewportLayout,
  AnimationMapController
};

// Deprecated Core Lib Classes
export {default as PerspectiveViewport} from './deprecated/viewports/perspective-viewport';
export {default as OrthographicViewport} from './deprecated/viewports/orthographic-viewport';
export {default as OrbitController} from './react/controllers/orbit-controller';

// Deprecated Layers
export {default as ChoroplethLayer} from './deprecated/layers/choropleth-layer/choropleth-layer';
export {default as ChoroplethLayer64} from './deprecated/layers/choropleth-layer-64/choropleth-layer-64';
export {default as ExtrudedChoroplethLayer64} from './deprecated/layers/extruded-choropleth-layer-64/extruded-choropleth-layer-64';

// Deprecated Exports
export {assembleShaders} from 'luma.gl'; // Forward the luma.gl version (note: now integrated with Model)
