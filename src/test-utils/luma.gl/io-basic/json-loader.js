import {loadFile} from './browser-load-file';
import {Program} from '../webgl';
import {Model} from '../core';
import {Geometry} from '../geometry';

// Loads a simple JSON format
export function loadModel(gl, opts = {}) {
  return loadFile(opts).then(([file]) => parseModel(gl, Object.assign({file}, opts)));
}

export function parseModel(gl, opts = {}) {
  const {file, program = new Program(gl)} = opts;
  const json = typeof file === 'string' ? parseJSON(file) : file;
  // Remove any attributes so that we can create a geometry
  // TODO - change format to put these in geometry sub object?
  const attributes = {};
  const modelOptions = {};
  for (const key in json) {
    const value = json[key];
    if (Array.isArray(value)) {
      attributes[key] = key === 'indices' ? new Uint16Array(value) : new Float32Array(value);
    } else {
      modelOptions[key] = value;
    }
  }

  return new Model(
    gl,
    Object.assign({program, geometry: new Geometry({attributes})}, modelOptions, opts)
  );
}

function parseJSON(file) {
  try {
    return JSON.parse(file);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error}`);
  }
}
