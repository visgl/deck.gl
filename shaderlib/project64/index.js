/* eslint-disable */
var fs = require('fs');
module.exports = {
  project64: {
  	interface: 'project64',
  	source: fs.readFileSync(__dirname + '/project64.glsl', 'utf8')
  }
};
