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

// Intialize globals, check version
import './core/lib/init';

// Import shaderlib to make sure shader modules are initialized
import './core/shaderlib';

// Core Library
export {COORDINATE_SYSTEM} from './core/lib/constants';

// Experimental Pure JS (non-React) bindings
export {default as Deck} from './core/lib/deck';

export {default as LayerManager} from './core/lib/layer-manager';
export {default as AttributeManager} from './core/lib/attribute-manager';
export {default as Layer} from './core/lib/layer';
export {default as CompositeLayer} from './core/lib/composite-layer';

// Viewports
export {default as Viewport} from './core/viewports/viewport';
export {default as WebMercatorViewport} from './core/viewports/web-mercator-viewport';
export {default as PerspectiveViewport} from './core/viewports/perspective-viewport';
export {default as OrthographicViewport} from './core/viewports/orthographic-viewport';

// Shader modules
export {default as project} from './core/shaderlib/project/project';
export {default as project64} from './core/shaderlib/project64/project64';
export {default as lighting} from './core/shaderlib/lighting/lighting';

// EXPERIMENTAL EXPORTS
// Experimental Features (May change in minor version bumps, use at your own risk)

export {default as View} from './core/views/view';
export {default as MapView} from './core/views/map-view';
export {default as FirstPersonView} from './core/views/first-person-view';
export {default as ThirdPersonView} from './core/views/third-person-view';
export {default as OrbitView} from './core/views/orbit-view';
export {default as PerspectiveView} from './core/views/perspective-view';
export {default as OrthographicView} from './core/views/orthographic-view';

// Controllers
export {default as MapController} from './core/controllers/map-controller';

// Experimental Controllers
import {default as OrbitController} from './core/controllers/orbit-controller';

import {default as FirstPersonState} from './core/controllers/first-person-state';
import {default as OrbitState} from './core/controllers/orbit-state';
import {default as MapState} from './core/controllers/map-state';

import {default as ViewportControls} from './core/controllers/viewport-controls';
import {default as MapControls} from './core/controllers/map-controls';

import {default as FirstPersonViewport} from './core/viewports/first-person-viewport';
import {default as ThirdPersonViewport} from './core/viewports/third-person-viewport';
import {default as OrbitViewport} from './core/viewports/orbit-viewport';

// Experimental Effects (non-React) bindings
import {default as EffectManager} from './core/experimental/lib/effect-manager';
import {default as Effect} from './core/experimental/lib/effect';

// Eperimental Transitions
import {TRANSITION_EVENTS} from './core/lib/transition-manager';
import {default as LinearInterpolator} from './core/transitions/linear-interpolator';
import {default as ViewportFlyToInterpolator} from './core/transitions/viewport-fly-to-interpolator';

// INTERNAL EXPORTS

import TransitionManager from './core/lib/transition-manager';
import {extractViewState} from './core/transitions/transition-utils';

// Layer utilities
import {default as log} from './core/utils/log';
import {get} from './core/utils/get';
import {count} from './core/utils/count';

import {default as BinSorter} from './core/utils/bin-sorter';
import {defaultColorRange} from './core/utils/color-utils';
import {linearScale, getLinearScale, quantizeScale, getQuantizeScale} from './core/utils/scale-utils';
import {clamp} from './core/utils/scale-utils';

import {flatten, countVertices, flattenVertices, fillArray} from './core/utils/flatten';
// TODO - just expose as layer methods instead?
import {enable64bitSupport} from './core/utils/fp64';
import {fp64ify, fp64LowPart} from './core/utils/fp64';

import ReflectionEffect from './core/experimental/reflection-effect/reflection-effect';

export const experimental = {
  OrbitController,

  ViewportControls,
  MapControls,

  FirstPersonState,
  OrbitState,
  MapState,

  FirstPersonViewport,
  ThirdPersonViewport,
  OrbitViewport,

  EffectManager,
  Effect,

  // Transitions
  TRANSITION_EVENTS,
  LinearInterpolator,
  ViewportFlyToInterpolator,

  // For react module
  TransitionManager,
  extractViewState,

  // TODO make this an internal export to set it apart from experimental
  // export const internal

  // For layers
  BinSorter,
  linearScale,
  getLinearScale,
  quantizeScale,
  getQuantizeScale,
  clamp,
  defaultColorRange,

  log,

  get,
  count,

  flatten,
  countVertices,
  flattenVertices,
  fillArray,

  enable64bitSupport,
  fp64ify,
  fp64LowPart,

  ReflectionEffect
};

// Core Layers
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

export {default as TextLayer} from './core-layers/text-layer/text-layer';
