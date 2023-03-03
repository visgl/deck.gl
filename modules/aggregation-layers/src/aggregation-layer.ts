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

import {
  CompositeLayer,
  AttributeManager,
  LayerDataSource,
  _compareProps as compareProps,
  UpdateParameters,
  CompositeLayerProps
} from '@deck.gl/core';
import {cssToDeviceRatio} from '@luma.gl/core';
import {filterProps} from './utils/prop-utils';

export type AggregationLayerProps<DataT> = CompositeLayerProps & {
  data: LayerDataSource<DataT>;
};

export default abstract class AggregationLayer<
  DataT,
  ExtraPropsT extends {} = {}
> extends CompositeLayer<Required<AggregationLayer<DataT>> & ExtraPropsT> {
  static layerName = 'AggregationLayer';

  state!: CompositeLayer['state'] & {
    ignoreProps?: Record<string, any>;
    dimensions?: any;
  };

  initializeAggregationLayer(dimensions: any) {
    super.initializeState(this.context);

    this.setState({
      // Layer props , when changed doesn't require updating aggregation
      ignoreProps: filterProps((this.constructor as any)._propTypes, dimensions.data.props),
      dimensions
    });
  }

  updateState(opts: UpdateParameters<this>) {
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
    this._updateAttributes();
  }

  updateAttributes(changedAttributes) {
    // Super classes, can refer to state.changedAttributes to determine what
    // attributes changed
    this.setState({changedAttributes});
  }

  getAttributes() {
    return this.getAttributeManager()!.getShaderAttributes();
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

  /**
   * Checks if aggregation is dirty
   * @param {Object} updateOpts - object {props, oldProps, changeFlags}
   * @param {Object} params - object {dimension, compareAll}
   * @param {Object} params.dimension - {props, accessors} array of props and/or accessors
   * @param {Boolean} params.compareAll - when `true` it will include non layer props for comparision
   * @returns {Boolean} - returns true if dimensions' prop or accessor is changed
   **/
  isAggregationDirty(
    updateOpts,
    params: {compareAll?: boolean; dimension?: any} = {}
  ): string | boolean {
    const {props, oldProps, changeFlags} = updateOpts;
    const {compareAll = false, dimension} = params;
    const {ignoreProps} = this.state;
    const {props: dataProps, accessors = []} = dimension;
    const {updateTriggersChanged} = changeFlags;
    if (changeFlags.dataChanged) {
      return true;
    }
    if (updateTriggersChanged) {
      if (updateTriggersChanged.all) {
        return true;
      }
      for (const accessor of accessors) {
        if (updateTriggersChanged[accessor]) {
          return true;
        }
      }
    }
    if (compareAll) {
      if (changeFlags.extensionsChanged) {
        return true;
      }
      // Compare non layer props too (like extension props)
      // ignoreprops refers to all Layer props other than aggregation props that need to be comapred
      return compareProps({
        oldProps,
        newProps: props,
        ignoreProps,
        propTypes: (this.constructor as any)._propTypes
      });
    }
    // Compare props of the dimension
    for (const name of dataProps) {
      if (props[name] !== oldProps[name]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if an attribute is changed
   * @param {String} name - name of the attribute
   * @returns {Boolean} - `true` if attribute `name` is changed, `false` otherwise,
   *                       If `name` is not passed or `undefiend`, `true` if any attribute is changed, `false` otherwise
   **/
  isAttributeChanged(name?: string) {
    const {changedAttributes} = this.state;
    if (!name) {
      // if name not specified return true if any attribute is changed
      return !isObjectEmpty(changedAttributes);
    }
    return changedAttributes && changedAttributes[name] !== undefined;
  }

  // Private

  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.gl, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
}

// Helper methods

// Returns true if given object is empty, false otherwise.
function isObjectEmpty(obj) {
  let isEmpty = true;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const key in obj) {
    isEmpty = false;
    break;
  }
  return isEmpty;
}
