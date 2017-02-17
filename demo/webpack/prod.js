const config = require('./config');

module.exports = Object.assign(config, {

  output: {
    path: './dist',
    filename: 'bundle.js'
  }

});
