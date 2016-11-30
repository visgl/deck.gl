/* eslint-disable */
var fs = require('fs');
module.exports = {
  project: {
  	interface: 'project',
  	source: fs.readFileSync(__dirname + '/project.glsl', 'utf8')
  }
};
