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
  // LIB
  COORDINATE_SYSTEM,
  LayerManager,
  AttributeManager,
  Layer,
  CompositeLayer,

  // Viewports
  Viewport,
  FirstPersonViewport,
  WebMercatorViewport,
  PerspectiveViewport,
  OrthographicViewport,

  // Transition bindings
  TRANSITION_EVENTS,
  LinearInterpolator,
  ViewportFlyToInterpolator
} from './core';

// Deprecated Core Lib Classes
export {assembleShaders} from 'luma.gl'; // Forward the luma.gl version (note: now integrated with Model)

// EXPERIMENTAL CORE LIB CLASSES (May change in minor version bumps, use at your own risk)
import {experimental as CoreExperimental} from './core';

const {
  // View States
  ViewState,
  FirstPersonState,
  OrbitState,
  MapState,

  // Controllers
  Controller,
  MapController,
  FirstPersonController,
  OrbitController,

  // Viewports
  OrbitViewport,

  DeckGLJS,
  MapControllerJS,

  EffectManager,
  Effect
} = CoreExperimental;

Object.assign(experimental, {
  // Unfinished controller/viewport classes
  ViewState,
  FirstPersonState,
  OrbitState,
  MapState,

  Controller,
  MapController,
  FirstPersonController,
  OrbitController,

  OrbitViewport,

  // Pure JS (non-React) API
  DeckGLJS,
  MapControllerJS,

  // Effects base classes
  EffectManager,
  Effect
});

// Experimental Data Accessor Helpers
// INTERNAL - TODO remove from experimental exports
const {get, count} = CoreExperimental;
Object.assign(experimental, {get, count});

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
  ViewportController // TODO - merge with deck.gl?
} from './react';

// TODO - do we need to expose these?
import {
  MapController as ReactMapController,
  OrbitController as ReactOrbitController
} from './react';

Object.assign(experimental, {
  ReactMapController,
  ReactOrbitController
});

//
// EXPERIMENTAL EXPORTS
//

export {experimental};
