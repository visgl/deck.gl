const devConfig = require('./dev');

module.exports = Object.assign(devConfig, {

  output: {
    path: './dist',
    filename: 'bundle.js'
  },

  devtool: ''

});
