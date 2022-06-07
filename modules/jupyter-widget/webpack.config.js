const {resolve} = require('path');
const {getOcularConfig} = require('ocular-dev-tools');

const ALIASES = getOcularConfig({
  aliasMode: 'src',
  root: resolve(__dirname, '../..')
}).aliases;

const rules = [
  {
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  },
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

const config = {
  /**
   * Embeddable @deck.gl/jupyter-widget bundle
   *
   * Used in JupyterLab (whose entry point is at plugin.js) and Jupyter Notebook alike.
   *
   */
  resolve: {
    alias: ALIASES,
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  devtool: 'eval-source-map',
  module: {
    rules
  }
};

module.exports = config;
