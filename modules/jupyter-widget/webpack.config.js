// File leans heavily on configuration in
// https://github.com/jupyter-widgets/widget-ts-cookiecutter/blob/master/%7B%7Bcookiecutter.github_project_name%7D%7D/webpack.config.js
const path = require('path');
const packageVersion = require('./package.json').version;
const webpack = require('webpack');

const config = {
  /**
   * Embeddable @deck.gl/jupyter-widget bundle
   *
   * This bundle is almost identical to the notebook extension bundle. The only
   * difference is in the configuration of the webpack public path for the
   * static assets.
   *
   * The target bundle is always `dist/index.js`, which is the path required by
   * the custom widget embedder.
   */
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'amd'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        // Compile ES2015 using babel
        test: /\.js$/,
        loader: 'babel-loader',
        include: /src/,
        options: {
          presets: [['@babel/preset-env', {forceAllTransforms: true}]],
          // all of the helpers will reference the module @babel/runtime to avoid duplication
          // across the compiled output.
          plugins: [
            '@babel/transform-runtime',
            'inline-webgl-constants',
            ['remove-glsl-comments', {patterns: ['**/*.glsl.js']}]
          ]
        }
      }
    ]
  },
  // Packages that shouldn't be bundled but loaded at runtime
  externals: [
    '@jupyter-widgets/base',
    'deck.gl',
    'mapbox-gl',
    'h3',
    's2Geometry',
    'loaders.gl/csv'
  ],
  plugins: [
    // Uncomment for bundle size debug
    // new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin()
  ]
};

module.exports = env => {
  if (env && env.dev) {
    config.mode = 'development';
    config.devServer = {
      contentBase: path.join(__dirname, 'dist')
    };
  } else {
    config.mode = 'production';
  }

  config.plugins.push(
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(packageVersion)
    })
  );

  return config;
};
