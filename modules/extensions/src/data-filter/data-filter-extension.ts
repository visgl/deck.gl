// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer, type Framebuffer} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import type {Layer, LayerContext, Accessor, UpdateParameters} from '@deck.gl/core';
import {LayerExtension, log} from '@deck.gl/core';
import {CategoryBitMask, DataFilterModuleProps, Defines} from './shader-module';
import * as aggregator from './aggregator';
import {createDataFilterPlugin} from './shader-plugin';
import {
  addDataFilterAttributes,
  addDataFilterCountingAttributes,
  updateDataFilterCategoryAttributes,
  getDataFilterCategoryKey
} from './attributes';
import {NumberArray4} from '@math.gl/core';

const defaultProps = {
  getFilterValue: {type: 'accessor', value: 0},
  getFilterCategory: {type: 'accessor', value: 0},
  onFilteredItemsChange: {type: 'function', value: null, optional: true, ignore: false},

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
  filterRange?: Readonly<[number, number]> | Readonly<[number, number]>[];
  /**
   * If specified, objects will be faded in/out instead of abruptly shown/hidden.
   * When the filtered value is outside of the bounds defined by `filterSoftRange` but still within the bounds defined by `filterRange`, the object will be rendered as "faded."
   * @default null
   */
  filterSoftRange?: Readonly<[number, number]> | Readonly<[number, number]>[] | null;
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
  filterCategories?: FilterCategory[] | FilterCategory[][];
  /**
   * Only called if the `countItems` option is enabled. WebGPU delivers results asynchronously;
   * results superseded by a filter or data update are discarded.
   */
  onFilteredItemsChange?: (evt: {
    /** The id of the source layer. */
    id: string;
    /** The number of data objects that pass the filter. */
    count: number;
  }) => void;
};

export type DataFilterExtensionOptions = {
  /**
   * The size of the category filter (number of columns to filter by). The category filter can show/hide data based on 1-4 properties of each object. Set to `0` to disable category filtering.
   * @default 0
   */
  categorySize?: 0 | 1 | 2 | 3 | 4;
  /**
   * The size of the filter (number of columns to filter by). The data filter can show/hide data based on 1-4 numeric properties of each object. Set to `0` to disable numeric filtering.
   * @default 1
   */
  filterSize?: 0 | 1 | 2 | 3 | 4;
  /**
   * Use 64-bit precision instead of 32-bit.
   * @default false
   */
  fp64?: boolean;
  /**
   * If `true`, reports the number of filtered objects with the `onFilteredItemsChange` callback.
   * WebGPU reports counts asynchronously after GPU readback.
   * @default `false`.
   */
  countItems?: boolean;
};

const defaultOptions: Required<DataFilterExtensionOptions> = {
  categorySize: 0,
  filterSize: 1,
  fp64: false,
  countItems: false
};

