import {isBrowser} from '../utils/globals';
export {setPathPrefix} from './path-prefix';

// Call a require based helper to select platform to export
if (isBrowser) {
  module.exports.loadFile = require('./browser-request-file');
  module.exports.loadImage = require('./browser-request-image');
  module.exports.readFile = require('./browser-read-file');
  const imageUtils = require('./browser-image-utils');
  Object.assign(module.exports, imageUtils);
} else {
  const fs = module.require('fs');
  // TODO - needs to be promisified...
  module.exports.readFile = fs && fs.readFile;
}

export {loadFiles, loadImages} from './load-files';
export {loadTextures, loadProgram} from './load-textures';
export {loadModel, parseModel} from './json-loader';
