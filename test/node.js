// Hack: work around "type": "module" from @mapbox/tiny-sdf, for node test only
require('fs').copyFileSync(
  `${__dirname}/../node_modules/@mapbox/tiny-sdf/index.js`,
  `${__dirname}/../node_modules/@mapbox/tiny-sdf/index.cjs`
);

require('@babel/register')({
  extensions: ['.js', '.jsx', '.cjs', '.ts', '.tsx'],
  ignore: [/node_modules\/(?!@mapbox)/]
});

// Must import before the polyfills for h3 to detect the environment correctly
require('h3-js');

// Polyfill for loaders
require('@loaders.gl/polyfills');

// Polyfill with JSDOM
const {JSDOM} = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html>`);
// These globals are required by @jupyter-widgets/base
globalThis.window = dom.window;
globalThis.navigator = dom.window.navigator;
globalThis.document = dom.window.document;
globalThis.Element = dom.window.Element;
globalThis.__JSDOM__ = true;
globalThis.HTMLCanvasElement = dom.window.HTMLCanvasElement;
globalThis.HTMLVideoElement = dom.window.HTMLVideoElement;

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
moduleAlias.addAlias('@mapbox/tiny-sdf', (fromPath, request, alias) => {
  return path.resolve(`${__dirname}/../node_modules/@mapbox/tiny-sdf/index.cjs`);
});

const {gl} = require('@deck.gl/test-utils');
// Create a dummy canvas for the headless gl context
const canvas = globalThis.document.createElement('canvas');
canvas.width = gl.drawingBufferWidth;
canvas.height = gl.drawingBufferHeight;
gl.canvas = canvas;

require('./modules');
