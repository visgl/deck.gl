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

import {LayerExtension} from '@deck.gl/core';
import {shaderModule, shaderModule64} from './shader-module';
import * as aggregator from './aggregator';
import {readPixelsToArray, clear} from '@luma.gl/core';
import GL from '@luma.gl/constants';

const defaultProps = {
  getFilterValue: {type: 'accessor', value: 0},
  onFilteredItemsChange: {type: 'function', value: null, compare: false},

  filterEnabled: true,
  filterRange: [-1, 1],
  filterSoftRange: null,
  filterTransformSize: true,
  filterTransformColor: true
};

const DATA_TYPE_FROM_SIZE = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

export default class DataFilterExtension extends LayerExtension {
  constructor({filterSize = 1, fp64 = false, countItems = false} = {}) {
    if (!DATA_TYPE_FROM_SIZE[filterSize]) {
      throw new Error('filterSize out of range');
    }

    super({filterSize, fp64, countItems});
  }

  getShaders(extension) {
    const {filterSize, fp64} = extension.opts;

    return {
      modules: [fp64 ? shaderModule64 : shaderModule],
      defines: {
        DATAFILTER_TYPE: DATA_TYPE_FROM_SIZE[filterSize],
        DATAFILTER_DOUBLE: Boolean(fp64)
      }
    };
  }

  initializeState(context, extension) {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.add({
        filterValues: {
          size: extension.opts.filterSize,
          type: extension.opts.fp64 ? GL.DOUBLE : GL.FLOAT,
          accessor: 'getFilterValue',
          shaderAttributes: {
            filterValues: {
              divisor: 0
            },
            instanceFilterValues: {
              divisor: 1
            }
          }
        }
      });
    }

    const {gl} = this.context;
    if (attributeManager && extension.opts.countItems) {
      const useFloatTarget = aggregator.supportsFloatTarget(gl);
      // This attribute is needed for variable-width data, e.g. Path, SolidPolygon, Text
      // The vertex shader checks if a vertex has the same "index" as the previous vertex
      // so that we only write one count cross multiple vertices of the same object
      attributeManager.add({
        filterIndices: {
          size: useFloatTarget ? 1 : 2,
          vertexOffset: 1,
          type: GL.UNSIGNED_BYTE,
          normalized: true,
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

      const filterFBO = aggregator.getFramebuffer(gl, useFloatTarget);
      const filterModel = aggregator.getModel(gl, extension.getShaders(extension), useFloatTarget);
      this.setState({filterFBO, filterModel});
    }
  }

  updateState({props, oldProps}) {
    if (this.state.filterModel) {
      const attributeManager = this.getAttributeManager();
      const filterNeedsUpdate =
        attributeManager.attributes.filterValues.needsUpdate() ||
        props.filterEnabled !== oldProps.filterEnabled ||
        props.filterRange !== oldProps.filterRange ||
        props.filterSoftRange !== oldProps.filterSoftRange;
      if (filterNeedsUpdate) {
        this.setState({filterNeedsUpdate});
      }
    }
  }

  draw(params, extension) {
    const {filterFBO, filterModel, filterNeedsUpdate} = this.state;
    const {onFilteredItemsChange} = this.props;
    if (filterNeedsUpdate && onFilteredItemsChange && filterModel) {
      const {
        attributes: {filterValues, filterIndices}
      } = this.getAttributeManager();
      filterModel.setVertexCount(this.getNumInstances());

      const {gl} = this.context;
      clear(gl, {framebuffer: filterFBO, color: [0, 0, 0, 0]});

      filterModel
        .updateModuleSettings(params.moduleParameters)
        .setAttributes({
          ...filterValues.getShaderAttributes(),
          ...(filterIndices && filterIndices.getShaderAttributes())
        })
        .draw({
          framebuffer: filterFBO,
          parameters: {
            ...aggregator.parameters,
            viewport: [0, 0, filterFBO.width, filterFBO.height]
          }
        });
      const color = readPixelsToArray(filterFBO);
      let count = 0;
      for (let i = 0; i < color.length; i++) {
        count += color[i];
      }
      onFilteredItemsChange({id: this.id, count});

      this.state.filterNeedsUpdate = false;
    }
  }

  finalizeState() {
    const {filterFBO, filterModel} = this.state;
    if (filterFBO) {
      filterFBO.color.delete();
      filterFBO.delete();
      filterModel.delete();
    }
  }
}

DataFilterExtension.extensionName = 'DataFilterExtension';
DataFilterExtension.defaultProps = defaultProps;
