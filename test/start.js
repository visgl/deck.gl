// Launch script for various Node test configurations

// Enables ES2015 import/export in Node.js
require('reify');

require('../aliases');

/* global process */
const path = require('path');
const moduleAlias = require('module-alias');

const {BrowserTestDriver} = require('probe.gl/test-utils');

const mode = process.argv.length >= 3 ? process.argv[2] : 'default';
console.log(`Running ${mode} tests...`); // eslint-disable-line

switch (mode) {
  case 'test':
    require('./src/index'); // Run the tests
    break;

  case 'test-dist':
    // Load deck.gl itself from the dist folder
    moduleAlias.addAlias('deck.gl', path.resolve('./dist'));
    require('./src/index'); // Run the tests
    break;

  case 'test-ci':
    // Run a smaller selection of the tests (avoid overwhelming Travis CI)
    require('./src/imports-spec');
    require('./src/core');
    // require('./src/core-layers');
    require('./src/core-layers/polygon-tesselation.spec');
    // require('./core-layers.spec');
    // require('./polygon-layer.spec');
    require('./src/core-layers/geojson.spec');
    // require('./geojson-layer.spec');
    // require('./hexagon-cell-layer.spec');
    // require('./grid-layer.spec');
    // require('./hexagon-layer.spec');
    break;

  case 'test-browser':
    new BrowserTestDriver().run({
      process: 'webpack-dev-server',
      parameters: ['--env.test-browser'],
      exposeFunction: 'testDone'
    });
    break;

  case 'test-render':
  case 'render':
    new BrowserTestDriver().run({
      process: 'webpack-dev-server',
      parameters: ['--env.render'],
      exposeFunction: 'testDone'
    });
    break;

  case 'render-react':
    new BrowserTestDriver().run({
      process: 'webpack-dev-server',
      parameters: ['--env.render-react'],
      exposeFunction: 'testDone'
    });
    break;

  case 'bench':
    require('./bench/index'); // Run the benchmarks
    break;

  default:
    console.error(`Unknown test mode ${mode}`); // eslint-disable-line
}
