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

import {CompositeLayer, AttributeManager, experimental} from '@deck.gl/core';
import {cssToDeviceRatio} from '@luma.gl/core';
const {compareProps} = experimental;

// props when changed results in new uniforms that requires re-aggregation
const UNIFORM_PROPS = [
  // DATA-FILTER extension
  'filterEnabled',
  'filterRange',
  'filterSoftRange',
  'filterTransformSize',
  'filterTransformColor'
];

export default class AggregationLayer extends CompositeLayer {
  initializeState(aggregationProps = []) {
    super.initializeState();
    this.setState({
      aggregationProps: aggregationProps.concat(UNIFORM_PROPS)
    });
  }

  updateState(opts) {
    super.updateState(opts);
    const {changeFlags} = opts;
    if (changeFlags.extensionsChanged) {
      const shaders = this.getShaders({});
      if (shaders && shaders.defines) {
        shaders.defines.NON_INSTANCED_MODEL = 1;
      }
      this.updateShaders(shaders);
    }

    // Explictly call to update attributes as 'CompositeLayer' doesn't call this
    this._updateAttributes(opts.props);
  }

  updateAttributes(changedAttributes) {
    let dataChanged = false;
    // eslint-disable-next-line
    for (const name in changedAttributes) {
      dataChanged = true;
      break;
    }
    this.setState({dataChanged});
  }

  getAttributes() {
    return this.getAttributeManager().getShaderAttributes();
  }

  getModuleSettings() {
    // For regular layer draw this happens during draw cycle (_drawLayersInViewport) not during update cycle
    // For aggregation layers this is called during updateState to update aggregation data
    // NOTE: it is similar to LayerPass._getModuleParameters() but doesn't inlcude `effects` it is not needed for aggregation
    const {viewport, mousePosition, gl} = this.context;
    const moduleSettings = Object.assign(Object.create(this.props), {
      viewport,
      mousePosition,
      pickingActive: 0,
      devicePixelRatio: cssToDeviceRatio(gl)
    });
    return moduleSettings;
  }

  updateShaders(shaders) {
    // Default implemention is empty, subclasses can update their Model objects if needed
  }

  // Private

  _isAggregationDirty(opts) {
    if (this.state.dataChanged || opts.changeFlags.extensionsChanged) {
      return true;
    }
    const {aggregationProps} = this.state;
    const oldProps = {};
    const props = {};
    for (const propName of aggregationProps) {
      oldProps[propName] = opts.oldProps[propName];
      props[propName] = opts.props[propName];
    }
    return Boolean(
      compareProps({oldProps, newProps: props, propTypes: this.constructor._propTypes})
    );
  }

  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.gl, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
}

AggregationLayer.layerName = 'AggregationLayer';
