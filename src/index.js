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
  COORDINATE_SYSTEM,
  LayerManager,
  AttributeManager,
  Layer,
  CompositeLayer
} from './core';

// Viewports
export {
  Viewport,
  FirstPersonViewport,
  ThirdPersonViewport,
  WebMercatorViewport,
  PerspectiveViewport,
  OrthographicViewport,
  // TODO: orbit-viewport to be merged w/ third-person-viewport
  OrbitViewport
} from './core';

// TODO - Do we need to export? Move to experimental?
export {
  ViewportControls,
  FirstPersonState,
  OrbitState,
  MapState
} from './core';

// Transition bindings
export {
  TRANSITION_EVENTS,
  viewportLinearInterpolator,
  viewportFlyToInterpolator
  // TransitionManager (Does the TransitionManager need to be exported?)
} from './core';

// Deprecated Core Lib Classes
export {assembleShaders} from 'luma.gl'; // Forward the luma.gl version (note: now integrated with Model)

// EXPERIMENTAL CORE LIB CLASSES (May change in minor version bumps, use at your own risk)
import {default as DeckGLJS} from './core/pure-js/deck-js';
import {default as MapControllerJS} from './core/pure-js/map-controller-js';
import {default as EffectManager} from './core/experimental/lib/effect-manager';
import {default as Effect} from './core/experimental/lib/effect';

Object.assign(experimental, {
  // Pure JS (non-React) support
  DeckGLJS,
  MapControllerJS,
  // Effects base classes
  EffectManager,
  Effect
});

// Core utilities for layers

// Experimental Data Accessor Helpers
import {get} from './core/lib/utils/get';
import {count} from './core/lib/utils/count';

// Experimental Aggregation Utilities
import {default as BinSorter} from './core/utils/bin-sorter';
import {linearScale} from './core/utils/scale-utils';
import {quantizeScale} from './core/utils/scale-utils';
import {clamp} from './core/utils/scale-utils';
import {defaultColorRange} from './core/utils/color-utils';

// Experimental 64 bit helpers
// TODO - just expose as layer methods instead?
import {enable64bitSupport} from './core/lib/utils/fp64';
import {fp64ify} from './core/lib/utils/fp64';

Object.assign(experimental, {
  // The following are mainly for sub-layers
  get,
  count,

  BinSorter,
  linearScale,
  quantizeScale,
  clamp,
  defaultColorRange,

  enable64bitSupport,
  fp64ify
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
  GeoJsonLayer
} from './core-layers';

//
// DEPRECATED LAYERS PACKAGE
//

export {
  ChoroplethLayer,
  ChoroplethLayer64,
  ExtrudedChoroplethLayer64
} from './deprecated-layers';

//
// EFFECTS PACKAGE
//

import {default as ReflectionEffect} from './effects/experimental/reflection-effect/reflection-effect';

Object.assign(experimental, {
  ReflectionEffect
});

//
// REACT BINDINGS PACKAGE
//

export {
  default as default,
  DeckGL,
  ViewportController,
  MapController
} from './react';

// Experimental React bindings
import {default as OrbitController} from './react/experimental/orbit-controller';
Object.assign(experimental, {
  OrbitController
});

//
// EXPERIMENTAL EXPORTS
//

export {experimental};
