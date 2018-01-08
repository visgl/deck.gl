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
import './lib/init';

// Import shaderlib to make sure shader modules are initialized
import './shaderlib';

// Core Library
export {COORDINATE_SYSTEM} from './lib/constants';
export {default as LayerManager} from './lib/layer-manager';
export {default as AttributeManager} from './lib/attribute-manager';
export {default as Layer} from './lib/layer';
export {default as CompositeLayer} from './lib/composite-layer';

// Viewports
export {default as Viewport} from './viewports/viewport';
export {default as WebMercatorViewport} from './viewports/web-mercator-viewport';
export {default as PerspectiveViewport} from './viewports/perspective-viewport';
export {default as OrthographicViewport} from './viewports/orthographic-viewport';

// Shader modules
export {default as project} from './shaderlib/project/project';
export {default as project64} from './shaderlib/project64/project64';
export {default as lighting} from './shaderlib/lighting/lighting';

// EXPERIMENTAL EXPORTS
// Experimental Features (May change in minor version bumps, use at your own risk)

import {default as FirstPersonState} from './controllers/first-person-state';
import {default as OrbitState} from './controllers/orbit-state';
import {default as MapState} from './controllers/map-state';

// Experimental Controllers
import {default as Controller} from './controllers/viewport-controls';
import {default as MapController} from './controllers/map-controls';

import {default as FirstPersonViewport} from './viewports/first-person-viewport';
import {default as ThirdPersonViewport} from './viewports/third-person-viewport';
import {default as OrbitViewport} from './viewports/orbit-viewport';

// Experimental Pure JS (non-React) bindings
import {default as DeckGLJS} from './pure-js/deck-js';
import {default as MapControllerJS} from './pure-js/map-controller-js';
import {default as OrbitControllerJS} from './pure-js/orbit-controller-js';

// Experimental Effects (non-React) bindings
import {default as EffectManager} from './experimental/lib/effect-manager';
import {default as Effect} from './experimental/lib/effect';

// Eperimental Transitions
import {TRANSITION_EVENTS} from './lib/transition-manager';
import {default as LinearInterpolator} from './transitions/linear-interpolator';
import {default as ViewportFlyToInterpolator} from './transitions/viewport-fly-to-interpolator';

// INTERNAL EXPORTS

import TransitionManager from './lib/transition-manager';
import {extractViewportFrom} from './transitions/transition-utils';

// Layer utilities

// Layer utilities
import {default as log} from './utils/log';
import {get} from './utils/get';
import {count} from './utils/count';

import {default as BinSorter} from './utils/bin-sorter';
import {defaultColorRange} from './utils/color-utils';
import {linearScale, getLinearScale, quantizeScale, getQuantizeScale} from './utils/scale-utils';
import {clamp} from './utils/scale-utils';

import {flatten, countVertices, flattenVertices, fillArray} from './utils/flatten';
// TODO - just expose as layer methods instead?
import {enable64bitSupport} from './utils/fp64';
import {fp64ify, fp64LowPart} from './utils/fp64';

export const experimental = {
  ViewportControls: Controller,
  FirstPersonState,
  OrbitState,
  MapState,

  Controller,
  MapController,
  // FirstPersonController,
  // OrbitController,

  FirstPersonViewport,
  ThirdPersonViewport,
  OrbitViewport,

  DeckGLJS,
  MapControllerJS,
  OrbitControllerJS,

  EffectManager,
  Effect,

  // Transitions
  TRANSITION_EVENTS,
  LinearInterpolator,
  ViewportFlyToInterpolator,

  // For react module
  TransitionManager,
  extractViewportFrom,

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
};
