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
import {deepEqual} from '../utils/deep-equal';

export default class LayerExtension {
  constructor(opts = {}) {
    this.opts = opts;
  }

  equals(extension) {
    if (this === extension) {
      return true;
    }

    return this.constructor === extension.constructor && deepEqual(this.opts, extension.opts);
  }

  getShaders(extension) {
    return null;
  }

  getSubLayerProps(extension) {
    const {defaultProps = {}} = extension.constructor;
    const newProps = {
      updateTriggers: {}
    };

    /* eslint-disable max-depth */
    for (const key in defaultProps) {
      if (key in this.props) {
        const propDef = defaultProps[key];
        const propValue = this.props[key];
        newProps[key] = propValue;
        if (propDef && propDef.type === 'accessor') {
          newProps.updateTriggers[key] = this.props.updateTriggers[key];
          if (typeof propValue === 'function') {
            newProps[key] = this.getSubLayerAccessor(propValue, true);
          }
        }
      }
    }
    /* eslint-enable max-depth */
    return newProps;
  }

  initializeState(context, extension) {}

  updateState(params, extension) {}

  draw(params, extension) {}

  finalizeState(extension) {}
}
