/* eslint-disable quote-props, no-path-concat, prefer-template */
var fs = require('fs');
module.exports = {
  fp64: {
    interface: 'fp64',
    source: fs.readFileSync(__dirname + '/math-fp64.glsl', 'utf8')
  }
};
