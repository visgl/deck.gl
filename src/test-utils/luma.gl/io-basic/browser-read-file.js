// A browser implementation of the Node.js `fs.readFile` method

import assert from 'assert';

const window = require('global/window');
const File = window.File;

/**
 * File reader function for the browser, intentionally similar
 * to node's fs.readFile API, however returns a Promise rather than
 * callbacks
 *
 * @param {File|Blob} file  HTML File or Blob object to read as string
 * @returns {Promise.string}  Resolves to a string containing file contents
 */
export function readFile(file) {
  return new Promise((resolve, reject) => {
    try {
      assert(File, 'window.File not defined. Must run under browser.');
      assert(file instanceof File, 'parameter must be a File object');

      const reader = new window.FileReader();

      reader.onerror = e => reject(new Error(getFileErrorMessage(e)));
      reader.onabort = () => reject(new Error('Read operation was aborted.'));
      reader.onload = () => resolve(reader.result);

      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
}

// NOTES ON ERROR HANDLING
//
// Prepared to externalize error message texts
//
// The weird thing about the FileReader API is that the error definitions
// are only available on the error event instance that is passed to the
// handler. Thus we need to create definitions that are avialble outside
// the handler.
//
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader
//
// Side Note: To complicate matters, there are also a DOMError string set on
// filereader object (error property). Not clear how or if these map
// to the event error codes. These strings are not currently used by this api.
//
// https://developer.mozilla.org/en-US/docs/Web/API/DOMError

function getFileErrorMessage(e) {
  // Map event's error codes to static error codes so that we can
  // externalize error code to error message mapping
  switch (e.target.error.code) {
    case e.target.error.NOT_FOUND_ERR:
      return 'File not found';
    case e.target.error.NOT_READABLE_ERR:
      return 'File not readable';
    case e.target.error.ABORT_ERR:
      return 'Aborted';
    case e.target.error.SECURITY_ERR:
      return 'File locked';
    case e.target.error.ENCODING_ERR:
      return 'File too long';
    default:
      return 'Read error';
  }
}
