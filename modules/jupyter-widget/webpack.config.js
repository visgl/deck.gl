const {resolve} = require('path');
const webpack = require('webpack');
const {getOcularConfig} = require('ocular-dev-tools');

const ALIASES = getOcularConfig({
  aliasMode: 'src',
  root: resolve(__dirname, '../..')
}).aliases;

const EXTERNALS = ['@jupyter-widgets/base'];
const PACKAGE_ROOT = resolve('.');
const PACKAGE_INFO = require(resolve(PACKAGE_ROOT, 'package.json'));

const rules = [
  {
    // Compile ES2015 using babel
    test: /(\.js|\.ts|\.tsx)$/,
    loader: 'babel-loader',
    include: /src/,
    options: {
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            targets: ['>0.2%', 'not ie 11', 'not dead', 'not chrome 49']
          }
        ],
        '@babel/preset-typescript'
      ],
      // all of the helpers will reference the module @babel/runtime to avoid duplication
      // across the compiled output.
      plugins: [
        '@babel/transform-runtime',
        'inline-webgl-constants',
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
      alias: ALIASES,
      extensions: ['.ts', '.tsx', '.js', '.json']
    },
    output: {
      filename: 'index.js',
      path: resolve(__dirname, 'dist'),
      libraryTarget: 'umd'
    },
    devtool: 'source-map',
    module: {
      rules
    },
    externals: EXTERNALS,
    plugins: [
      // Uncomment for bundle size debug
      // new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin()
      new webpack.DefinePlugin({
        __VERSION__: JSON.stringify(PACKAGE_INFO.version)
      })
    ]
  }
];

module.exports = config;
