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

import assert from 'assert';

import {experimental} from 'deck.gl';
const {Deck, MapView} = experimental;

import {getImageFromContext} from './luma.gl/io-basic/browser-image-utils';

function noop() {}

export default class SceneRenderer {
  constructor({scenes, width = 800, height = 450, onSceneRendered, onComplete = noop} = {}) {
    assert(scenes);

    this.width = width;
    this.height = height;
    this.scenes = scenes;
    this.onSceneRendered = onSceneRendered;
    this.onComplete = onComplete;
  }

  _onRenderSceneComplete(scene, {gl}) {
    getImageFromContext(gl)
      .then(image => {
        image.style.mixBlendMode = 'difference';
        return image;
      })
      .then(image => this.onSceneRendered(Object.assign({gl, image}, scene)))
      .then(() => this._renderNextScene())
      .catch(() => this._renderNextScene());
  }

  _renderScene(scene) {
    const {viewState, layers, views} = scene;

    console.log('Rendering new scene with layers', layers); // eslint-disable-line
    this.deckgl.setProps({
      layers,
      views: views || [new MapView()],
      viewState,
      onAfterRender: this._onRenderSceneComplete.bind(this, scene)
    });
  }

  _renderNextScene() {
    if (this.sceneIndex < this.scenes.length) {
      const scene = this.scenes[this.sceneIndex];
      this._renderScene(scene);
      this.sceneIndex++;
    } else {
      this.onComplete();
    }
  }

  run() {
    this.deckgl = new Deck({
      id: 'default-deckgl-overlay',
      layers: [],
      width: this.width,
      height: this.height,
      debug: true,
      autoResizeDrawingBuffer: false,
      useDevicePixels: false
    });

    this.sceneIndex = 0;
    this._renderNextScene();
  }
}
