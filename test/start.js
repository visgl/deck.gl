// Launch script for various Node test configurations

// Enables ES2015 import/export in Node.js
require('reify');

require('../aliases');

/* global process */
const path = require('path');
const moduleAlias = require('module-alias');

const mode = process.argv.length >= 3 ? process.argv[2] : 'default';
console.log(`Running ${mode} tests...`); // eslint-disable-line

switch (mode) {
  case 'render':
    {
      // This is the script that runs in Node.js and starts the browser
      const {RenderTestDriver} = require('deck.gl-test-utils');
      new RenderTestDriver().run({
        process: 'webpack-dev-server',
        parameters: ['--env.render']
      });
    }
    break;

  case 'render-react':
    {
      // This is the script that runs in Node.js and starts the browser
      const {RenderTestDriver} = require('deck.gl-test-utils');
      new RenderTestDriver().run({
        process: 'webpack-dev-server',
        parameters: ['--env.render-react']
      });
    }
    break;

  case 'bench':
    require('luma.gl/headless');
    require('./bench/index'); // Run the benchmarks
    break;

  case 'test-ci':
    require('luma.gl/headless');
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

  case 'test-dist':
    // Load deck.gl itself from the dist folder
    moduleAlias.addAlias('deck.gl', path.resolve('./dist'));
    require('luma.gl/headless');
    require('./src/index'); // Run the tests
    break;

  case 'test':
  default:
    require('luma.gl/headless');
    require('./src/index'); // Run the tests
    break;
}
