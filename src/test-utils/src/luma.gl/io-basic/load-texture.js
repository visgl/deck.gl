import {loadFiles, loadImages} from './load-files';
import {Program, Texture2D} from '../webgl';
import assert from 'assert';

function noop() {}

export function loadTexture(gl, url, opts = {}) {
  const {urls, onProgress = noop} = opts;
  assert(typeof url === 'string', 'loadTexture: url must be string');

  return loadImages(Object.assign({urls, onProgress}, opts)).then(images =>
    images.map((img, i) => {
      return new Texture2D(gl, Object.assign({id: urls[i]}, opts, {data: img}));
    })
  );
}

export function loadProgram(gl, opts = {}) {
  const {vs, fs, onProgress = noop} = opts;
  return loadFiles(Object.assign({urls: [vs, fs], onProgress}, opts)).then(
    ([vsText, fsText]) => new Program(gl, Object.assign({vs: vsText, fs: fsText}, opts))
  );
}

export function loadTextures(gl, opts = {}) {
  const {urls, onProgress = noop} = opts;
  assert(
    urls.every(url => typeof url === 'string'),
    'loadTextures: {urls} must be array of strings'
  );

  return loadImages(Object.assign({urls, onProgress}, opts)).then(images =>
    images.map((img, i) => {
      let params = Array.isArray(opts.parameters) ? opts.parameters[i] : opts.parameters;
      params = params === undefined ? {} : params;
      return new Texture2D(gl, Object.assign({id: urls[i]}, params, {data: img}));
    })
  );
}
