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

// Effects
export {default as LightingEffect} from './effects/lighting/lighting-effect';
export {AmbientLight} from './effects/lighting/ambient-light';
export {DirectionalLight} from './effects/lighting/directional-light';
export {PointLight} from './effects/lighting/point-light';
export {default as _CameraLight} from './effects/lighting/camera-light';
export {default as _SunLight} from './effects/lighting/sun-light';
export {default as PostProcessEffect} from './effects/post-process-effect';

// Passes
export {default as _LayersPass} from './passes/layers-pass';

// Experimental Pure JS (non-React) bindings
export {default as Deck} from './lib/deck';

export {default as LayerManager} from './lib/layer-manager';
export {default as AttributeManager} from './lib/attribute/attribute-manager';
export {default as Layer} from './lib/layer';
export {default as CompositeLayer} from './lib/composite-layer';
export {default as DeckRenderer} from './lib/deck-renderer';

// Viewports
export {default as Viewport} from './viewports/viewport';
export {default as WebMercatorViewport} from './viewports/web-mercator-viewport';
export {default as _GlobeViewport} from './viewports/globe-viewport';

// Shader modules
export {picking, project, project32, gouraudLighting, phongLighting, shadow} from './shaderlib';

export {default as View} from './views/view';
export {default as MapView} from './views/map-view';
export {default as FirstPersonView} from './views/first-person-view';
export {default as OrbitView} from './views/orbit-view';
export {default as OrthographicView} from './views/orthographic-view';
export {default as _GlobeView} from './views/globe-view';

// Controllers
export {default as Controller} from './controllers/controller';
export {default as MapController} from './controllers/map-controller';
export {default as _GlobeController} from './controllers/globe-controller';
export {default as FirstPersonController} from './controllers/first-person-controller';
export {default as OrbitController} from './controllers/orbit-controller';
export {default as OrthographicController} from './controllers/orthographic-controller';

// Extensions interface
export {default as Effect} from './lib/effect';
export {default as LayerExtension} from './lib/layer-extension';

// Transitions
export {TRANSITION_EVENTS} from './controllers/transition-manager';
export {default as TransitionInterpolator} from './transitions/transition-interpolator';
export {default as LinearInterpolator} from './transitions/linear-interpolator';
export {default as FlyToInterpolator} from './transitions/viewport-fly-to-interpolator';

// Layer utilities
export {default as log} from './utils/log';
export {createIterable} from './utils/iterable-utils';
export {fp64LowPart} from './utils/math-utils';
export {default as Tesselator} from './utils/tesselator'; // Export? move to luma.gl or math.gl?

// Experimental utilities
export {fillArray as _fillArray, flatten as _flatten} from './utils/flatten'; // Export? move to luma.gl or math.gl?
export {count as _count} from './utils/count';
export {default as _memoize} from './utils/memoize';
export {mergeShaders as _mergeShaders} from './utils/shader';
export {compareProps as _compareProps} from './lifecycle/props';
