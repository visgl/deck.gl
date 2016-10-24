/* eslint-disable */
var fs = require('fs');
module.exports = {
  project: {
  	interface: 'project',
  	source: fs.readFileSync(__dirname + '/picking.vertex.glsl'),
  	fragmentSource: fs.readFileSync(__dirname + '/picking.fragment.glsl')
  }
};
