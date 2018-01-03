// A browser implementation of the Node.js `fs` module's `fs.writeFile` method.

import {isBrowser} from '../../utils';

// TODO hack - trick filesaver.js to skip loading under node
/* global global*/
const savedNavigatorExists = 'navigator' in global;
const savedNavigator = global.navigator;
if (!isBrowser) {
  global.navigator = {userAgent: 'MSIE 9.'};
}

// Need to use `require` to ensure our modification of global code above happens first
const saveAs = require('filesaver.js');

if (!isBrowser) {
  if (savedNavigatorExists) {
    global.navigator = savedNavigator;
  } else {
    delete global.navigator;
  }
}
// END hack

const window = require('global/window');
const Blob = window.Blob;

/**
 * File system write function for the browser, similar to Node's fs.writeFile
 *
 * Saves a file by downloading it with the given file name.
 *
 * @param {String} file - file name
 * @param {String|Blob} data - data to be written to file
 * @param {String|Object} options -
 * @param {Function} callback - Standard node (err, data) callback
 * @return {Promise} - promise, can be used instead of callback
 */
export function writeFile(file, data, options, callback = () => {}) {
  // options is optional
  if (callback === undefined && typeof options === 'function') {
    options = undefined;
    callback = options;
  }
  if (typeof data === 'string') {
    data = new Blob(data);
  }
  return new Promise((resolve, reject) => {
    let result;
    try {
      result = saveAs(data, file, options);
    } catch (error) {
      reject(error);
      return callback(error, null);
    }
    resolve();
    return callback(null, result);
  });
}
