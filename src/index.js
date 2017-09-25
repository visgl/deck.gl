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

//
// CORE LIBRARY
//

export {COORDINATE_SYSTEM} from './core/lib/constants';
export {default as LayerManager} from './core/lib/layer-manager';
export {default as AttributeManager} from './core/lib/attribute-manager';
export {default as Layer} from './core/lib/layer';
export {default as CompositeLayer} from './core/lib/composite-layer';

// Viewports
export {default as Viewport} from './core/viewports/viewport';
export {default as FirstPersonViewport} from './core/viewports/first-person-viewport';
export {default as ThirdPersonViewport} from './core/viewports/third-person-viewport';
export {default as WebMercatorViewport} from './core/viewports/web-mercator-viewport';

// TODO - Do we need to export? Move to experimental?
export {default as ViewportControls} from './core/controllers/controls';
export {default as FirstPersonState} from './core/controllers/first-person-state';
export {default as OrbitState} from './core/controllers/orbit-state';
export {default as MapState} from './core/controllers/map-state';

// Experimental Pure JS (non-React) bindings
import {default as DeckGLJS} from './core/pure-js/deck';
import {default as MapControllerJS} from './core/pure-js/map-controller';

// Experimental Features (May change in minor version bumps, use at your own risk)
import {get} from './core/lib/utils/get';
import {count} from './core/lib/utils/count';
import {default as EffectManager} from './core/experimental/lib/effect-manager';
import {default as Effect} from './core/experimental/lib/effect';

// Deprecated Core Lib Classes
export {default as PerspectiveViewport} from './core/deprecated/viewports/perspective-viewport';
export {default as OrthographicViewport} from './core/deprecated/viewports/orthographic-viewport';
export {assembleShaders} from 'luma.gl'; // Forward the luma.gl version (note: now integrated with Model)

//
// CORE LAYERS PACKAGE
//

export {default as ArcLayer} from './core-layers/arc-layer/arc-layer';
export {default as IconLayer} from './core-layers/icon-layer/icon-layer';
export {default as LineLayer} from './core-layers/line-layer/line-layer';
export {default as PointCloudLayer} from './core-layers/point-cloud-layer/point-cloud-layer';
export {default as ScatterplotLayer} from './core-layers/scatterplot-layer/scatterplot-layer';

export {default as ScreenGridLayer} from './core-layers/screen-grid-layer/screen-grid-layer';
export {default as GridLayer} from './core-layers/grid-layer/grid-layer';
export {default as GridCellLayer} from './core-layers/grid-cell-layer/grid-cell-layer';

export {default as HexagonLayer} from './core-layers/hexagon-layer/hexagon-layer';
export {default as HexagonCellLayer} from './core-layers/hexagon-cell-layer/hexagon-cell-layer';

export {default as PathLayer} from './core-layers/path-layer/path-layer';
export {default as PolygonLayer} from './core-layers/polygon-layer/polygon-layer';
export {default as GeoJsonLayer} from './core-layers/geojson-layer/geojson-layer';

//
// DEPRECATED LAYERS PACKAGE
//

export {default as ChoroplethLayer} from './deprecated-layers/choropleth-layer/choropleth-layer';
export {default as ChoroplethLayer64} from './deprecated-layers/choropleth-layer-64/choropleth-layer-64';
export {default as ExtrudedChoroplethLayer64} from './deprecated-layers/extruded-choropleth-layer-64/extruded-choropleth-layer-64';

//
// EFFECTS PACKAGE
//

import {default as ReflectionEffect} from './effects/experimental/reflection-effect/reflection-effect';

//
// REACT BINDINGS PACKAGE
//

export {default as default} from './react/deckgl';
export {default as DeckGL} from './react/deckgl';
export {default as ViewportController} from './react/viewport-controller';
export {default as MapController} from './react/map-controller';

// Experimental React bindings
import {default as OrbitController} from './react/experimental/orbit-controller';
import AnimationMapController from './react/experimental/animation-map-controller';
// TODO - remove before beta-release
export {default as ViewportLayout} from './react/experimental/viewport-layout';
import {default as DeckGL} from './react/deckgl';
import {default as ViewportLayout} from './react/experimental/viewport-layout';

//
// EXPERIMENTAL EXPORTS
//

export const experimental = {
  get,
  count,
  EffectManager,
  Effect,
  ReflectionEffect,

  // Experimental react bindings
  OrbitController,
  AnimationMapController,
  DeckGLMultiView: DeckGL, // TODO - being built in to deck.gl component - remove before release
  ViewportLayout, // TODO - being built in to deck.gl component - remove before release

  // Pure JS (i.e. non-React) support
  DeckGLJS,        // Integrate into `LayerManager`?
  MapControllerJS  // Integrate into `MapController` JS class?
};
