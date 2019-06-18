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
export { COORDINATE_SYSTEM } from './lib/constants';
export { default as LayerManager } from './lib/layer-manager';
export { default as AttributeManager } from './lib/attribute-manager';
export { default as Layer } from './lib/layer';
export { default as CompositeLayer } from './lib/composite-layer';

// Viewports
export { default as Viewport } from './viewports/viewport';
export { default as WebMercatorViewport } from './viewports/web-mercator-viewport';
export { default as PerspectiveViewport } from './viewports/perspective-viewport';
export { default as OrthographicViewport } from './viewports/orthographic-viewport';

// EXPERIMENTAL EXPORTS
// Experimental Features (May change in minor version bumps, use at your own risk)

import { default as FirstPersonState } from './controllers/first-person-state';
import { default as OrbitState } from './controllers/orbit-state';
import { default as MapState } from './controllers/map-state';

// Experimental Controllers
import { default as Controller } from './controllers/viewport-controls';
import { default as MapController } from './controllers/map-controls';

import { default as FirstPersonViewport } from './viewports/first-person-viewport';
import { default as ThirdPersonViewport } from './viewports/third-person-viewport';
import { default as OrbitViewport } from './viewports/orbit-viewport';

// Experimental Pure JS (non-React) bindings
import { default as DeckGLJS } from './pure-js/deck-js';
import { default as MapControllerJS } from './pure-js/map-controller-js';
import { default as OrbitControllerJS } from './pure-js/orbit-controller-js';

// Experimental Effects (non-React) bindings
import { default as EffectManager } from './experimental/lib/effect-manager';
import { default as Effect } from './experimental/lib/effect';

// Eperimental Transitions
import { TRANSITION_EVENTS } from './lib/transition-manager';
import { default as LinearInterpolator } from './transitions/linear-interpolator';
import { default as ViewportFlyToInterpolator } from './transitions/viewport-fly-to-interpolator';

// INTERNAL EXPORTS

import TransitionManager from './lib/transition-manager';
import { extractViewportFrom } from './transitions/transition-utils';

// Layer utilities

// Layer utilities
import { default as log } from './utils/log';
import { get } from './utils/get';
import { count } from './utils/count';

import { default as BinSorter } from './utils/bin-sorter';
import { defaultColorRange } from './utils/color-utils';
import { linearScale, getLinearScale, quantizeScale, getQuantizeScale } from './utils/scale-utils';
import { clamp } from './utils/scale-utils';

import { flatten, countVertices, flattenVertices, fillArray } from './utils/flatten';
// TODO - just expose as layer methods instead?
import { enable64bitSupport } from './utils/fp64';
import { fp64ify } from './utils/fp64';

