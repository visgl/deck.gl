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

import {IconLayer} from '@deck.gl/layers';
import vs from './advanced-text-layer-vertex.glsl';
import fs from './advanced-text-layer-fragment.glsl';

// TODO: provide more props
const defaultProps = IconLayer.defaultProps;

export default class TextMultiIconLayer extends IconLayer {
  getShaders() {
    return Object.assign({}, super.getShaders(), {vs, fs});
  }

  draw({uniforms}) {
    const {fontSmoothing, sizeScale} = this.props;

    super.draw({
      uniforms: Object.assign({}, uniforms, {
        // TODO: handle for individual sizes using this.props.getSize()
        smoothing: sizeScale > 0 ? fontSmoothing / sizeScale : 0
      })
    });
  }

  calculateInstanceOffsets(attribute) {
    const {data} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      value[i++] = object.x;
      value[i++] = object.y;
    }
  }
}

TextMultiIconLayer.layerName = 'TextMultiIconLayer';
TextMultiIconLayer.defaultProps = defaultProps;
