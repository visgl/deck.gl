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

/* global setTimeout */
import {experimental} from 'deck.gl';
const {Deck, DeckGLJS, MapView} = experimental;

import {getImageFromContext} from './luma.gl/io-basic/browser-image-utils';

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
    const DeckGL = Deck || DeckGLJS;
    this.deckgl = new DeckGL({
      id: 'default-deckgl-overlay',
      style: {position: 'absolute', left: '0px', top: '0px'},
      layers: [],
      width: this.width,
      height: this.height,
      debug: true,
      autoResizeDrawingBuffer: false,
      useDevicePixels: false
    });

    this.running = true;
    this.complete = false;
    this.sceneIndex = 0;
    this._renderNextScene();
  }

  stop() {
    this.running = false;
  }

  // PRIVATE METHODS

  _onAfterRender(promise, scene, {gl}) {
    getImageFromContext(gl)
      .then(image => {
        image.style.mixBlendMode = 'difference';
        const params = Object.assign({gl, image}, scene);
        return this.onSceneRendered(params);
      })
      .then(x => promise.resolve(x))
      .catch(error => promise.reject(error));
  }

  _renderScene(scene) {
    const {viewState, layers, views, viewports, timeout = 0} = scene;

    const promise = makePromise();

    // Initial render to get layer loading
    this.deckgl.setProps({
      layers,
      views: views || [new MapView()],
      viewState,
      onAfterRender: () => {},

      // DEPRECATED - temporary 5.1 compatibility, remove when 5.2 is released
      viewports
    });

    // Render again after a timeout to allow layer to load
    // This time the afterRender function will resolve the promise
    setTimeout(() => {
      this.deckgl.setProps({
        layers,
        onAfterRender: this._onAfterRender.bind(this, promise, scene)
      });
    }, timeout);

    // promise that resolves when scene is rendered
    return promise;
  }

  _renderNextScene() {
    const scene = this.scenes[this.sceneIndex];
    if (this.sceneIndex >= this.scenes.length) {
      this.running = false;
    } else {
      this.sceneIndex++;
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
