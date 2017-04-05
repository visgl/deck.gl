const config = require('./config');
const path = require('path');
// transpile mapbox-gl utils imported by react-map-gl@2
// these files are ES6 and break UglifyJS
config.module.rules.push({
  test: /node_modules\/mapbox-gl\/js.*\.js$/,
  loader: 'babel-loader'
});

module.exports = Object.assign(config, {

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js'
  }

});
