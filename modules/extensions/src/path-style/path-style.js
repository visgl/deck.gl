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

import {LayerExtension, _mergeShaders as mergeShaders} from '@deck.gl/core';
import {dashShaders, offsetShaders} from './shaders.glsl';

const defaultProps = {
  getDashArray: {type: 'accessor', value: [0, 0]},
  getOffset: {type: 'accessor', value: 0},
  dashJustified: false
};

export default class PathStyleExtension extends LayerExtension {
  constructor({dash = false, offset = false} = {}) {
    super({dash, offset});
  }

  isEnabled(layer) {
    return layer.state.pathTesselator;
  }

  getShaders(extension) {
    if (!extension.isEnabled(this)) {
      return null;
    }

    // Merge shader injection
    let result = {};
    if (extension.opts.dash) {
      result = mergeShaders(result, dashShaders);
    }
    if (extension.opts.offset) {
      result = mergeShaders(result, offsetShaders);
    }

    return result;
  }

  initializeState(context, extension) {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager || !extension.isEnabled(this)) {
      // This extension only works with the PathLayer
      return;
    }

    extension.enabled = true;

    if (extension.opts.dash) {
      attributeManager.addInstanced({
        instanceDashArrays: {size: 2, accessor: 'getDashArray'}
      });
    }
    if (extension.opts.offset) {
      attributeManager.addInstanced({
        instanceOffsets: {size: 1, accessor: 'getOffset'}
      });
    }
  }

  updateState(params, extension) {
    if (!extension.isEnabled(this)) {
      return;
    }

    const uniforms = {};

    if (extension.opts.dash) {
      uniforms.dashAlignMode = this.props.dashJustified ? 1 : 0;
    }

    this.state.model.setUniforms(uniforms);
  }
}

PathStyleExtension.extensionName = 'PathStyleExtension';
PathStyleExtension.defaultProps = defaultProps;
