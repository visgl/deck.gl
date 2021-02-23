require('@babel/register');

// Polyfill for loaders
// TODO - @loaders.gl/polyfills seems to freeze the tests
global.fetch = () => Promise.reject('fetch not available in node');

// Polyfill with JSDOM
const {JSDOM} = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html>`);
// These globals are required by @jupyter-widgets/base
/* global global */
global.window = dom.window;
global.navigator = dom.window.navigator;
global.document = dom.window.document;
global.Element = dom.window.Element;
global.__JSDOM__ = true;
global.Image = dom.window.Image;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.HTMLVideoElement = dom.window.HTMLVideoElement;

// Polyfill AbortController
require('abortcontroller-polyfill');

const moduleAlias = require('module-alias');

const path = require('path');
moduleAlias.addAlias('@jupyter-widgets/base', (fromPath, request, alias) => {
  return `${__dirname}/modules/jupyter-widget/mock-widget-base.js`;
});
moduleAlias.addAlias('react-map-gl/dist/esm/mapbox/mapbox', (fromPath, request, alias) => {
  return path.resolve(`${__dirname}/../node_modules/react-map-gl/dist/es5/mapbox/mapbox`);
});

const {gl} = require('@deck.gl/test-utils');
// Create a dummy canvas for the headless gl context
const canvas = global.document.createElement('canvas');
canvas.width = gl.drawingBufferWidth;
canvas.height = gl.drawingBufferHeight;
gl.canvas = canvas;

require('./modules');
