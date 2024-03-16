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

import type {Framebuffer} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import type {Layer, LayerContext, Accessor, UpdateParameters} from '@deck.gl/core';
import {_deepEqual as deepEqual, LayerExtension, log} from '@deck.gl/core';
import {shaderModule, shaderModule64} from './shader-module';
import * as aggregator from './aggregator';

const defaultProps = {
  getFilterValue: {type: 'accessor', value: 0},
  getFilterCategory: {type: 'accessor', value: 0},
  onFilteredItemsChange: {type: 'function', value: null, optional: true},

  filterEnabled: true,
  filterRange: [-1, 1],
  filterSoftRange: null,
  filterCategories: [0],
  filterTransformSize: true,
  filterTransformColor: true
};

type FilterCategory = number | string;

export type DataFilterExtensionProps<DataT = any> = {
  /**
   * Accessor to retrieve the value for each object that it will be filtered by.
   * Returns either a number (if `filterSize: 1`) or an array of numbers.
   */
  getFilterValue?: Accessor<DataT, number | number[]>;
  /**
   * Accessor to retrieve the category (`number | string`) for each object that it will be filtered by.
   * Returns either a single category (if `filterSize: 1`) or an array of categories.
   */
  getFilterCategory?: Accessor<DataT, FilterCategory | FilterCategory[]>;
  /**
   * Enable/disable the data filter. If the data filter is disabled, all objects are rendered.
   * @default true
   */
  filterEnabled?: boolean;
  /**
   * The [min, max] bounds which defines whether an object should be rendered.
   * If an object's filtered value is within the bounds, the object will be rendered; otherwise it will be hidden.
   * @default [-1, 1]
   */
  filterRange?: [number, number] | [number, number][];
  /**
   * If specified, objects will be faded in/out instead of abruptly shown/hidden.
   * When the filtered value is outside of the bounds defined by `filterSoftRange` but still within the bounds defined by `filterRange`, the object will be rendered as "faded."
   * @default null
   */
  filterSoftRange?: [number, number] | [number, number][] | null;
  /**
   * When an object is "faded", manipulate its size so that it appears smaller or thinner. Only works if `filterSoftRange` is specified.
   * @default true
   */
  filterTransformSize?: boolean;
  /**
   * When an object is "faded", manipulate its opacity so that it appears more translucent. Only works if `filterSoftRange` is specified.
   * @default true
   */
  filterTransformColor?: boolean;
  /**
   * The categories which define whether an object should be rendered.
   * @default []
   */
  filterCategories: FilterCategory[] | FilterCategory[][];
  /**
   * Only called if the `countItems` option is enabled.
   */
  onFilteredItemsChange?: (evt: {
    /** The id of the source layer. */
    id: string;
    /** The number of data objects that pass the filter. */
    count: number;
  }) => void;
};

type DataFilterExtensionOptions = {
  /**
   * The size of the category filter (number of columns to filter by). The category filter can show/hide data based on 1-4 properties of each object.
   * @default 1
   */
  categorySize?: 1 | 2 | 3 | 4;
  /**
   * The size of the filter (number of columns to filter by). The data filter can show/hide data based on 1-4 numeric properties of each object.
   * @default 1
   */
  filterSize?: 1 | 2 | 3 | 4;
  /**
   * Use 64-bit precision instead of 32-bit.
   * @default false
   */
  fp64?: boolean;
  /**
   * If `true`, reports the number of filtered objects with the `onFilteredItemsChange` callback.
   * @default `false`.
   */
  countItems?: boolean;
};

const defaultOptions: Required<DataFilterExtensionOptions> = {
  categorySize: 1,
  filterSize: 1,
  fp64: false,
  countItems: false
};

const DATA_TYPE_FROM_SIZE = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

/** Adds GPU-based data filtering functionalities to layers. It allows the layer to show/hide objects based on user-defined properties. */
export default class DataFilterExtension extends LayerExtension<
  Required<DataFilterExtensionOptions>
