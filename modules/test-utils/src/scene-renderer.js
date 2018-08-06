// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {Deck, MapView} from 'deck.gl';

import {getImageFromContext} from './luma.gl/io-basic/browser-image-utils';

const GL_VENDOR = 0x1f00;

function noop() {}

function makePromise() {
  let resolve;
  let reject;
  const promise = new Promise((resolve_, reject_) => {
    resolve = resolve_;
    reject = reject_;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}

export default class SceneRenderer {
  constructor({scenes, width = 800, height = 450, onSceneRendered, onComplete = noop} = {}) {
    this.width = width;
    this.height = height;
    this.scenes = scenes;
    this.running = false;
    this.complete = true;
    this.onSceneRendered = onSceneRendered;
    this.onComplete = onComplete;
  }

  run() {
    // TODO - for 5.1 compatibility, remove when 5.2 is released
    this.deckgl = new Deck({
      id: 'default-deckgl-overlay',
      style: {position: 'absolute', left: '0px', top: '0px'},
      layers: [],
      width: this.width,
      height: this.height,
      debug: true,
      useDevicePixels: false,
      onWebGLInitialized: this._onWebGLInitialized.bind(this)
    });

    this.running = true;
    this.complete = false;
    this.sceneIndex = 0;
    this.renderingTimes = 0;
    this.resultReported = false;
    this._renderNextScene();
  }

  stop() {
    this.running = false;
  }

  // PRIVATE METHODS

  _onAfterRender(promise, scene, {gl}) {
    if (this.renderingTimes === 0 && !this.resultReported) {
      this.resultReported = true;
      getImageFromContext(gl)
        .then(image => {
          image.style.mixBlendMode = 'difference';
          const params = Object.assign({gl, image}, scene);
          return this.onSceneRendered(params);
        })
        .then(x => promise.resolve(x))
        .catch(error => promise.reject(error));
    } else {
      promise.resolve();
    }
  }

  _onWebGLInitialized(gl) {
    const vendorMasked = gl.getParameter(GL_VENDOR);
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const vendorUnmasked = ext && gl.getParameter(ext.UNMASKED_VENDOR_WEBGL || GL_VENDOR);
    this.gpuVendor = vendorUnmasked || vendorMasked;
  }

  _renderScene(scene) {
    const {viewState, layers, views, viewports} = scene;
    const promise = makePromise();

    this.deckgl.setProps({
      layers,
      views: views || [new MapView()],
      viewState,
      onAfterRender: this._onAfterRender.bind(this, promise, scene),

      // DEPRECATED - temporary 5.1 compatibility, remove when 5.2 is released
      viewports
    });

    // Render again after a timeout to allow layer to load
    // This time the afterRender function will resolve the promise

    // promise that resolves when scene is rendered
    return promise;
  }

  _getNextSceneIndex(sceneIndex) {
    let nextSceneIndex = sceneIndex;
    while (nextSceneIndex < this.scenes.length) {
      const scene = this.scenes[nextSceneIndex];
      let skip = false;
      if (scene.ignoreGPUs) {
        skip = scene.ignoreGPUs.some(gpu => this.gpuVendor.indexOf(gpu) >= 0);
      }
      if (!skip) {
        break;
      }
      console.log(`Skipping render test ${scene.name} for ${this.gpuVendor} GPU`); // eslint-disable-line
      nextSceneIndex++;
    }
    return nextSceneIndex;
  }

  _renderNextScene() {
    this.sceneIndex = this._getNextSceneIndex(this.sceneIndex);
    const scene = this.scenes[this.sceneIndex];
    if (this.sceneIndex >= this.scenes.length) {
      this.running = false;
    } else if (scene.renderingTimes && scene.renderingTimes > this.renderingTimes) {
      this.renderingTimes++;
    } else {
      this.sceneIndex++;
      this.renderingTimes = 0;
      this.resultReported = false;
    }

    if (this.running) {
      const params = Object.assign({index: this.sceneIndex}, scene);
      console.log('Rendering new scene with layers', params); // eslint-disable-line

      this._renderScene(params)
        .then(() => this._renderNextScene())
        .catch(() => this._renderNextScene());
    } else if (!this.complete) {
      this.complete = true;
      this.onComplete();
    }
  }
}
