"use strict";module.export({experimental:()=>experimental},true);module.link('./lib/init');module.link('./shaderlib');module.link('./lib/constants',{COORDINATE_SYSTEM:"COORDINATE_SYSTEM"},0);module.link('./effects/lighting-effect',{default:"LightingEffect"},1);module.link('./lib/deck',{default:"Deck"},2);module.link('./lib/layer-manager',{default:"LayerManager"},3);module.link('./lib/attribute-manager',{default:"AttributeManager"},4);module.link('./lib/layer',{default:"Layer"},5);module.link('./lib/composite-layer',{default:"CompositeLayer"},6);module.link('./lib/deck-renderer',{default:"DeckRenderer"},7);module.link('./viewports/viewport',{default:"Viewport"},8);module.link('./viewports/web-mercator-viewport',{default:"WebMercatorViewport"},9);module.link('./shaderlib/project/project',{default:"project"},10);module.link('./shaderlib/project64/project64',{default:"project64"},11);module.link('./views/view',{default:"View"},12);module.link('./views/map-view',{default:"MapView"},13);module.link('./views/first-person-view',{default:"FirstPersonView"},14);module.link('./views/third-person-view',{default:"ThirdPersonView"},15);module.link('./views/orbit-view',{default:"OrbitView"},16);module.link('./views/perspective-view',{default:"PerspectiveView"},17);module.link('./views/orthographic-view',{default:"OrthographicView"},18);module.link('./controllers/controller',{default:"Controller"},19);module.link('./controllers/map-controller',{default:"MapController"},20);module.link('./controllers/first-person-controller',{default:"_FirstPersonController"},21);module.link('./controllers/orbit-controller',{default:"_OrbitController"},22);module.link('./controllers/orthographic-controller',{default:"_OrthographicController"},23);module.link('./lib/effect',{default:"Effect"},24);module.link('./controllers/transition-manager',{TRANSITION_EVENTS:"TRANSITION_EVENTS"},25);module.link('./transitions/linear-interpolator',{default:"LinearInterpolator"},26);module.link('./transitions/viewport-fly-to-interpolator',{default:"FlyToInterpolator"},27);module.link('./utils/log',{default:"log"},28);var flattenVertices,fillArray;module.link('./utils/flatten',{flattenVertices(v){flattenVertices=v},fillArray(v){fillArray=v}},29);module.link('./utils/iterable-utils',{createIterable:"createIterable"},30);var Tesselator;module.link('./utils/tesselator',{default(v){Tesselator=v}},31);var count;module.link('./utils/count',{count(v){count=v}},32);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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


// Import shaderlib to make sure shader modules are initialized


// Core Library


// Effects


// Experimental Pure JS (non-React) bindings








// Viewports



// Shader modules











// Controllers


// Experimental Controllers




// EXPERIMENTAL EXPORTS

// Experimental Effects (non-React) bindings


// Eperimental Transitions




// Layer utilities

 // Export? move to luma.gl or math.gl?


 // Export? move to luma.gl or math.gl?


// Exports for layers
// Experimental Features may change in minor version bumps, use at your own risk)
const experimental = {
  Tesselator,
  flattenVertices,
  fillArray,
  count
};
