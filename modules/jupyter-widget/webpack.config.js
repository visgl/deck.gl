const {resolve} = require('path');

const ALIASES = require('ocular-dev-tools/config/ocular.config')({
  aliasMode: 'src',
  root: resolve(__dirname, '../..')
}).aliases;

const rules = [
  {
    // Compile ES2015 using babel
    test: /\.js$/,
    loader: 'babel-loader',
    include: /src/,
    options: {
      babelrc: false,
      presets: [['@babel/preset-env', {forceAllTransforms: true}]],
      // all of the helpers will reference the module @babel/runtime to avoid duplication
      // across the compiled output.
      plugins: [
        '@babel/transform-runtime',
        // 'inline-webgl-constants',
        ['remove-glsl-comments', {patterns: ['**/*.glsl.js']}]
      ]
    }
  }
];

const config = [
  {
    /**
     * Embeddable @deck.gl/jupyter-widget bundle
     *
     * Used in JupyterLab (whose entry point is at plugin.js) and Jupyter Notebook alike.
     *
     */
    entry: './src/index.js',
    resolve: {
      alias: ALIASES
    },
    output: {
      filename: 'index.js',
      path: resolve(__dirname, 'dist'),
      libraryTarget: 'amd'
    },
    mode: 'development',
    devtool: 'source-map',
    module: {
      rules
    },
    externals: {
      '@jupyter-widgets/base': false
    },
    plugins: [
      // Uncomment for bundle size debug
      // new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin()
    ]
  },
  // Used for standalone HTML renderer only
  {
    entry: './src/standalone-html-index.js',
    resolve: {
      alias: ALIASES
    },
    output: {
      filename: 'standalone-html-bundle.js',
      path: resolve(__dirname, 'dist'),
      libraryTarget: 'umd'
    },
    devtool: 'source-map',
    module: {
      rules
    },
    plugins: [
      // Uncomment for bundle size debug
      // new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin()
    ]
  }
];

module.exports = config;
