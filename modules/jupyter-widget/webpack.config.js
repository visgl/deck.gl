const path = require('path');
const version = require('./package.json').version;

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

module.exports = [
  {
    // Notebook extension
    entry: './src/extension.js',
    output: {
      filename: 'extension.js',
      path: path.resolve(__dirname, 'dist', 'pydeck_embeddable'),
      libraryTarget: 'amd'
    }
  },
  {
    // Jupyter bundle for the notebook
    entry: './src/notebook.js',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist', 'pydeck_embeddable'),
      libraryTarget: 'amd'
    },
    devtool: 'source-map',
    module: {
      rules
    },
    externals: ['@jupyter-widgets/base']
  },
  {
    // embeddable bundle
    entry: './src/embed.js',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist', 'pydeck_embeddable'),
      libraryTarget: 'amd',
      publicPath: `https://unpkg.com/deckgl-widget@${version}/dist/`
    },
    devtool: 'source-map',
    module: {
      rules
    },
    externals: ['@jupyter-widgets/base']
  }
];
