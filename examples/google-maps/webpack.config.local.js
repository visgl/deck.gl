const {resolve} = require('path');
const config = require('./webpack.config');

Object.assign(config.resolve.alias, {
  // Consume deck.gl from this repo, using this example's dependencies
  'deck.gl': resolve('../../dist'),
  'luma.gl': resolve('./node_modules/luma.gl'),
  'viewport-mercator-project': resolve('./node_modules/viewport-mercator-project'),
  react: resolve('./node_modules/react'),
  'autobind-decorator': resolve('./node_modules/autobind-decorator'),
  brfs: resolve('./node_modules/brfs'),
  earcut: resolve('./node_modules/earcut'),
  'geojson-normalize': resolve('./node_modules/geojson-normalize'),
  'lodash.flattendeep': resolve('./node_modules/lodash.flattendeep')
});
