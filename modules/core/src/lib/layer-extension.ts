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
import type Layer from './layer';
import type CompositeLayer from './composite-layer';
import type {UpdateParameters} from './layer';
import type {LayerContext} from './layer-manager';

export default abstract class LayerExtension<OptionsT = unknown> {
  static defaultProps = {};
  static extensionName = 'LayerExtension';

  static get componentName() {
    return Object.prototype.hasOwnProperty.call(this, 'extensionName') ? this.extensionName : '';
  }

  opts!: OptionsT;

  constructor(opts?: OptionsT) {
    if (opts) {
      this.opts = opts;
    }
  }

  /** Returns true if two extensions are equivalent */
  equals(extension: LayerExtension<OptionsT>): boolean {
    if (this === extension) {
      return true;
    }

    // Compare extensions shallowly
    return this.constructor === extension.constructor && deepEqual(this.opts, extension.opts, 1);
  }

  /** Only called if attached to a primitive layer */
  getShaders(this: Layer, extension: this): any {
    return null;
  }

  /** Only called if attached to a CompositeLayer */
  getSubLayerProps(this: CompositeLayer, extension: this): any {
    const {defaultProps} = extension.constructor as typeof LayerExtension;
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
            newProps[key] = this.getSubLayerAccessor(propValue);
          }
        }
      }
    }
    /* eslint-enable max-depth */
    return newProps;
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  initializeState(this: Layer, context: LayerContext, extension: this): void {}

  updateState(this: Layer, params: UpdateParameters<Layer>, extension: this): void {}

  onNeedsRedraw(this: Layer, extension: this): void {}

  getNeedsPickingBuffer(this: Layer, extension: this): boolean {
    return false;
  }

  draw(this: Layer, params: any, extension: this): void {}

  finalizeState(this: Layer, context: LayerContext, extension: this): void {}
}
