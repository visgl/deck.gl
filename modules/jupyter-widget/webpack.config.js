// File leans heavily on configuration in
// https://github.com/jupyter-widgets/widget-ts-cookiecutter/blob/master/%7B%7Bcookiecutter.github_project_name%7D%7D/webpack.config.js
const path = require('path');

const rules = [
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
  },
  {
    test: /\.(jpg|png|gif|svg)$/,
    use: ['file-loader']
  }
];

// Packages that shouldn't be bundled but loaded at runtime

function getExternals() {
  const externals = {};

  return [externals, '@jupyter-widgets/base'];
}

const resolve = {
  extensions: ['.webpack.js', '.web.js', '.js']
};

const externals = getExternals();

module.exports = [
  {
    /**
     * Notebook extension
     *
     * This bundle only contains the part of the JavaScript that is run on load of
     * the notebook.
     */
    entry: './src/nb_extension.js',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist', 'pydeck_embeddable'),
      libraryTarget: 'amd'
    },
    devtool: 'source-map',
    module: {
      rules
    },
    externals,
    resolve
  },

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
  {
    entry: './src/index.js',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'amd',
      library: '@deck.gl/jupyter-widget'
    },
    devtool: 'source-map',
    module: {
      rules
    },
    externals,
    plugins: [
      // Uncomment for bundle size debug
      // new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin()
    ],
    resolve
  }
];
