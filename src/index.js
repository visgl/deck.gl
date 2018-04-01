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

const experimental = {};

//
// CORE LIBRARY
//

export {
  // CONSTANTS
  COORDINATE_SYSTEM,
  // Main class
  Deck,
  // Base Layers
  Layer,
  CompositeLayer,
  // Views
  View,
  MapView,
  FirstPersonView,
  ThirdPersonView,
  OrbitView,
  PerspectiveView,
  OrthographicView,
  // Viewports
  Viewport,
  WebMercatorViewport,
  PerspectiveViewport,
  OrthographicViewport,
  // For custom layers
  AttributeManager,
  // Shader modules
  project,
  project64,
  lighting,
  // Internal classes
  LayerManager
} from './core';

// EXPERIMENTAL CORE LIB CLASSES (May change in minor version bumps, use at your own risk)
import {experimental as CoreExperimental} from './core';

const {
  // View States
  ViewState,
  FirstPersonState,
  OrbitState,
  MapState,

  // Controllers
  ViewportControls,
  FirstPersonController,

  // Viewports
  FirstPersonViewport,
  OrbitViewport,
  ThirdPersonViewport,

  // Transition bindings
  TRANSITION_EVENTS,
  LinearInterpolator,
  ViewportFlyToInterpolator,

  MapController: MapControllerJS,
  OrbitController: OrbitControllerJS,

  EffectManager,
  Effect
} = CoreExperimental;

Object.assign(experimental, {
  // Experimental controllers
  MapControllerJS,
  OrbitControllerJS,

  // Unfinished controller/viewport classes
  ViewState,
  FirstPersonState,
  OrbitState,
  MapState,

  // Controller helper classes
  ViewportControls,
  Controller: ViewportControls,
  FirstPersonController,

  // Experimental viewports
  FirstPersonViewport,
  OrbitViewport,
  ThirdPersonViewport,

  // Transition bindings
  TRANSITION_EVENTS,
  LinearInterpolator,
  ViewportFlyToInterpolator,

  // Effects base classes
  EffectManager,
  Effect
});

// Experimental Data Accessor Helpers
// INTERNAL - TODO remove from experimental exports
const {
  // For react module
  TransitionManager,
  extractViewState,

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
  fp64LowPart
} = CoreExperimental;

Object.assign(experimental, {
  // For react module
  TransitionManager,
  extractViewState,

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
  fp64LowPart
});

//
// EFFECTS PACKAGE
//

import {default as ReflectionEffect} from './core/experimental/reflection-effect/reflection-effect';

Object.assign(experimental, {
  ReflectionEffect
});

//
// CORE LAYERS PACKAGE
//

export {
  ArcLayer,
  IconLayer,
  LineLayer,
  PointCloudLayer,
  ScatterplotLayer,
  ScreenGridLayer,
  GridLayer,
  GridCellLayer,
  HexagonLayer,
  HexagonCellLayer,
  PathLayer,
  PolygonLayer,
  GeoJsonLayer,
  TextLayer
} from './core-layers';

//
// REACT BINDINGS PACKAGE
//

export {default, DeckGL} from './react';

// TODO - do we need to expose these?
import {
  MapController,
  OrbitController,
  ViewportController // TODO - merge with deck.gl?
} from './react';

Object.assign(experimental, {
  MapController,
  OrbitController,
  ViewportController
});

//
// EXPERIMENTAL EXPORTS
//

export {experimental};
