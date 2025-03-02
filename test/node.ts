// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Polyfill for loaders
import '@loaders.gl/polyfills';

// Polyfill with JSDOM
import {JSDOM} from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html>');
// These globals are required by @jupyter-widgets/base
const _global: any = globalThis;

/** global setTimeout, clearTimeout */
_global.window = dom.window;
_global.navigator = dom.window.navigator;
_global.document = dom.window.document;
_global.Element = dom.window.Element;
_global.__JSDOM__ = true;
_global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
_global.HTMLVideoElement = dom.window.HTMLVideoElement;
_global.requestAnimationFrame = cb => setTimeout(cb, 0);
_global.cancelAnimationFrame = t => clearTimeout(t);

// import {gl, device} from '@deck.gl/test-utils';
// import {mockCanvasApi} from './utils/mock-canvas-api';

// // Mock Canvas/Context2D calls
// mockCanvasApi(dom.window.HTMLCanvasElement);

// // Create a dummy canvas for the headless gl context
// const canvas = globalThis.document.createElement('canvas');
// canvas.width = gl.drawingBufferWidth;
// canvas.height = gl.drawingBufferHeight;
// // Deck class uses client width/height to calculate viewport sizes
// Object.defineProperty(canvas, 'clientWidth', {
//   value: canvas.width
// });
// Object.defineProperty(canvas, 'clientHeight', {
//   value: canvas.height
// });
// gl.canvas = canvas;
// device.canvasContext.canvas = canvas;

import './modules/imports-spec';
import './modules/layers/core-layers.spec';
