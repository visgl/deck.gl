// NOTE: To use this example standalone (outside of deck.gl repo)
// delete the local development overrides at the bottom of this file
const {resolve} = require('path');
const webpack = require('webpack');

const BASE_CONFIG = {
  // bundle app.js and everything it imports, recursively.
  entry: {
    app: resolve('./app.js')
  },

  // inline source maps seem to work best
  devtool: '#inline-source-map',

  // suppress warnings about bundle size
  devServer: {stats: {warnings: false}},

  resolve: {
    alias: {
      // From mapbox-gl-js README. Required for non-browserify bundlers (e.g. webpack):
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },

  module: {
    rules: [
      {
        // Transpile to ES5 using buble
        // Mainly needed if your apps want to use JSX (or support old browsers)
        test: /\.js$/,
        loader: 'buble-loader',
        exclude: [/node_modules/],
        options: {
          objectAssign: 'Object.assign', // May need polyfill on old browsers
          transforms: {
            modules: false,      // Webpack will take care of import/exports
            dangerousForOf: true // Use for/of in spite of limitations
          }
        }
      },
      {
        // The example has some JSON data
        test: /\.json$/,
        loader: 'json-loader',
        exclude: [/node_modules/]
      }
    ]
  },

  // Optional: Enables reading mapbox token from environment variable
  plugins: [
    new webpack.EnvironmentPlugin(['MAPBOX_ACCESS_TOKEN', 'MapboxAccessToken'])
  ]
};

// BEGIN DELETE THESE LINES WHEN RUNNING THIS EXAMPLE STANDALONE

// Support for hot reloading changes to the deck.gl library:
const LOCAL_DEVELOPMENT_CONFIG = {
  resolve: {
    alias: {
      // Imports the deck.gl library from the src directory in this repo
      'deck.gl': resolve('../../src'),
      // Important: ensure shared dependencies come from this app's node_modules
      'luma.gl': resolve('./node_modules/luma.gl'),
      react: resolve('./node_modules/react')
    }
  },
  module: {
    rules: [
      {
        // Inline shaders
        test: /\.glsl$/,
        loader: 'raw-loader',
        exclude: [/node_modules/]
      },
      {
        // Needed to inline deck.gl GLSL shaders
        include: [resolve('../../src')],
        loader: 'transform-loader',
        options: 'brfs-babel'
      }
    ]
  }
};

function addLocalDevSettings(config) {
  Object.assign(config.resolve.alias, LOCAL_DEVELOPMENT_CONFIG.resolve.alias);
  config.module.rules = config.module.rules.concat(LOCAL_DEVELOPMENT_CONFIG.module.rules);
  return config;
}

// END DELETE THESE LINES WHEN RUNNING STANDALONE

module.exports = env => {
  const config = BASE_CONFIG;
  if (env && env.local) {
    addLocalDevSettings(config);
  }
  return config;
};
