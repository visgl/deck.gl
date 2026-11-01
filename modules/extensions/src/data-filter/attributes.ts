// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {AttributeManager, Layer, UpdateParameters} from '@deck.gl/core';
import {_deepEqual as deepEqual} from '@deck.gl/core';
import type {DataFilterExtensionOptions, DataFilterExtensionProps} from './data-filter-extension';

// Accessors, attribute layout and category invalidation belong to deck.gl.
// These helpers do not create shader modules, models, framebuffers or passes.
export function addDataFilterAttributes(
  attributeManager: AttributeManager,
  {filterSize, categorySize, fp64}: Required<DataFilterExtensionOptions>,
  getCategoryKey: (category: string | number, channel: number) => number
): void {
  if (filterSize) {
    attributeManager.add({
      filterValues: {
        size: filterSize,
        type: fp64 ? 'float64' : 'float32',
        stepMode: 'dynamic',
        accessor: 'getFilterValue'
      }
    });
  }

  if (categorySize) {
    attributeManager.add({
      filterCategoryValues: {
        size: categorySize,
        stepMode: 'dynamic',
        accessor: 'getFilterCategory',
        type: 'uint32',
        transform:
          categorySize === 1
            ? d => getCategoryKey(d, 0)
            : d => d.map((x, i) => getCategoryKey(x, i))
      }
    });
  }
}

export function addDataFilterCountingAttributes(
  attributeManager: AttributeManager,
  useFloatTarget: boolean
): void {
  // This attribute is needed for variable-width data, e.g. Path, SolidPolygon, Text
  // The vertex shader checks if a vertex has the same "index" as the previous vertex
  // so that we only write one count cross multiple vertices of the same object
  attributeManager.add({
    filterVertexIndices: {
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
}

export function updateDataFilterCategoryAttributes(
  layer: Layer<DataFilterExtensionProps>,
  {
    props,
    oldProps,
    changeFlags
  }: Pick<UpdateParameters<Layer<DataFilterExtensionProps>>, 'props' | 'oldProps' | 'changeFlags'>,
  categorySize: number
): void {
  const attributeManager = layer.getAttributeManager();
  if (attributeManager?.attributes.filterCategoryValues) {
    // Update bitmask if accessor or selected categories has changed
    const categoryBitMaskNeedsUpdate =
      attributeManager.attributes.filterCategoryValues.needsUpdate() ||
      !deepEqual(props.filterCategories, oldProps.filterCategories, 2);
    if (categoryBitMaskNeedsUpdate) {
      layer.setState({categoryBitMask: null});
    }

    // Need to recreate category map if categorySize has changed
    const resetCategories = changeFlags.dataChanged;
    if (resetCategories) {
      layer.setState({
        categoryMap: Array(categorySize)
          .fill(0)
          .map(() => ({}))
      });
      attributeManager.attributes.filterCategoryValues.setNeedsUpdate('categoryMap');
    }
  }
}

// Category maps remain layer-owned even when an extension instance is shared.
export function getDataFilterCategoryKey(
  layer: Layer<DataFilterExtensionProps>,
  category: string | number,
  channel: number
): number {
  const categoryMap = (layer.state.categoryMap as Record<string | number, number>[])[channel];
  if (!(category in categoryMap)) {
    categoryMap[category] = Object.keys(categoryMap).length;
  }
  return categoryMap[category];
}