export var experimental = {
  ViewportControls: Controller,
  FirstPersonState: FirstPersonState,
  OrbitState: OrbitState,
  MapState: MapState,

  Controller: Controller,
  MapController: MapController,
  // FirstPersonController,
  // OrbitController,

  FirstPersonViewport: FirstPersonViewport,
  ThirdPersonViewport: ThirdPersonViewport,
  OrbitViewport: OrbitViewport,

  DeckGLJS: DeckGLJS,
  MapControllerJS: MapControllerJS,
  OrbitControllerJS: OrbitControllerJS,

  EffectManager: EffectManager,
  Effect: Effect,

  // Transitions
  TRANSITION_EVENTS: TRANSITION_EVENTS,
  LinearInterpolator: LinearInterpolator,
  ViewportFlyToInterpolator: ViewportFlyToInterpolator,

  // For react module
  TransitionManager: TransitionManager,
  extractViewportFrom: extractViewportFrom,

  // For layers
  BinSorter: BinSorter,
  linearScale: linearScale,
  getLinearScale: getLinearScale,
  quantizeScale: quantizeScale,
  getQuantizeScale: getQuantizeScale,
  clamp: clamp,
  defaultColorRange: defaultColorRange,

  log: log,

  get: get,
  count: count,

  flatten: flatten,
  countVertices: countVertices,
  flattenVertices: flattenVertices,
  fillArray: fillArray,

  enable64bitSupport: enable64bitSupport,
  fp64ify: fp64ify
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL2luZGV4LmpzIl0sIm5hbWVzIjpbIkNPT1JESU5BVEVfU1lTVEVNIiwiZGVmYXVsdCIsIkxheWVyTWFuYWdlciIsIkF0dHJpYnV0ZU1hbmFnZXIiLCJMYXllciIsIkNvbXBvc2l0ZUxheWVyIiwiVmlld3BvcnQiLCJXZWJNZXJjYXRvclZpZXdwb3J0IiwiUGVyc3BlY3RpdmVWaWV3cG9ydCIsIk9ydGhvZ3JhcGhpY1ZpZXdwb3J0IiwiRmlyc3RQZXJzb25TdGF0ZSIsIk9yYml0U3RhdGUiLCJNYXBTdGF0ZSIsIkNvbnRyb2xsZXIiLCJNYXBDb250cm9sbGVyIiwiRmlyc3RQZXJzb25WaWV3cG9ydCIsIlRoaXJkUGVyc29uVmlld3BvcnQiLCJPcmJpdFZpZXdwb3J0IiwiRGVja0dMSlMiLCJNYXBDb250cm9sbGVySlMiLCJPcmJpdENvbnRyb2xsZXJKUyIsIkVmZmVjdE1hbmFnZXIiLCJFZmZlY3QiLCJUUkFOU0lUSU9OX0VWRU5UUyIsIkxpbmVhckludGVycG9sYXRvciIsIlZpZXdwb3J0Rmx5VG9JbnRlcnBvbGF0b3IiLCJUcmFuc2l0aW9uTWFuYWdlciIsImV4dHJhY3RWaWV3cG9ydEZyb20iLCJsb2ciLCJnZXQiLCJjb3VudCIsIkJpblNvcnRlciIsImRlZmF1bHRDb2xvclJhbmdlIiwibGluZWFyU2NhbGUiLCJnZXRMaW5lYXJTY2FsZSIsInF1YW50aXplU2NhbGUiLCJnZXRRdWFudGl6ZVNjYWxlIiwiY2xhbXAiLCJmbGF0dGVuIiwiY291bnRWZXJ0aWNlcyIsImZsYXR0ZW5WZXJ0aWNlcyIsImZpbGxBcnJheSIsImVuYWJsZTY0Yml0U3VwcG9ydCIsImZwNjRpZnkiLCJleHBlcmltZW50YWwiLCJWaWV3cG9ydENvbnRyb2xzIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsT0FBTyxZQUFQOztBQUVBO0FBQ0EsT0FBTyxhQUFQOztBQUVBO0FBQ0EsU0FBUUEsaUJBQVIsUUFBZ0MsaUJBQWhDO0FBQ0EsU0FBUUMsV0FBV0MsWUFBbkIsUUFBc0MscUJBQXRDO0FBQ0EsU0FBUUQsV0FBV0UsZ0JBQW5CLFFBQTBDLHlCQUExQztBQUNBLFNBQVFGLFdBQVdHLEtBQW5CLFFBQStCLGFBQS9CO0FBQ0EsU0FBUUgsV0FBV0ksY0FBbkIsUUFBd0MsdUJBQXhDOztBQUVBO0FBQ0EsU0FBUUosV0FBV0ssUUFBbkIsUUFBa0Msc0JBQWxDO0FBQ0EsU0FBUUwsV0FBV00sbUJBQW5CLFFBQTZDLG1DQUE3QztBQUNBLFNBQVFOLFdBQVdPLG1CQUFuQixRQUE2QyxrQ0FBN0M7QUFDQSxTQUFRUCxXQUFXUSxvQkFBbkIsUUFBOEMsbUNBQTlDOztBQUVBO0FBQ0E7O0FBRUEsU0FBUVIsV0FBV1MsZ0JBQW5CLFFBQTBDLGtDQUExQztBQUNBLFNBQVFULFdBQVdVLFVBQW5CLFFBQW9DLDJCQUFwQztBQUNBLFNBQVFWLFdBQVdXLFFBQW5CLFFBQWtDLHlCQUFsQzs7QUFFQTtBQUNBLFNBQVFYLFdBQVdZLFVBQW5CLFFBQW9DLGlDQUFwQztBQUNBLFNBQVFaLFdBQVdhLGFBQW5CLFFBQXVDLDRCQUF2Qzs7QUFFQSxTQUFRYixXQUFXYyxtQkFBbkIsUUFBNkMsbUNBQTdDO0FBQ0EsU0FBUWQsV0FBV2UsbUJBQW5CLFFBQTZDLG1DQUE3QztBQUNBLFNBQVFmLFdBQVdnQixhQUFuQixRQUF1Qyw0QkFBdkM7O0FBRUE7QUFDQSxTQUFRaEIsV0FBV2lCLFFBQW5CLFFBQWtDLG1CQUFsQztBQUNBLFNBQVFqQixXQUFXa0IsZUFBbkIsUUFBeUMsNkJBQXpDO0FBQ0EsU0FBUWxCLFdBQVdtQixpQkFBbkIsUUFBMkMsK0JBQTNDOztBQUVBO0FBQ0EsU0FBUW5CLFdBQVdvQixhQUFuQixRQUF1QyxtQ0FBdkM7QUFDQSxTQUFRcEIsV0FBV3FCLE1BQW5CLFFBQWdDLDJCQUFoQzs7QUFFQTtBQUNBLFNBQVFDLGlCQUFSLFFBQWdDLDBCQUFoQztBQUNBLFNBQVF0QixXQUFXdUIsa0JBQW5CLFFBQTRDLG1DQUE1QztBQUNBLFNBQVF2QixXQUFXd0IseUJBQW5CLFFBQW1ELDRDQUFuRDs7QUFFQTs7QUFFQSxPQUFPQyxpQkFBUCxNQUE4QiwwQkFBOUI7QUFDQSxTQUFRQyxtQkFBUixRQUFrQyxnQ0FBbEM7O0FBRUE7O0FBRUE7QUFDQSxTQUFRMUIsV0FBVzJCLEdBQW5CLFFBQTZCLGFBQTdCO0FBQ0EsU0FBUUMsR0FBUixRQUFrQixhQUFsQjtBQUNBLFNBQVFDLEtBQVIsUUFBb0IsZUFBcEI7O0FBRUEsU0FBUTdCLFdBQVc4QixTQUFuQixRQUFtQyxvQkFBbkM7QUFDQSxTQUFRQyxpQkFBUixRQUFnQyxxQkFBaEM7QUFDQSxTQUFRQyxXQUFSLEVBQXFCQyxjQUFyQixFQUFxQ0MsYUFBckMsRUFBb0RDLGdCQUFwRCxRQUEyRSxxQkFBM0U7QUFDQSxTQUFRQyxLQUFSLFFBQW9CLHFCQUFwQjs7QUFFQSxTQUFRQyxPQUFSLEVBQWlCQyxhQUFqQixFQUFnQ0MsZUFBaEMsRUFBaURDLFNBQWpELFFBQWlFLGlCQUFqRTtBQUNBO0FBQ0EsU0FBUUMsa0JBQVIsUUFBaUMsY0FBakM7QUFDQSxTQUFRQyxPQUFSLFFBQXNCLGNBQXRCOztBQUVBLE9BQU8sSUFBTUMsZUFBZTtBQUMxQkMsb0JBQWtCaEMsVUFEUTtBQUUxQkgsb0NBRjBCO0FBRzFCQyx3QkFIMEI7QUFJMUJDLG9CQUowQjs7QUFNMUJDLHdCQU4wQjtBQU8xQkMsOEJBUDBCO0FBUTFCO0FBQ0E7O0FBRUFDLDBDQVgwQjtBQVkxQkMsMENBWjBCO0FBYTFCQyw4QkFiMEI7O0FBZTFCQyxvQkFmMEI7QUFnQjFCQyxrQ0FoQjBCO0FBaUIxQkMsc0NBakIwQjs7QUFtQjFCQyw4QkFuQjBCO0FBb0IxQkMsZ0JBcEIwQjs7QUFzQjFCO0FBQ0FDLHNDQXZCMEI7QUF3QjFCQyx3Q0F4QjBCO0FBeUIxQkMsc0RBekIwQjs7QUEyQjFCO0FBQ0FDLHNDQTVCMEI7QUE2QjFCQywwQ0E3QjBCOztBQStCMUI7QUFDQUksc0JBaEMwQjtBQWlDMUJFLDBCQWpDMEI7QUFrQzFCQyxnQ0FsQzBCO0FBbUMxQkMsOEJBbkMwQjtBQW9DMUJDLG9DQXBDMEI7QUFxQzFCQyxjQXJDMEI7QUFzQzFCTCxzQ0F0QzBCOztBQXdDMUJKLFVBeEMwQjs7QUEwQzFCQyxVQTFDMEI7QUEyQzFCQyxjQTNDMEI7O0FBNkMxQlEsa0JBN0MwQjtBQThDMUJDLDhCQTlDMEI7QUErQzFCQyxrQ0EvQzBCO0FBZ0QxQkMsc0JBaEQwQjs7QUFrRDFCQyx3Q0FsRDBCO0FBbUQxQkM7QUFuRDBCLENBQXJCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG5cbi8vIEludGlhbGl6ZSBnbG9iYWxzLCBjaGVjayB2ZXJzaW9uXG5pbXBvcnQgJy4vbGliL2luaXQnO1xuXG4vLyBJbXBvcnQgc2hhZGVybGliIHRvIG1ha2Ugc3VyZSBzaGFkZXIgbW9kdWxlcyBhcmUgaW5pdGlhbGl6ZWRcbmltcG9ydCAnLi9zaGFkZXJsaWInO1xuXG4vLyBDb3JlIExpYnJhcnlcbmV4cG9ydCB7Q09PUkRJTkFURV9TWVNURU19IGZyb20gJy4vbGliL2NvbnN0YW50cyc7XG5leHBvcnQge2RlZmF1bHQgYXMgTGF5ZXJNYW5hZ2VyfSBmcm9tICcuL2xpYi9sYXllci1tYW5hZ2VyJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBBdHRyaWJ1dGVNYW5hZ2VyfSBmcm9tICcuL2xpYi9hdHRyaWJ1dGUtbWFuYWdlcic7XG5leHBvcnQge2RlZmF1bHQgYXMgTGF5ZXJ9IGZyb20gJy4vbGliL2xheWVyJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBDb21wb3NpdGVMYXllcn0gZnJvbSAnLi9saWIvY29tcG9zaXRlLWxheWVyJztcblxuLy8gVmlld3BvcnRzXG5leHBvcnQge2RlZmF1bHQgYXMgVmlld3BvcnR9IGZyb20gJy4vdmlld3BvcnRzL3ZpZXdwb3J0JztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBXZWJNZXJjYXRvclZpZXdwb3J0fSBmcm9tICcuL3ZpZXdwb3J0cy93ZWItbWVyY2F0b3Itdmlld3BvcnQnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIFBlcnNwZWN0aXZlVmlld3BvcnR9IGZyb20gJy4vdmlld3BvcnRzL3BlcnNwZWN0aXZlLXZpZXdwb3J0JztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBPcnRob2dyYXBoaWNWaWV3cG9ydH0gZnJvbSAnLi92aWV3cG9ydHMvb3J0aG9ncmFwaGljLXZpZXdwb3J0JztcblxuLy8gRVhQRVJJTUVOVEFMIEVYUE9SVFNcbi8vIEV4cGVyaW1lbnRhbCBGZWF0dXJlcyAoTWF5IGNoYW5nZSBpbiBtaW5vciB2ZXJzaW9uIGJ1bXBzLCB1c2UgYXQgeW91ciBvd24gcmlzaylcblxuaW1wb3J0IHtkZWZhdWx0IGFzIEZpcnN0UGVyc29uU3RhdGV9IGZyb20gJy4vY29udHJvbGxlcnMvZmlyc3QtcGVyc29uLXN0YXRlJztcbmltcG9ydCB7ZGVmYXVsdCBhcyBPcmJpdFN0YXRlfSBmcm9tICcuL2NvbnRyb2xsZXJzL29yYml0LXN0YXRlJztcbmltcG9ydCB7ZGVmYXVsdCBhcyBNYXBTdGF0ZX0gZnJvbSAnLi9jb250cm9sbGVycy9tYXAtc3RhdGUnO1xuXG4vLyBFeHBlcmltZW50YWwgQ29udHJvbGxlcnNcbmltcG9ydCB7ZGVmYXVsdCBhcyBDb250cm9sbGVyfSBmcm9tICcuL2NvbnRyb2xsZXJzL3ZpZXdwb3J0LWNvbnRyb2xzJztcbmltcG9ydCB7ZGVmYXVsdCBhcyBNYXBDb250cm9sbGVyfSBmcm9tICcuL2NvbnRyb2xsZXJzL21hcC1jb250cm9scyc7XG5cbmltcG9ydCB7ZGVmYXVsdCBhcyBGaXJzdFBlcnNvblZpZXdwb3J0fSBmcm9tICcuL3ZpZXdwb3J0cy9maXJzdC1wZXJzb24tdmlld3BvcnQnO1xuaW1wb3J0IHtkZWZhdWx0IGFzIFRoaXJkUGVyc29uVmlld3BvcnR9IGZyb20gJy4vdmlld3BvcnRzL3RoaXJkLXBlcnNvbi12aWV3cG9ydCc7XG5pbXBvcnQge2RlZmF1bHQgYXMgT3JiaXRWaWV3cG9ydH0gZnJvbSAnLi92aWV3cG9ydHMvb3JiaXQtdmlld3BvcnQnO1xuXG4vLyBFeHBlcmltZW50YWwgUHVyZSBKUyAobm9uLVJlYWN0KSBiaW5kaW5nc1xuaW1wb3J0IHtkZWZhdWx0IGFzIERlY2tHTEpTfSBmcm9tICcuL3B1cmUtanMvZGVjay1qcyc7XG5pbXBvcnQge2RlZmF1bHQgYXMgTWFwQ29udHJvbGxlckpTfSBmcm9tICcuL3B1cmUtanMvbWFwLWNvbnRyb2xsZXItanMnO1xuaW1wb3J0IHtkZWZhdWx0IGFzIE9yYml0Q29udHJvbGxlckpTfSBmcm9tICcuL3B1cmUtanMvb3JiaXQtY29udHJvbGxlci1qcyc7XG5cbi8vIEV4cGVyaW1lbnRhbCBFZmZlY3RzIChub24tUmVhY3QpIGJpbmRpbmdzXG5pbXBvcnQge2RlZmF1bHQgYXMgRWZmZWN0TWFuYWdlcn0gZnJvbSAnLi9leHBlcmltZW50YWwvbGliL2VmZmVjdC1tYW5hZ2VyJztcbmltcG9ydCB7ZGVmYXVsdCBhcyBFZmZlY3R9IGZyb20gJy4vZXhwZXJpbWVudGFsL2xpYi9lZmZlY3QnO1xuXG4vLyBFcGVyaW1lbnRhbCBUcmFuc2l0aW9uc1xuaW1wb3J0IHtUUkFOU0lUSU9OX0VWRU5UU30gZnJvbSAnLi9saWIvdHJhbnNpdGlvbi1tYW5hZ2VyJztcbmltcG9ydCB7ZGVmYXVsdCBhcyBMaW5lYXJJbnRlcnBvbGF0b3J9IGZyb20gJy4vdHJhbnNpdGlvbnMvbGluZWFyLWludGVycG9sYXRvcic7XG5pbXBvcnQge2RlZmF1bHQgYXMgVmlld3BvcnRGbHlUb0ludGVycG9sYXRvcn0gZnJvbSAnLi90cmFuc2l0aW9ucy92aWV3cG9ydC1mbHktdG8taW50ZXJwb2xhdG9yJztcblxuLy8gSU5URVJOQUwgRVhQT1JUU1xuXG5pbXBvcnQgVHJhbnNpdGlvbk1hbmFnZXIgZnJvbSAnLi9saWIvdHJhbnNpdGlvbi1tYW5hZ2VyJztcbmltcG9ydCB7ZXh0cmFjdFZpZXdwb3J0RnJvbX0gZnJvbSAnLi90cmFuc2l0aW9ucy90cmFuc2l0aW9uLXV0aWxzJztcblxuLy8gTGF5ZXIgdXRpbGl0aWVzXG5cbi8vIExheWVyIHV0aWxpdGllc1xuaW1wb3J0IHtkZWZhdWx0IGFzIGxvZ30gZnJvbSAnLi91dGlscy9sb2cnO1xuaW1wb3J0IHtnZXR9IGZyb20gJy4vdXRpbHMvZ2V0JztcbmltcG9ydCB7Y291bnR9IGZyb20gJy4vdXRpbHMvY291bnQnO1xuXG5pbXBvcnQge2RlZmF1bHQgYXMgQmluU29ydGVyfSBmcm9tICcuL3V0aWxzL2Jpbi1zb3J0ZXInO1xuaW1wb3J0IHtkZWZhdWx0Q29sb3JSYW5nZX0gZnJvbSAnLi91dGlscy9jb2xvci11dGlscyc7XG5pbXBvcnQge2xpbmVhclNjYWxlLCBnZXRMaW5lYXJTY2FsZSwgcXVhbnRpemVTY2FsZSwgZ2V0UXVhbnRpemVTY2FsZX0gZnJvbSAnLi91dGlscy9zY2FsZS11dGlscyc7XG5pbXBvcnQge2NsYW1wfSBmcm9tICcuL3V0aWxzL3NjYWxlLXV0aWxzJztcblxuaW1wb3J0IHtmbGF0dGVuLCBjb3VudFZlcnRpY2VzLCBmbGF0dGVuVmVydGljZXMsIGZpbGxBcnJheX0gZnJvbSAnLi91dGlscy9mbGF0dGVuJztcbi8vIFRPRE8gLSBqdXN0IGV4cG9zZSBhcyBsYXllciBtZXRob2RzIGluc3RlYWQ/XG5pbXBvcnQge2VuYWJsZTY0Yml0U3VwcG9ydH0gZnJvbSAnLi91dGlscy9mcDY0JztcbmltcG9ydCB7ZnA2NGlmeX0gZnJvbSAnLi91dGlscy9mcDY0JztcblxuZXhwb3J0IGNvbnN0IGV4cGVyaW1lbnRhbCA9IHtcbiAgVmlld3BvcnRDb250cm9sczogQ29udHJvbGxlcixcbiAgRmlyc3RQZXJzb25TdGF0ZSxcbiAgT3JiaXRTdGF0ZSxcbiAgTWFwU3RhdGUsXG5cbiAgQ29udHJvbGxlcixcbiAgTWFwQ29udHJvbGxlcixcbiAgLy8gRmlyc3RQZXJzb25Db250cm9sbGVyLFxuICAvLyBPcmJpdENvbnRyb2xsZXIsXG5cbiAgRmlyc3RQZXJzb25WaWV3cG9ydCxcbiAgVGhpcmRQZXJzb25WaWV3cG9ydCxcbiAgT3JiaXRWaWV3cG9ydCxcblxuICBEZWNrR0xKUyxcbiAgTWFwQ29udHJvbGxlckpTLFxuICBPcmJpdENvbnRyb2xsZXJKUyxcblxuICBFZmZlY3RNYW5hZ2VyLFxuICBFZmZlY3QsXG5cbiAgLy8gVHJhbnNpdGlvbnNcbiAgVFJBTlNJVElPTl9FVkVOVFMsXG4gIExpbmVhckludGVycG9sYXRvcixcbiAgVmlld3BvcnRGbHlUb0ludGVycG9sYXRvcixcblxuICAvLyBGb3IgcmVhY3QgbW9kdWxlXG4gIFRyYW5zaXRpb25NYW5hZ2VyLFxuICBleHRyYWN0Vmlld3BvcnRGcm9tLFxuXG4gIC8vIEZvciBsYXllcnNcbiAgQmluU29ydGVyLFxuICBsaW5lYXJTY2FsZSxcbiAgZ2V0TGluZWFyU2NhbGUsXG4gIHF1YW50aXplU2NhbGUsXG4gIGdldFF1YW50aXplU2NhbGUsXG4gIGNsYW1wLFxuICBkZWZhdWx0Q29sb3JSYW5nZSxcblxuICBsb2csXG5cbiAgZ2V0LFxuICBjb3VudCxcblxuICBmbGF0dGVuLFxuICBjb3VudFZlcnRpY2VzLFxuICBmbGF0dGVuVmVydGljZXMsXG4gIGZpbGxBcnJheSxcblxuICBlbmFibGU2NGJpdFN1cHBvcnQsXG4gIGZwNjRpZnlcbn07XG4iXX0=