const CATEGORY_TYPE_FROM_SIZE = {
  1: 'uint' as const,
  2: 'uvec2' as const,
  3: 'uvec3' as const,
  4: 'uvec4' as const
};
const DATA_TYPE_FROM_SIZE = {
  1: 'float' as const,
  2: 'vec2' as const,
  3: 'vec3' as const,
  4: 'vec4' as const
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
    const defines: Defines = {};
    if (categorySize) {
      defines.DATACATEGORY_TYPE = CATEGORY_TYPE_FROM_SIZE[categorySize];
      defines.DATACATEGORY_CHANNELS = categorySize;
    }
    if (filterSize) {
      defines.DATAFILTER_TYPE = DATA_TYPE_FROM_SIZE[filterSize];
      defines.DATAFILTER_DOUBLE = Boolean(fp64);
    }

    return {plugins: [createDataFilterPlugin(extension.opts)], defines};
  }

  initializeState(this: Layer<DataFilterExtensionProps>, context: LayerContext, extension: this) {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      addDataFilterAttributes(attributeManager, extension.opts, (category, channel) =>
        extension._getCategoryKey.call(this, category, channel)
      );
    }

    const {device} = this.context;
    if (attributeManager && extension.opts.countItems) {
      const useFloatTarget = device.type === 'webgl' && aggregator.supportsFloatTarget(device);
      addDataFilterCountingAttributes(attributeManager, useFloatTarget, device.type === 'webgpu');

      const filterFBO = aggregator.getFramebuffer(device, useFloatTarget);
      const filterModel = aggregator.getModel(
        device,
        attributeManager.getBufferLayouts({isInstanced: false}),
        {
          ...extension.getShaders.call(this, extension),
          shaderAssembler: this.context.shaderAssembler
        },
        useFloatTarget
      );
      this.setState({filterFBO, filterModel, filterNeedsUpdate: true, filterCountVersion: 0});
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
        attributeManager!.attributes.filterValues?.needsUpdate() ||
        attributeManager!.attributes.filterCategoryValues?.needsUpdate() ||
        changeFlags.dataChanged ||
        (Boolean(props.onFilteredItemsChange) && !oldProps.onFilteredItemsChange) ||
        props.filterEnabled !== oldProps.filterEnabled ||
        props.filterRange !== oldProps.filterRange ||
        props.filterSoftRange !== oldProps.filterSoftRange ||
        props.filterCategories !== oldProps.filterCategories;
      if (filterNeedsUpdate) {
        this.setState({
          filterNeedsUpdate,
          filterCountVersion: Number(this.state.filterCountVersion) + 1
        });
      }
    }
    updateDataFilterCategoryAttributes(this, {props, oldProps, changeFlags}, categorySize);
  }

  // eslint-disable-next-line max-statements
  draw(this: Layer<DataFilterExtensionProps>, params: any, extension: this) {
    const filterFBO = this.state.filterFBO as Framebuffer;
    const filterModel = this.state.filterModel as Model;
    const filterNeedsUpdate = this.state.filterNeedsUpdate as boolean;

    if (!this.state.categoryBitMask) {
      extension._updateCategoryBitMask.call(this, params, extension);
    }

    const {
      onFilteredItemsChange,
      extensions,
      filterEnabled,
      filterRange,
      filterSoftRange,
      filterTransformSize,
      filterTransformColor,
      filterCategories
    } = this.props;
    const dataFilterProps: DataFilterModuleProps = {
      extensions,
      filterEnabled,
      filterRange,
      filterSoftRange,
      filterTransformSize,
      filterTransformColor,
      filterCategories
    };
    if (this.state.categoryBitMask) {
      dataFilterProps.categoryBitMask = this.state.categoryBitMask as CategoryBitMask;
    }
    this.setShaderModuleProps({dataFilter: dataFilterProps});

    /* eslint-disable-next-line camelcase */
    if (filterNeedsUpdate && onFilteredItemsChange && filterModel) {
      const attributeManager = this.getAttributeManager()!;
      const {
        attributes: {filterValues, filterCategoryValues, filterVertexIndices}
      } = attributeManager;
      filterModel.setVertexCount(this.getNumInstances());

      const filterAttributes = [filterValues, filterCategoryValues, filterVertexIndices].filter(
        Boolean
      );
      filterModel.setBufferLayout(
        filterAttributes.map(attribute => attribute.getBufferLayout({isInstanced: false}))
      );
      const attributes: Record<string, Buffer> = {};
      const constants = {};
      for (const attribute of filterAttributes) {
        for (const [name, value] of Object.entries(attribute.getValue())) {
          if (value instanceof Buffer) attributes[name] = value;
          else constants[name] = value;
        }
      }
      filterModel.setAttributes(attributes);
      filterModel.setConstantAttributes(constants);
      filterModel.shaderInputs.setProps({
        dataFilter: dataFilterProps
      });

      const viewport = [0, 0, filterFBO.width, filterFBO.height] as NumberArray4;

      // Extension draw runs inside the layer pass; count on a separate encoder.
      const commandEncoder = filterModel.device.createCommandEncoder();
      const renderPass = commandEncoder.beginRenderPass({
        id: 'data-filter-aggregation',
        framebuffer: filterFBO,
        parameters: {viewport},
        clearColor: [0, 0, 0, 0]
      });
      filterModel.setParameters(aggregator.parameters);
      const didDraw = filterModel.draw(renderPass);
      renderPass.end();
      filterModel.device.submit(commandEncoder.finish());

      if (!didDraw) {
        this.setNeedsRedraw();
        return;
      }

      this.state.filterNeedsUpdate = false;
      const state = this.state;
      const version = state.filterCountVersion;
      const reportCount = (color: ArrayLike<number>) => {
        if (state.filterModel !== filterModel || state.filterCountVersion !== version) return;
        let count = 0;
        for (let i = 0; i < color.length; i++) count += color[i];
        // Callback identity may change while readback is pending without changing the count.
        this.getCurrentLayer()?.props.onFilteredItemsChange?.({id: this.id, count});
      };
      if (filterModel.device.type === 'webgpu') {
        const texture = filterFBO.colorAttachments[0].texture;
        const readback = filterModel.device.createBuffer({
          id: 'data-filter-count-readback',
          byteLength: texture.computeMemoryLayout().byteLength,
          usage: Buffer.COPY_DST | Buffer.MAP_READ
        });
        texture.readBuffer({}, readback);
        void readback
          .readAsync()
          .then(reportCount)
          .catch(error => {
            if (state.filterModel === filterModel)
              this.raiseError(error, 'counting filtered items');
          })
          .finally(() => readback.destroy());
      } else {
        reportCount(filterModel.device.readPixelsToArrayWebGL(filterFBO));
      }
    }
  }

  finalizeState(this: Layer<DataFilterExtensionProps>) {
    const filterFBO = this.state.filterFBO as Framebuffer;
    const filterModel = this.state.filterModel as Model;

    this.state.filterModel = null;
    filterFBO?.colorAttachments[0].texture.destroy();
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
    if (!categorySize) return;
    const {filterCategories} = this.props;
    const categoryBitMask: CategoryBitMask = new Uint32Array([0, 0, 0, 0]);
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
    this.state.categoryBitMask = categoryBitMask;
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
    return getDataFilterCategoryKey(this, category, channel);
  }
}
