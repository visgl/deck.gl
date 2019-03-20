const {resolve, join} = require('path');
const webpack = require('webpack');

const rootDir = join(__dirname, '..');
const libSources = join(rootDir, 'modules');

const ALIASES = require('ocular-dev-tools/config/ocular.config')({
  aliasMode: 'src',
  root: resolve(__dirname, '..')
}).aliases;

// Otherwise modules imported from outside this directory does not compile
// Seems to be a Babel bug
// https://github.com/babel/babel-loader/issues/149#issuecomment-191991686
const BABEL_CONFIG = {
  presets: ['es2015', 'stage-2', 'react'].map(name => require.resolve(`babel-preset-${name}`)),
  plugins: ['transform-decorators-legacy'].map(name => require.resolve(`babel-plugin-${name}`))
};

const COMMON_CONFIG = {
  entry: ['./src/main'],

  devServer: {
    contentBase: [resolve(__dirname, './src/static')]
  },

  output: {
    path: resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },

  module: {
    rules: [
      {
        // Compile ES2015 using bable
        test: /\.js$/,
        loader: 'babel-loader',
        options: BABEL_CONFIG,
        include: [resolve('..'), libSources],
        exclude: [/node_modules/]
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|gif|jpe?g|png)$/,
        loader: 'url-loader'
      }
    ],

    // Uglify seems to be incompatible with mapbox
    // https://github.com/mapbox/mapbox-gl-js/issues/4359#issuecomment-288001933
    noParse: /(mapbox-gl)\.js$/
  },

  resolve: {
    // Prefer local dependencies over root
    modules: [resolve('./node_modules'), resolve('../node_modules')],
    alias: Object.assign({}, ALIASES, {
      'website-examples': resolve('../examples/website'),
      'viewport-mercator-project': resolve('../node_modules/viewport-mercator-project')
    })
  },

  node: {
    fs: 'empty'
  },

  plugins: [
    new webpack.DefinePlugin({
      MapboxAccessToken: `"${process.env.MapboxAccessToken}"` // eslint-disable-line
    })
  ]
};

const addDevConfig = config => {
  config.module.rules.push({
    // Unfortunately, webpack doesn't import library sourcemaps on its own...
    test: /\.js$/,
    use: ['source-map-loader'],
    enforce: 'pre'
  });

  config.devServer.contentBase.push(resolve(__dirname, '../'));

  return Object.assign(config, {
    mode: 'development',
    devtool: 'source-maps',

    plugins: config.plugins.concat([
      // new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        USE_LOCAL_PAGES: true // eslint-disable-line
      }),
      new webpack.DefinePlugin({
        DOCS_DIR: JSON.stringify('.')
      })
    ])
  });
};

const addProdConfig = config => {
  config.plugins = config.plugins.concat(
    new webpack.DefinePlugin({
      DOCS_DIR: JSON.stringify('https://raw.githubusercontent.com/uber/deck.gl/master')
    })
  );

  return Object.assign(config, {
    mode: 'production'
  });
};

module.exports = env => {
  env = env || {};

  let config = COMMON_CONFIG;

  if (env.local) {
    config = addDevConfig(config);
  }

  if (env.prod) {
    config = addProdConfig(config);
  }

  // Enable to debug config
  // console.warn(JSON.stringify(config, null, 2));

  return config;
};