> {
  static defaultProps = defaultProps;
  static extensionName = 'DataFilterExtension';

  constructor(opts: DataFilterExtensionOptions = {}) {
    super({...defaultOptions, ...opts});
  }

  getShaders(this: Layer<DataFilterExtensionProps>, extension: this): any {
    const {categorySize, filterSize, fp64} = extension.opts;

    return {
      modules: [fp64 ? shaderModule64 : shaderModule],
      defines: {
        DATACATEGORY_TYPE: DATA_TYPE_FROM_SIZE[categorySize],
        DATACATEGORY_CHANNELS: categorySize,
        DATAFILTER_TYPE: DATA_TYPE_FROM_SIZE[filterSize],
        DATAFILTER_DOUBLE: Boolean(fp64)
      }
    };
  }

  initializeState(this: Layer<DataFilterExtensionProps>, context: LayerContext, extension: this) {
    const attributeManager = this.getAttributeManager();
    const {categorySize, filterSize, fp64} = extension.opts;

    if (attributeManager) {
      attributeManager.add({
        filterValues: {
          size: filterSize,
          type: fp64 ? 'float64' : 'float32',
          accessor: 'getFilterValue',
          shaderAttributes: {
            filterValues: {
              divisor: 0
            },
            instanceFilterValues: {
              divisor: 1
            }
          }
        },
        filterCategoryValues: {
          size: categorySize,
          accessor: 'getFilterCategory',
          transform:
            categorySize === 1
              ? d => extension._getCategoryKey.call(this, d, 0)
              : d => d.map((x, i) => extension._getCategoryKey.call(this, x, i)),
          shaderAttributes: {
            filterCategoryValues: {
              divisor: 0
            },
            instanceFilterCategoryValues: {
              divisor: 1
            }
          }
        }
      });
    }

    const {device} = this.context;
    if (attributeManager && extension.opts.countItems) {
      const useFloatTarget = aggregator.supportsFloatTarget(device);
      // This attribute is needed for variable-width data, e.g. Path, SolidPolygon, Text
      // The vertex shader checks if a vertex has the same "index" as the previous vertex
      // so that we only write one count cross multiple vertices of the same object
      attributeManager.add({
        filterIndices: {
          size: useFloatTarget ? 1 : 2,
          vertexOffset: 1,
          type: 'unorm8',
          accessor: (object, {index}) => {
            const i = object && object.__source ? object.__source.index : index;
            return useFloatTarget ? (i + 1) % 255 : [(i + 1) % 255, Math.floor(i / 255) % 255];
          },
          shaderAttributes: {
            filterPrevIndices: {
              vertexOffset: 0
            },
            filterIndices: {
              vertexOffset: 1
            }
          }
        }
      });

      const filterFBO = aggregator.getFramebuffer(device, useFloatTarget);
      const filterModel = aggregator.getModel(
        device,
        extension.getShaders.call(this, extension),
        useFloatTarget
      );
      this.setState({filterFBO, filterModel});
    }
  }

  updateState(
    this: Layer<DataFilterExtensionProps>,
    {props, oldProps, changeFlags}: UpdateParameters<Layer<DataFilterExtensionProps>>,
    extension: this
  ) {
    const attributeManager = this.getAttributeManager();
    const {categorySize} = extension.opts;
    if (this.state.filterModel) {
      const filterNeedsUpdate =
        // attributeManager must be defined for filterModel to be set
        attributeManager!.attributes.filterValues.needsUpdate() ||
        attributeManager!.attributes.filterCategoryValues?.needsUpdate() ||
        props.filterEnabled !== oldProps.filterEnabled ||
        props.filterRange !== oldProps.filterRange ||
        props.filterSoftRange !== oldProps.filterSoftRange ||
        props.filterCategories !== oldProps.filterCategories;
      if (filterNeedsUpdate) {
        this.setState({filterNeedsUpdate});
      }
    }
    if (attributeManager?.attributes.filterCategoryValues) {
      // Update bitmask if accessor or selected categories has changed
      const categoryBitMaskNeedsUpdate =
        attributeManager.attributes.filterCategoryValues.needsUpdate() ||
        !deepEqual(props.filterCategories, oldProps.filterCategories, 2);
      if (categoryBitMaskNeedsUpdate) {
        this.setState({categoryBitMaskNeedsUpdate});
      }

      // Need to recreate category map if categorySize has changed
      const resetCategories = changeFlags.dataChanged;
      if (resetCategories) {
        this.setState({
          categoryMap: Array(categorySize)
            .fill(0)
            .map(() => ({}))
        });
        attributeManager.attributes.filterCategoryValues.setNeedsUpdate('categoryMap');
      }
    }
  }

  draw(this: Layer<DataFilterExtensionProps>, params: any, extension: this) {
    const filterFBO = this.state.filterFBO as Framebuffer;
    const filterModel = this.state.filterModel as Model;
    const filterNeedsUpdate = this.state.filterNeedsUpdate as boolean;
    const categoryBitMaskNeedsUpdate = this.state.categoryBitMaskNeedsUpdate as boolean;

    const {onFilteredItemsChange} = this.props;

    if (categoryBitMaskNeedsUpdate) {
      extension._updateCategoryBitMask.call(this, params, extension);
    }
    if (filterNeedsUpdate && onFilteredItemsChange && filterModel) {
      const {
        attributes: {filterValues, filterCategoryValues, filterIndices}
      } = this.getAttributeManager()!;
      filterModel.setVertexCount(this.getNumInstances());

      this.context.device.clearWebGL({framebuffer: filterFBO, color: [0, 0, 0, 0]});

      filterModel.updateModuleSettings(params.moduleParameters);
      // @ts-expect-error filterValue and filterIndices should always have buffer value
      filterModel.setAttributes({
        ...filterValues.getValue(),
        ...filterCategoryValues?.getValue(),
        ...filterIndices?.getValue()
      });
      filterModel.setUniforms(params.uniforms);
      filterModel.device.withParametersWebGL(
        {
          framebuffer: filterFBO,
          // ts-ignore 'readonly' cannot be assigned to the mutable type '[GLBlendEquation, GLBlendEquation]'
          ...(aggregator.parameters as any),
          viewport: [0, 0, filterFBO.width, filterFBO.height]
        },
        () => {
          filterModel.draw(this.context.renderPass);
        }
      );
      const color = filterModel.device.readPixelsToArrayWebGL(filterFBO);
      let count = 0;
      for (let i = 0; i < color.length; i++) {
        count += color[i];
      }
      onFilteredItemsChange({id: this.id, count});

      this.state.filterNeedsUpdate = false;
    }
  }

  finalizeState(this: Layer<DataFilterExtensionProps>) {
    const filterFBO = this.state.filterFBO as Framebuffer;
    const filterModel = this.state.filterModel as Model;

    // filterFBO.color.delete();
    filterFBO?.destroy();
    filterModel?.destroy();
  }

  /**
   * Updates the bitmask used on the GPU to perform the filter based on the
   * `filterCategories` prop. The mapping between categories and bit in the bitmask
   * is performed by `_getCategoryKey()`
   */
  _updateCategoryBitMask(
    this: Layer<DataFilterExtensionProps>,
    params: any,
    extension: this
  ): void {
    const {categorySize} = extension.opts;
    const {filterCategories} = this.props;
    const categoryBitMask = new Uint32Array([0, 0, 0, 0]);
    const categoryFilters = (
      categorySize === 1 ? [filterCategories] : filterCategories
    ) as FilterCategory[][];
    const maxCategories = categorySize === 1 ? 128 : categorySize === 2 ? 64 : 32;
    for (let c = 0; c < categoryFilters.length; c++) {
      const categoryFilter = categoryFilters[c];
      for (const category of categoryFilter) {
        const key = extension._getCategoryKey.call(this, category, c);
        if (key < maxCategories) {
          const channel = c * (maxCategories / 32) + Math.floor(key / 32);
          categoryBitMask[channel] += Math.pow(2, key % 32); // 1 << key fails for key > 30
        } else {
          log.warn(`Exceeded maximum number of categories (${maxCategories})`)();
        }
      }
    }
    /* eslint-disable-next-line camelcase */
    params.uniforms.filter_categoryBitMask = categoryBitMask;
    this.state.categoryBitMaskNeedsUpdate = false;
  }

  /**
   * Returns an index of bit in the bitmask for a given category. If the category has
   * not yet been assigned a bit, a new one is assigned.
   */
  _getCategoryKey(
    this: Layer<DataFilterExtensionProps>,
    category: FilterCategory,
    channel: number
  ) {
    const categoryMap = (this.state.categoryMap as Record<FilterCategory, number>[])[channel];
    if (!(category in categoryMap)) {
      categoryMap[category] = Object.keys(categoryMap).length;
    }
    return categoryMap[category];
  }
}
