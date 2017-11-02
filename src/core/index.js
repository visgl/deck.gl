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
export {default as PerspectiveViewport} from './viewports/perspective-viewport';
export {default as OrthographicViewport} from './viewports/orthographic-viewport';
// TODO: orbit-viewport to be merged w/ third-person-viewport
export {default as OrbitViewport} from './viewports/orbit-viewport';

// TODO - Do we need to export? Move to experimental?
export {default as ViewportControls} from './controllers/viewport-controls';
export {default as FirstPersonState} from './controllers/first-person-state';
export {default as OrbitState} from './controllers/orbit-state';
export {default as MapState} from './controllers/map-state';

export {TRANSITION_EVENTS} from './lib/transition-manager';
export {viewportLinearInterpolator, viewportFlyToInterpolator} from './lib/viewport-transition-utils';

export {equals} from './math/equals';

// Experimental Features (May change in minor version bumps, use at your own risk)
// Experimental Pure JS (non-React) bindings
import {default as DeckGLJS} from './pure-js/deck-js';
import {default as MapControllerJS} from './pure-js/map-controller-js';
// Experimental Effects (non-React) bindings
import {default as EffectManager} from './experimental/lib/effect-manager';
import {default as Effect} from './experimental/lib/effect';

import TransitionManager from './lib/transition-manager';
import {extractViewportFrom} from './lib/viewport-transition-utils';

// Layer utilities
import log from './utils/log';
import {get} from './lib/utils/get';
import {count} from './lib/utils/count';

import {default as BinSorter} from './utils/bin-sorter';
import {
  linearScale, getLinearScale,
  quantizeScale, getQuantizeScale,
  clamp
} from './utils/scale-utils';
import {defaultColorRange} from './utils/color-utils';

// TODO - just expose as layer methods instead?
import {enable64bitSupport} from './lib/utils/fp64';
import {fp64ify} from './lib/utils/fp64';

import {flatten, countVertices, flattenVertices, fillArray} from './lib/utils/flatten';

export const experimental = {
  DeckGLJS,
  MapControllerJS,
  EffectManager,
  Effect,

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
  enable64bitSupport,
  fp64ify,

  flatten,
  countVertices,
  flattenVertices,
  fillArray
};
