// Launch script for various Node test configurations

// Enables ES2015 import/export in Node.js
require('reify');

require('../../../aliases');

/* global process */

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
    require('./bench-index'); // Run the benchmarks
    break;

  case 'test-dist':
    // Load deck.gl itself from the dist folder
    const path = require('path');
    const moduleAlias = require('module-alias');
    moduleAlias.addAlias('deck.gl/test/data', path.resolve(__dirname, '../../../test/data'));
    moduleAlias.addAlias('deck.gl', path.resolve(__dirname, '../../../dist'));
    require('./test-index'); // Run the tests
    break;

  case 'test':
  default:
    require('./test-index'); // Run the tests
    break;
}
