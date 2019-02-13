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

export class LayerExtension {
  constructor(opts) {
    this.opts = opts;
  }

  getDefaultProps() {
    return {};
  }

  getShaders(layer) {
    return {};
  }

  initializeState(layer, params) {}

  updateState(layer, params) {}
}

export function extendLayer(Layer, ...extensions) {
  class NewLayer extends Layer {
    getShaders() {
      const shaders = super.getShaders();
      shaders.modules = shaders.modules || [];
      shaders.inject = shaders.inject || {};
      shaders.defines = shaders.defines || {};

      for (const extension of extensions) {
        const extShaders = extension.getShaders(this);
        if (extShaders.modules) {
          shaders.modules.push(...extShaders.modules);
        }
        Object.assign(shaders.inject, extShaders.inject);
        Object.assign(shaders.defines, extShaders.defines);
      }
      return shaders;
    }

    initializeState(params) {
      super.initializeState(params);

      for (const extension of extensions) {
        extension.initializeState(this, params);
      }
    }

    updateState(params) {
      super.updateState(params);

      for (const extension of extensions) {
        extension.updateState(this, params);
      }
    }
  }

  NewLayer.defaultProps = Object.assign(
    {},
    ...extensions.map(extension => extension.getDefaultProps())
  );
  NewLayer.layerName = extensions.reduce(
    (name, extension) => `${extension.name}${name}`,
    Layer.layerName
  );

  return NewLayer;
}
