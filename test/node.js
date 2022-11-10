require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx']
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
const {copyFileSync} = require('fs');
const path = require('path');

// Hack: work around cannot require() packages with type: "module"
// This is only a problem in node tests due to @babel/register not supporting ESM modules
// TODO - move away from @babel/register
function useEsmModule(importPath, file) {
  file = path.resolve(`${__dirname}/../node_modules`, file);
  const fileAlt = file.replace(/\.js$/, '.cjs');
  copyFileSync(file, fileAlt);
  moduleAlias.addAlias(importPath, () => fileAlt);
}

moduleAlias.addAlias('@jupyter-widgets/base', (fromPath, request, alias) => {
  return `${__dirname}/modules/jupyter-widget/mock-widget-base.js`;
});
moduleAlias.addAlias('react-map-gl/dist/esm/mapbox/mapbox', (fromPath, request, alias) => {
  return path.resolve(`${__dirname}/../node_modules/react-map-gl/dist/es5/mapbox/mapbox`);
});
useEsmModule('@mapbox/tiny-sdf', '@mapbox/tiny-sdf/index.js');
[
  'd3-array',
  'd3-color',
  'd3-format',
  'd3-interpolate',
  'd3-scale',
  'd3-time',
  'd3-time-format'
].map(pkg => useEsmModule(pkg, `${pkg}/dist/${pkg}.js`));

const {gl} = require('@deck.gl/test-utils');
// Create a dummy canvas for the headless gl context
const canvas = globalThis.document.createElement('canvas');
canvas.width = gl.drawingBufferWidth;
canvas.height = gl.drawingBufferHeight;
gl.canvas = canvas;

require('./modules');
