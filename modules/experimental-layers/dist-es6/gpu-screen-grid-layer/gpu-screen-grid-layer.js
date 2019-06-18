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
import { Layer, experimental, WebMercatorViewport } from '@deck.gl/core';
const defaultColorRange = experimental.defaultColorRange;
import GL from 'luma.gl/constants';
import { Model, Geometry, Buffer } from 'luma.gl';
import GPUGridAggregator from '../utils/gpu-grid-aggregator';
import vs from './gpu-screen-grid-layer-vertex.glsl';
import fs from './gpu-screen-grid-layer-fragment.glsl';
import assert from 'assert';
const DEFAULT_MINCOLOR = [0, 0, 0, 0];
const DEFAULT_MAXCOLOR = [0, 255, 0, 255];
const AGGREGATION_DATA_UBO_INDEX = 0;
const COLOR_PROPS = [`minColor`, `maxColor`, `colorRange`, `colorDomain`];
const COLOR_RANGE_LENGTH = 6;
const defaultProps = {
  cellSizePixels: {
    value: 100,
    min: 1
  },
  cellMarginPixels: {
    value: 2,
    min: 0,
    max: 5
  },
  colorDomain: null,
  colorRange: defaultColorRange,
  getPosition: d => d.position,
  getWeight: d => 1,
  gpuAggregation: true
};
export default class GPUScreenGridLayer extends Layer {
  getShaders() {
    return {
      vs,
      fs,
      modules: ['picking']
    };
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    const gl = this.context.gl;
    /* eslint-disable max-len */

    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        update: this.calculateInstancePositions
      },
      instanceCounts: {
        size: 4,
        transition: true,
        accessor: ['getPosition', 'getWeight'],
        update: this.calculateInstanceCounts,
        noAlloc: true
      }
    });
    /* eslint-disable max-len */

    const options = {
      id: `${this.id}-aggregator`,
      shaderCache: this.context.shaderCache
    };
    this.setState({
      model: this._getModel(gl),
      gpuGridAggregator: new GPUGridAggregator(gl, options),
      maxCountBuffer: this._getMaxCountBuffer(gl),
      aggregationData: null
    });

    this._setupUniformBuffer();
  }

  shouldUpdateState({
    changeFlags
  }) {
    return changeFlags.somethingChanged;
  }

  updateState(opts) {
    super.updateState(opts);

    this._updateUniforms(opts);

    if (opts.changeFlags.dataChanged) {
      this._processData();
    }

    const changeFlags = this._getAggregationChangeFlags(opts);

    if (changeFlags) {
      this._updateAggregation(changeFlags);
    }
  }

  draw({
    uniforms
  }) {
    const _this$props$parameter = this.props.parameters,
          parameters = _this$props$parameter === void 0 ? {} : _this$props$parameter;
    const minColor = this.props.minColor || DEFAULT_MINCOLOR;
    const maxColor = this.props.maxColor || DEFAULT_MAXCOLOR; // If colorDomain not specified we use default domain [1, maxCount]
    // maxCount value will be deduced from aggregated buffer in the vertex shader.

    const colorDomain = this.props.colorDomain || [1, 0];
    const _this$state = this.state,
          model = _this$state.model,
          maxCountBuffer = _this$state.maxCountBuffer,
          cellScale = _this$state.cellScale,
          shouldUseMinMax = _this$state.shouldUseMinMax,
          colorRange = _this$state.colorRange;
    uniforms = Object.assign({}, uniforms, {
      minColor,
      maxColor,
      cellScale,
      colorRange,
      colorDomain,
      shouldUseMinMax
    }); // TODO: remove index specification (https://github.com/uber/luma.gl/pull/473)

    maxCountBuffer.bind({
      index: AGGREGATION_DATA_UBO_INDEX
    });
    model.draw({
      uniforms,
      parameters: Object.assign({
        depthTest: false,
        depthMask: false
      }, parameters)
    });
    maxCountBuffer.unbind({
      index: AGGREGATION_DATA_UBO_INDEX
    });
  }

  calculateInstancePositions(attribute, {
    numInstances
  }) {
    const _this$context$viewpor = this.context.viewport,
          width = _this$context$viewpor.width,
          height = _this$context$viewpor.height;
    const cellSizePixels = this.props.cellSizePixels;
    const numCol = this.state.numCol;
    const value = attribute.value,
          size = attribute.size;

    for (let i = 0; i < numInstances; i++) {
      const x = i % numCol;
      const y = Math.floor(i / numCol);
      value[i * size + 0] = x * cellSizePixels / width * 2 - 1;
      value[i * size + 1] = 1 - y * cellSizePixels / height * 2;
      value[i * size + 2] = 0;
    }
  }

  calculateInstanceCounts(attribute, {
    numInstances
  }) {
    const countsBuffer = this.state.countsBuffer;
    attribute.update({
      buffer: countsBuffer
    });
  }

  getPickingInfo({
    info,
    mode
  }) {
    const index = info.index;

    if (index >= 0) {
      let aggregationData = this.state.aggregationData;

      if (!aggregationData) {
        aggregationData = {
          countsData: this.state.countsBuffer.getData(),
          maxCountData: this.state.maxCountBuffer.getData()
        }; // Cache aggregationData to avoid multiple buffer reads.

        this.setState({
          aggregationData
        });
      }

      const _aggregationData = aggregationData,
            countsData = _aggregationData.countsData,
            maxCountData = _aggregationData.maxCountData; // Each instance (one cell) is aggregated into single pixel,
      // Get current instance's aggregation details.

      info.object = GPUGridAggregator.getAggregationData({
        countsData,
        maxCountData,
        pixelIndex: index
      });
    }

    return info;
  } // HELPER Methods


  _getAggregationChangeFlags({
    oldProps,
    props,
    changeFlags
  }) {
    const cellSizeChanged = props.cellSizePixels !== oldProps.cellSizePixels || props.cellMarginPixels !== oldProps.cellMarginPixels;
    const dataChanged = changeFlags.dataChanged;
    const viewportChanged = changeFlags.viewportChanged;

    if (cellSizeChanged || dataChanged || viewportChanged) {
      return {
        cellSizeChanged,
        dataChanged,
        viewportChanged
      };
    }

    return null;
  }

  _getModel(gl) {
    return new Model(gl, Object.assign({}, this.getShaders(), {
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        attributes: {
          vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
        }
      }),
      isInstanced: true,
      shaderCache: this.context.shaderCache
    }));
  } // Creates and returns a Uniform Buffer object to hold maxCount value.


  _getMaxCountBuffer(gl) {
    return new Buffer(gl, {
      target: GL.UNIFORM_BUFFER,
      bytes: 4 * 4,
      // Four floats
      size: 4,
      index: AGGREGATION_DATA_UBO_INDEX
    });
  } // Process 'data' and build positions and weights Arrays.


  _processData() {
    const _this$props = this.props,
          data = _this$props.data,
          getPosition = _this$props.getPosition,
          getWeight = _this$props.getWeight;
    const positions = [];
    const weights = [];

    for (const point of data) {
      const position = getPosition(point);
      positions.push(position[0]);
      positions.push(position[1]);
      weights.push(getWeight(point));
    }

    this.setState({
      positions,
      weights
    });
  } // Set a binding point for the aggregation uniform block index


  _setupUniformBuffer() {
    const gl = this.context.gl;
    const programHandle = this.state.model.program.handle; // TODO: Replace with luma.gl api when ready.

    const uniformBlockIndex = gl.getUniformBlockIndex(programHandle, 'AggregationData');
    gl.uniformBlockBinding(programHandle, uniformBlockIndex, AGGREGATION_DATA_UBO_INDEX);
  }

  _shouldUseMinMax() {
    const _this$props2 = this.props,
          minColor = _this$props2.minColor,
          maxColor = _this$props2.maxColor,
          colorDomain = _this$props2.colorDomain,
          colorRange = _this$props2.colorRange;

    if (minColor || maxColor) {
      return true;
    } // minColor and maxColor not supplied, check if colorRange or colorDomain supplied.
    // NOTE: colorDomain and colorRange are experimental features, use them only when supplied.


    if (colorDomain || colorRange) {
      return false;
    } // None specified, use default minColor and maxColor


    return true;
  }

  _updateAggregation(changeFlags) {
    const attributeManager = this.getAttributeManager();

    if (changeFlags.cellSizeChanged || changeFlags.viewportChanged) {
      this._updateGridParams();

      attributeManager.invalidateAll();
    }

    const _this$props3 = this.props,
          cellSizePixels = _this$props3.cellSizePixels,
          gpuAggregation = _this$props3.gpuAggregation;
    const _this$state2 = this.state,
          positions = _this$state2.positions,
          weights = _this$state2.weights,
          maxCountBuffer = _this$state2.maxCountBuffer,
          countsBuffer = _this$state2.countsBuffer;
    const projectPoints = this.context.viewport instanceof WebMercatorViewport;
    this.state.gpuGridAggregator.run({
      positions,
      weights,
      cellSize: [cellSizePixels, cellSizePixels],
      viewport: this.context.viewport,
      countsBuffer,
      maxCountBuffer,
      changeFlags,
      useGPU: gpuAggregation,
      projectPoints
    }); // Aggregation changed, enforce reading buffer data for picking.

    this.setState({
      aggregationData: null
    });
    attributeManager.invalidate('instanceCounts');
  }

  _updateUniforms({
    oldProps,
    props,
    changeFlags
  }) {
    const newState = {};

    if (COLOR_PROPS.some(key => oldProps[key] !== props[key])) {
      newState.shouldUseMinMax = this._shouldUseMinMax();
    }

    if (oldProps.colorRange !== props.colorRange) {
      const colorRangeUniform = [];
      assert(props.colorRange && props.colorRange.length === COLOR_RANGE_LENGTH);
      props.colorRange.forEach(color => {
        colorRangeUniform.push(color[0], color[1], color[2], color[3] || 255);
      });
      newState.colorRange = colorRangeUniform;
    }

    if (oldProps.cellMarginPixels !== props.cellMarginPixels || oldProps.cellSizePixels !== props.cellSizePixels || changeFlags.viewportChanged) {
      const _this$context$viewpor2 = this.context.viewport,
            width = _this$context$viewpor2.width,
            height = _this$context$viewpor2.height;
      const _this$props4 = this.props,
            cellSizePixels = _this$props4.cellSizePixels,
            cellMarginPixels = _this$props4.cellMarginPixels;
      const margin = cellSizePixels > cellMarginPixels ? cellMarginPixels : 0;
      newState.cellScale = new Float32Array([(cellSizePixels - margin) / width * 2, -(cellSizePixels - margin) / height * 2, 1]);
    }

    this.setState(newState);
  }

  _updateGridParams() {
    const _this$context$viewpor3 = this.context.viewport,
          width = _this$context$viewpor3.width,
          height = _this$context$viewpor3.height;
    const cellSizePixels = this.props.cellSizePixels;
    const gl = this.context.gl;
    const numCol = Math.ceil(width / cellSizePixels);
    const numRow = Math.ceil(height / cellSizePixels);
    const numInstances = numCol * numRow;
    const dataBytes = numInstances * 4 * 4;
    let countsBuffer = this.state.countsBuffer;

    if (countsBuffer) {
      countsBuffer.delete();
    }

    countsBuffer = new Buffer(gl, {
      size: 4,
      bytes: dataBytes,
      type: GL.FLOAT,
      instanced: 1
    });
    this.setState({
      numCol,
      numRow,
      numInstances,
      countsBuffer
    });
  }

}
GPUScreenGridLayer.layerName = 'GPUScreenGridLayer';
GPUScreenGridLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncHUtc2NyZWVuLWdyaWQtbGF5ZXIvZ3B1LXNjcmVlbi1ncmlkLWxheWVyLmpzIl0sIm5hbWVzIjpbIkxheWVyIiwiZXhwZXJpbWVudGFsIiwiV2ViTWVyY2F0b3JWaWV3cG9ydCIsImRlZmF1bHRDb2xvclJhbmdlIiwiR0wiLCJNb2RlbCIsIkdlb21ldHJ5IiwiQnVmZmVyIiwiR1BVR3JpZEFnZ3JlZ2F0b3IiLCJ2cyIsImZzIiwiYXNzZXJ0IiwiREVGQVVMVF9NSU5DT0xPUiIsIkRFRkFVTFRfTUFYQ09MT1IiLCJBR0dSRUdBVElPTl9EQVRBX1VCT19JTkRFWCIsIkNPTE9SX1BST1BTIiwiQ09MT1JfUkFOR0VfTEVOR1RIIiwiZGVmYXVsdFByb3BzIiwiY2VsbFNpemVQaXhlbHMiLCJ2YWx1ZSIsIm1pbiIsImNlbGxNYXJnaW5QaXhlbHMiLCJtYXgiLCJjb2xvckRvbWFpbiIsImNvbG9yUmFuZ2UiLCJnZXRQb3NpdGlvbiIsImQiLCJwb3NpdGlvbiIsImdldFdlaWdodCIsImdwdUFnZ3JlZ2F0aW9uIiwiR1BVU2NyZWVuR3JpZExheWVyIiwiZ2V0U2hhZGVycyIsIm1vZHVsZXMiLCJpbml0aWFsaXplU3RhdGUiLCJhdHRyaWJ1dGVNYW5hZ2VyIiwiZ2V0QXR0cmlidXRlTWFuYWdlciIsImdsIiwiY29udGV4dCIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlUG9zaXRpb25zIiwic2l6ZSIsInVwZGF0ZSIsImNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zIiwiaW5zdGFuY2VDb3VudHMiLCJ0cmFuc2l0aW9uIiwiYWNjZXNzb3IiLCJjYWxjdWxhdGVJbnN0YW5jZUNvdW50cyIsIm5vQWxsb2MiLCJvcHRpb25zIiwiaWQiLCJzaGFkZXJDYWNoZSIsInNldFN0YXRlIiwibW9kZWwiLCJfZ2V0TW9kZWwiLCJncHVHcmlkQWdncmVnYXRvciIsIm1heENvdW50QnVmZmVyIiwiX2dldE1heENvdW50QnVmZmVyIiwiYWdncmVnYXRpb25EYXRhIiwiX3NldHVwVW5pZm9ybUJ1ZmZlciIsInNob3VsZFVwZGF0ZVN0YXRlIiwiY2hhbmdlRmxhZ3MiLCJzb21ldGhpbmdDaGFuZ2VkIiwidXBkYXRlU3RhdGUiLCJvcHRzIiwiX3VwZGF0ZVVuaWZvcm1zIiwiZGF0YUNoYW5nZWQiLCJfcHJvY2Vzc0RhdGEiLCJfZ2V0QWdncmVnYXRpb25DaGFuZ2VGbGFncyIsIl91cGRhdGVBZ2dyZWdhdGlvbiIsImRyYXciLCJ1bmlmb3JtcyIsInByb3BzIiwicGFyYW1ldGVycyIsIm1pbkNvbG9yIiwibWF4Q29sb3IiLCJzdGF0ZSIsImNlbGxTY2FsZSIsInNob3VsZFVzZU1pbk1heCIsIk9iamVjdCIsImFzc2lnbiIsImJpbmQiLCJpbmRleCIsImRlcHRoVGVzdCIsImRlcHRoTWFzayIsInVuYmluZCIsImF0dHJpYnV0ZSIsIm51bUluc3RhbmNlcyIsInZpZXdwb3J0Iiwid2lkdGgiLCJoZWlnaHQiLCJudW1Db2wiLCJpIiwieCIsInkiLCJNYXRoIiwiZmxvb3IiLCJjb3VudHNCdWZmZXIiLCJidWZmZXIiLCJnZXRQaWNraW5nSW5mbyIsImluZm8iLCJtb2RlIiwiY291bnRzRGF0YSIsImdldERhdGEiLCJtYXhDb3VudERhdGEiLCJvYmplY3QiLCJnZXRBZ2dyZWdhdGlvbkRhdGEiLCJwaXhlbEluZGV4Iiwib2xkUHJvcHMiLCJjZWxsU2l6ZUNoYW5nZWQiLCJ2aWV3cG9ydENoYW5nZWQiLCJnZW9tZXRyeSIsImRyYXdNb2RlIiwiVFJJQU5HTEVfRkFOIiwiYXR0cmlidXRlcyIsInZlcnRpY2VzIiwiRmxvYXQzMkFycmF5IiwiaXNJbnN0YW5jZWQiLCJ0YXJnZXQiLCJVTklGT1JNX0JVRkZFUiIsImJ5dGVzIiwiZGF0YSIsInBvc2l0aW9ucyIsIndlaWdodHMiLCJwb2ludCIsInB1c2giLCJwcm9ncmFtSGFuZGxlIiwicHJvZ3JhbSIsImhhbmRsZSIsInVuaWZvcm1CbG9ja0luZGV4IiwiZ2V0VW5pZm9ybUJsb2NrSW5kZXgiLCJ1bmlmb3JtQmxvY2tCaW5kaW5nIiwiX3Nob3VsZFVzZU1pbk1heCIsIl91cGRhdGVHcmlkUGFyYW1zIiwiaW52YWxpZGF0ZUFsbCIsInByb2plY3RQb2ludHMiLCJydW4iLCJjZWxsU2l6ZSIsInVzZUdQVSIsImludmFsaWRhdGUiLCJuZXdTdGF0ZSIsInNvbWUiLCJrZXkiLCJjb2xvclJhbmdlVW5pZm9ybSIsImxlbmd0aCIsImZvckVhY2giLCJjb2xvciIsIm1hcmdpbiIsImNlaWwiLCJudW1Sb3ciLCJkYXRhQnl0ZXMiLCJkZWxldGUiLCJ0eXBlIiwiRkxPQVQiLCJpbnN0YW5jZWQiLCJsYXllck5hbWUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsS0FBUixFQUFlQyxZQUFmLEVBQTZCQyxtQkFBN0IsUUFBdUQsZUFBdkQ7TUFDT0MsaUIsR0FBcUJGLFksQ0FBckJFLGlCO0FBRVAsT0FBT0MsRUFBUCxNQUFlLG1CQUFmO0FBQ0EsU0FBUUMsS0FBUixFQUFlQyxRQUFmLEVBQXlCQyxNQUF6QixRQUFzQyxTQUF0QztBQUVBLE9BQU9DLGlCQUFQLE1BQThCLDhCQUE5QjtBQUVBLE9BQU9DLEVBQVAsTUFBZSxxQ0FBZjtBQUNBLE9BQU9DLEVBQVAsTUFBZSx1Q0FBZjtBQUNBLE9BQU9DLE1BQVAsTUFBbUIsUUFBbkI7QUFFQSxNQUFNQyxtQkFBbUIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBQXpCO0FBQ0EsTUFBTUMsbUJBQW1CLENBQUMsQ0FBRCxFQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixDQUF6QjtBQUNBLE1BQU1DLDZCQUE2QixDQUFuQztBQUNBLE1BQU1DLGNBQWMsQ0FBRSxVQUFGLEVBQWMsVUFBZCxFQUEwQixZQUExQixFQUF3QyxhQUF4QyxDQUFwQjtBQUNBLE1BQU1DLHFCQUFxQixDQUEzQjtBQUVBLE1BQU1DLGVB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QUlVLGVBQWUsS0FBS3JCLEtBQUwsQ0FBV3FCLFlBQTlCOztBQUNBLFFBQUlBLFlBQUosRUFBa0I7QUFDaEJBLG1CQUFhc0QsTUFBYjtBQUNEOztBQUVEdEQsbUJBQWUsSUFBSXpGLE1BQUosQ0FBVzZCLEVBQVgsRUFBZTtBQUM1QkksWUFBTSxDQURzQjtBQUU1QitFLGFBQU84QixTQUZxQjtBQUc1QkUsWUFBTW5KLEdBQUdvSixLQUhtQjtBQUk1QkMsaUJBQVc7QUFKaUIsS0FBZixDQUFmO0FBT0EsU0FBS3RHLFFBQUwsQ0FBYztBQUNadUMsWUFEWTtBQUVaMEQsWUFGWTtBQUdaOUQsa0JBSFk7QUFJWlU7QUFKWSxLQUFkO0FBTUQ7O0FBcFRtRDtBQXVUdERsRSxtQkFBbUI0SCxTQUFuQixHQUErQixvQkFBL0I7QUFDQTVILG1CQUFtQmIsWUFBbkIsR0FBa0NBLFlBQWxDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7TGF5ZXIsIGV4cGVyaW1lbnRhbCwgV2ViTWVyY2F0b3JWaWV3cG9ydH0gZnJvbSAnQGRlY2suZ2wvY29yZSc7XG5jb25zdCB7ZGVmYXVsdENvbG9yUmFuZ2V9ID0gZXhwZXJpbWVudGFsO1xuXG5pbXBvcnQgR0wgZnJvbSAnbHVtYS5nbC9jb25zdGFudHMnO1xuaW1wb3J0IHtNb2RlbCwgR2VvbWV0cnksIEJ1ZmZlcn0gZnJvbSAnbHVtYS5nbCc7XG5cbmltcG9ydCBHUFVHcmlkQWdncmVnYXRvciBmcm9tICcuLi91dGlscy9ncHUtZ3JpZC1hZ2dyZWdhdG9yJztcblxuaW1wb3J0IHZzIGZyb20gJy4vZ3B1LXNjcmVlbi1ncmlkLWxheWVyLXZlcnRleC5nbHNsJztcbmltcG9ydCBmcyBmcm9tICcuL2dwdS1zY3JlZW4tZ3JpZC1sYXllci1mcmFnbWVudC5nbHNsJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgREVGQVVMVF9NSU5DT0xPUiA9IFswLCAwLCAwLCAwXTtcbmNvbnN0IERFRkFVTFRfTUFYQ09MT1IgPSBbMCwgMjU1LCAwLCAyNTVdO1xuY29uc3QgQUdHUkVHQVRJT05fREFUQV9VQk9fSU5ERVggPSAwO1xuY29uc3QgQ09MT1JfUFJPUFMgPSBbYG1pbkNvbG9yYCwgYG1heENvbG9yYCwgYGNvbG9yUmFuZ2VgLCBgY29sb3JEb21haW5gXTtcbmNvbnN0IENPTE9SX1JBTkdFX0xFTkdUSCA9IDY7XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgY2VsbFNpemVQaXhlbHM6IHt2YWx1ZTogMTAwLCBtaW46IDF9LFxuICBjZWxsTWFyZ2luUGl4ZWxzOiB7dmFsdWU6IDIsIG1pbjogMCwgbWF4OiA1fSxcblxuICBjb2xvckRvbWFpbjogbnVsbCxcbiAgY29sb3JSYW5nZTogZGVmYXVsdENvbG9yUmFuZ2UsXG5cbiAgZ2V0UG9zaXRpb246IGQgPT4gZC5wb3NpdGlvbixcbiAgZ2V0V2VpZ2h0OiBkID0+IDEsXG5cbiAgZ3B1QWdncmVnYXRpb246IHRydWVcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdQVVNjcmVlbkdyaWRMYXllciBleHRlbmRzIExheWVyIHtcbiAgZ2V0U2hhZGVycygpIHtcbiAgICByZXR1cm4ge3ZzLCBmcywgbW9kdWxlczogWydwaWNraW5nJ119O1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZU1hbmFnZXIgPSB0aGlzLmdldEF0dHJpYnV0ZU1hbmFnZXIoKTtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlUG9zaXRpb25zOiB7c2l6ZTogMywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlQ291bnRzOiB7XG4gICAgICAgIHNpemU6IDQsXG4gICAgICAgIHRyYW5zaXRpb246IHRydWUsXG4gICAgICAgIGFjY2Vzc29yOiBbJ2dldFBvc2l0aW9uJywgJ2dldFdlaWdodCddLFxuICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VDb3VudHMsXG4gICAgICAgIG5vQWxsb2M6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG5cbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgaWQ6IGAke3RoaXMuaWR9LWFnZ3JlZ2F0b3JgLFxuICAgICAgc2hhZGVyQ2FjaGU6IHRoaXMuY29udGV4dC5zaGFkZXJDYWNoZVxuICAgIH07XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpLFxuICAgICAgZ3B1R3JpZEFnZ3JlZ2F0b3I6IG5ldyBHUFVHcmlkQWdncmVnYXRvcihnbCwgb3B0aW9ucyksXG4gICAgICBtYXhDb3VudEJ1ZmZlcjogdGhpcy5fZ2V0TWF4Q291bnRCdWZmZXIoZ2wpLFxuICAgICAgYWdncmVnYXRpb25EYXRhOiBudWxsXG4gICAgfSk7XG5cbiAgICB0aGlzLl9zZXR1cFVuaWZvcm1CdWZmZXIoKTtcbiAgfVxuXG4gIHNob3VsZFVwZGF0ZVN0YXRlKHtjaGFuZ2VGbGFnc30pIHtcbiAgICByZXR1cm4gY2hhbmdlRmxhZ3Muc29tZXRoaW5nQ2hhbmdlZDtcbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKG9wdHMpIHtcbiAgICBzdXBlci51cGRhdGVTdGF0ZShvcHRzKTtcblxuICAgIHRoaXMuX3VwZGF0ZVVuaWZvcm1zKG9wdHMpO1xuXG4gICAgaWYgKG9wdHMuY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX3Byb2Nlc3NEYXRhKCk7XG4gICAgfVxuXG4gICAgY29uc3QgY2hhbmdlRmxhZ3MgPSB0aGlzLl9nZXRBZ2dyZWdhdGlvbkNoYW5nZUZsYWdzKG9wdHMpO1xuXG4gICAgaWYgKGNoYW5nZUZsYWdzKSB7XG4gICAgICB0aGlzLl91cGRhdGVBZ2dyZWdhdGlvbihjaGFuZ2VGbGFncyk7XG4gICAgfVxuICB9XG5cbiAgZHJhdyh7dW5pZm9ybXN9KSB7XG4gICAgY29uc3Qge3BhcmFtZXRlcnMgPSB7fX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IG1pbkNvbG9yID0gdGhpcy5wcm9wcy5taW5Db2xvciB8fCBERUZBVUxUX01JTkNPTE9SO1xuICAgIGNvbnN0IG1heENvbG9yID0gdGhpcy5wcm9wcy5tYXhDb2xvciB8fCBERUZBVUxUX01BWENPTE9SO1xuXG4gICAgLy8gSWYgY29sb3JEb21haW4gbm90IHNwZWNpZmllZCB3ZSB1c2UgZGVmYXVsdCBkb21haW4gWzEsIG1heENvdW50XVxuICAgIC8vIG1heENvdW50IHZhbHVlIHdpbGwgYmUgZGVkdWNlZCBmcm9tIGFnZ3JlZ2F0ZWQgYnVmZmVyIGluIHRoZSB2ZXJ0ZXggc2hhZGVyLlxuICAgIGNvbnN0IGNvbG9yRG9tYWluID0gdGhpcy5wcm9wcy5jb2xvckRvbWFpbiB8fCBbMSwgMF07XG4gICAgY29uc3Qge21vZGVsLCBtYXhDb3VudEJ1ZmZlciwgY2VsbFNjYWxlLCBzaG91bGRVc2VNaW5NYXgsIGNvbG9yUmFuZ2V9ID0gdGhpcy5zdGF0ZTtcbiAgICB1bmlmb3JtcyA9IE9iamVjdC5hc3NpZ24oe30sIHVuaWZvcm1zLCB7XG4gICAgICBtaW5Db2xvcixcbiAgICAgIG1heENvbG9yLFxuICAgICAgY2VsbFNjYWxlLFxuICAgICAgY29sb3JSYW5nZSxcbiAgICAgIGNvbG9yRG9tYWluLFxuICAgICAgc2hvdWxkVXNlTWluTWF4XG4gICAgfSk7XG5cbiAgICAvLyBUT0RPOiByZW1vdmUgaW5kZXggc3BlY2lmaWNhdGlvbiAoaHR0cHM6Ly9naXRodWIuY29tL3ViZXIvbHVtYS5nbC9wdWxsLzQ3MylcbiAgICBtYXhDb3VudEJ1ZmZlci5iaW5kKHtpbmRleDogQUdHUkVHQVRJT05fREFUQV9VQk9fSU5ERVh9KTtcbiAgICBtb2RlbC5kcmF3KHtcbiAgICAgIHVuaWZvcm1zLFxuICAgICAgcGFyYW1ldGVyczogT2JqZWN0LmFzc2lnbihcbiAgICAgICAge1xuICAgICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgICAgZGVwdGhNYXNrOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBwYXJhbWV0ZXJzXG4gICAgICApXG4gICAgfSk7XG4gICAgbWF4Q291bnRCdWZmZXIudW5iaW5kKHtpbmRleDogQUdHUkVHQVRJT05fREFUQV9VQk9fSU5ERVh9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zKGF0dHJpYnV0ZSwge251bUluc3RhbmNlc30pIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzLmNvbnRleHQudmlld3BvcnQ7XG4gICAgY29uc3Qge2NlbGxTaXplUGl4ZWxzfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge251bUNvbH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUluc3RhbmNlczsgaSsrKSB7XG4gICAgICBjb25zdCB4ID0gaSAlIG51bUNvbDtcbiAgICAgIGNvbnN0IHkgPSBNYXRoLmZsb29yKGkgLyBudW1Db2wpO1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAwXSA9ICgoeCAqIGNlbGxTaXplUGl4ZWxzKSAvIHdpZHRoKSAqIDIgLSAxO1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAxXSA9IDEgLSAoKHkgKiBjZWxsU2l6ZVBpeGVscykgLyBoZWlnaHQpICogMjtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMl0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlQ291bnRzKGF0dHJpYnV0ZSwge251bUluc3RhbmNlc30pIHtcbiAgICBjb25zdCB7Y291bnRzQnVmZmVyfSA9IHRoaXMuc3RhdGU7XG4gICAgYXR0cmlidXRlLnVwZGF0ZSh7XG4gICAgICBidWZmZXI6IGNvdW50c0J1ZmZlclxuICAgIH0pO1xuICB9XG5cbiAgZ2V0UGlja2luZ0luZm8oe2luZm8sIG1vZGV9KSB7XG4gICAgY29uc3Qge2luZGV4fSA9IGluZm87XG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIGxldCB7YWdncmVnYXRpb25EYXRhfSA9IHRoaXMuc3RhdGU7XG4gICAgICBpZiAoIWFnZ3JlZ2F0aW9uRGF0YSkge1xuICAgICAgICBhZ2dyZWdhdGlvbkRhdGEgPSB7XG4gICAgICAgICAgY291bnRzRGF0YTogdGhpcy5zdGF0ZS5jb3VudHNCdWZmZXIuZ2V0RGF0YSgpLFxuICAgICAgICAgIG1heENvdW50RGF0YTogdGhpcy5zdGF0ZS5tYXhDb3VudEJ1ZmZlci5nZXREYXRhKClcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQ2FjaGUgYWdncmVnYXRpb25EYXRhIHRvIGF2b2lkIG11bHRpcGxlIGJ1ZmZlciByZWFkcy5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YWdncmVnYXRpb25EYXRhfSk7XG4gICAgICB9XG4gICAgICBjb25zdCB7Y291bnRzRGF0YSwgbWF4Q291bnREYXRhfSA9IGFnZ3JlZ2F0aW9uRGF0YTtcbiAgICAgIC8vIEVhY2ggaW5zdGFuY2UgKG9uZSBjZWxsKSBpcyBhZ2dyZWdhdGVkIGludG8gc2luZ2xlIHBpeGVsLFxuICAgICAgLy8gR2V0IGN1cnJlbnQgaW5zdGFuY2UncyBhZ2dyZWdhdGlvbiBkZXRhaWxzLlxuICAgICAgaW5mby5vYmplY3QgPSBHUFVHcmlkQWdncmVnYXRvci5nZXRBZ2dyZWdhdGlvbkRhdGEoe1xuICAgICAgICBjb3VudHNEYXRhLFxuICAgICAgICBtYXhDb3VudERhdGEsXG4gICAgICAgIHBpeGVsSW5kZXg6IGluZGV4XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5mbztcbiAgfVxuXG4gIC8vIEhFTFBFUiBNZXRob2RzXG5cbiAgX2dldEFnZ3JlZ2F0aW9uQ2hhbmdlRmxhZ3Moe29sZFByb3BzLCBwcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgY29uc3QgY2VsbFNpemVDaGFuZ2VkID1cbiAgICAgIHByb3BzLmNlbGxTaXplUGl4ZWxzICE9PSBvbGRQcm9wcy5jZWxsU2l6ZVBpeGVscyB8fFxuICAgICAgcHJvcHMuY2VsbE1hcmdpblBpeGVscyAhPT0gb2xkUHJvcHMuY2VsbE1hcmdpblBpeGVscztcbiAgICBjb25zdCBkYXRhQ2hhbmdlZCA9IGNoYW5nZUZsYWdzLmRhdGFDaGFuZ2VkO1xuICAgIGNvbnN0IHZpZXdwb3J0Q2hhbmdlZCA9IGNoYW5nZUZsYWdzLnZpZXdwb3J0Q2hhbmdlZDtcblxuICAgIGlmIChjZWxsU2l6ZUNoYW5nZWQgfHwgZGF0YUNoYW5nZWQgfHwgdmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICByZXR1cm4ge2NlbGxTaXplQ2hhbmdlZCwgZGF0YUNoYW5nZWQsIHZpZXdwb3J0Q2hhbmdlZH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBfZ2V0TW9kZWwoZ2wpIHtcbiAgICByZXR1cm4gbmV3IE1vZGVsKFxuICAgICAgZ2wsXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFNoYWRlcnMoKSwge1xuICAgICAgICBpZDogdGhpcy5wcm9wcy5pZCxcbiAgICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgICAgZHJhd01vZGU6IEdMLlRSSUFOR0xFX0ZBTixcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICB2ZXJ0aWNlczogbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMCwgMSwgMCwgMCwgMSwgMSwgMCwgMCwgMSwgMF0pXG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgICAgaXNJbnN0YW5jZWQ6IHRydWUsXG4gICAgICAgIHNoYWRlckNhY2hlOiB0aGlzLmNvbnRleHQuc2hhZGVyQ2FjaGVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIC8vIENyZWF0ZXMgYW5kIHJldHVybnMgYSBVbmlmb3JtIEJ1ZmZlciBvYmplY3QgdG8gaG9sZCBtYXhDb3VudCB2YWx1ZS5cbiAgX2dldE1heENvdW50QnVmZmVyKGdsKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoZ2wsIHtcbiAgICAgIHRhcmdldDogR0wuVU5JRk9STV9CVUZGRVIsXG4gICAgICBieXRlczogNCAqIDQsIC8vIEZvdXIgZmxvYXRzXG4gICAgICBzaXplOiA0LFxuICAgICAgaW5kZXg6IEFHR1JFR0FUSU9OX0RBVEFfVUJPX0lOREVYXG4gICAgfSk7XG4gIH1cblxuICAvLyBQcm9jZXNzICdkYXRhJyBhbmQgYnVpbGQgcG9zaXRpb25zIGFuZCB3ZWlnaHRzIEFycmF5cy5cbiAgX3Byb2Nlc3NEYXRhKCkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRQb3NpdGlvbiwgZ2V0V2VpZ2h0fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgcG9zaXRpb25zID0gW107XG4gICAgY29uc3Qgd2VpZ2h0cyA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKHBvaW50KTtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uWzBdKTtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uWzFdKTtcbiAgICAgIHdlaWdodHMucHVzaChnZXRXZWlnaHQocG9pbnQpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtwb3NpdGlvbnMsIHdlaWdodHN9KTtcbiAgfVxuXG4gIC8vIFNldCBhIGJpbmRpbmcgcG9pbnQgZm9yIHRoZSBhZ2dyZWdhdGlvbiB1bmlmb3JtIGJsb2NrIGluZGV4XG4gIF9zZXR1cFVuaWZvcm1CdWZmZXIoKSB7XG4gICAgY29uc3QgZ2wgPSB0aGlzLmNvbnRleHQuZ2w7XG4gICAgY29uc3QgcHJvZ3JhbUhhbmRsZSA9IHRoaXMuc3RhdGUubW9kZWwucHJvZ3JhbS5oYW5kbGU7XG5cbiAgICAvLyBUT0RPOiBSZXBsYWNlIHdpdGggbHVtYS5nbCBhcGkgd2hlbiByZWFkeS5cbiAgICBjb25zdCB1bmlmb3JtQmxvY2tJbmRleCA9IGdsLmdldFVuaWZvcm1CbG9ja0luZGV4KHByb2dyYW1IYW5kbGUsICdBZ2dyZWdhdGlvbkRhdGEnKTtcbiAgICBnbC51bmlmb3JtQmxvY2tCaW5kaW5nKHByb2dyYW1IYW5kbGUsIHVuaWZvcm1CbG9ja0luZGV4LCBBR0dSRUdBVElPTl9EQVRBX1VCT19JTkRFWCk7XG4gIH1cblxuICBfc2hvdWxkVXNlTWluTWF4KCkge1xuICAgIGNvbnN0IHttaW5Db2xvciwgbWF4Q29sb3IsIGNvbG9yRG9tYWluLCBjb2xvclJhbmdlfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG1pbkNvbG9yIHx8IG1heENvbG9yKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gbWluQ29sb3IgYW5kIG1heENvbG9yIG5vdCBzdXBwbGllZCwgY2hlY2sgaWYgY29sb3JSYW5nZSBvciBjb2xvckRvbWFpbiBzdXBwbGllZC5cbiAgICAvLyBOT1RFOiBjb2xvckRvbWFpbiBhbmQgY29sb3JSYW5nZSBhcmUgZXhwZXJpbWVudGFsIGZlYXR1cmVzLCB1c2UgdGhlbSBvbmx5IHdoZW4gc3VwcGxpZWQuXG4gICAgaWYgKGNvbG9yRG9tYWluIHx8IGNvbG9yUmFuZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gTm9uZSBzcGVjaWZpZWQsIHVzZSBkZWZhdWx0IG1pbkNvbG9yIGFuZCBtYXhDb2xvclxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgX3VwZGF0ZUFnZ3JlZ2F0aW9uKGNoYW5nZUZsYWdzKSB7XG4gICAgY29uc3QgYXR0cmlidXRlTWFuYWdlciA9IHRoaXMuZ2V0QXR0cmlidXRlTWFuYWdlcigpO1xuICAgIGlmIChjaGFuZ2VGbGFncy5jZWxsU2l6ZUNoYW5nZWQgfHwgY2hhbmdlRmxhZ3Mudmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl91cGRhdGVHcmlkUGFyYW1zKCk7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcbiAgICB9XG4gICAgY29uc3Qge2NlbGxTaXplUGl4ZWxzLCBncHVBZ2dyZWdhdGlvbn0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3Qge3Bvc2l0aW9ucywgd2VpZ2h0cywgbWF4Q291bnRCdWZmZXIsIGNvdW50c0J1ZmZlcn0gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3QgcHJvamVjdFBvaW50cyA9IHRoaXMuY29udGV4dC52aWV3cG9ydCBpbnN0YW5jZW9mIFdlYk1lcmNhdG9yVmlld3BvcnQ7XG4gICAgdGhpcy5zdGF0ZS5ncHVHcmlkQWdncmVnYXRvci5ydW4oe1xuICAgICAgcG9zaXRpb25zLFxuICAgICAgd2VpZ2h0cyxcbiAgICAgIGNlbGxTaXplOiBbY2VsbFNpemVQaXhlbHMsIGNlbGxTaXplUGl4ZWxzXSxcbiAgICAgIHZpZXdwb3J0OiB0aGlzLmNvbnRleHQudmlld3BvcnQsXG4gICAgICBjb3VudHNCdWZmZXIsXG4gICAgICBtYXhDb3VudEJ1ZmZlcixcbiAgICAgIGNoYW5nZUZsYWdzLFxuICAgICAgdXNlR1BVOiBncHVBZ2dyZWdhdGlvbixcbiAgICAgIHByb2plY3RQb2ludHNcbiAgICB9KTtcblxuICAgIC8vIEFnZ3JlZ2F0aW9uIGNoYW5nZWQsIGVuZm9yY2UgcmVhZGluZyBidWZmZXIgZGF0YSBmb3IgcGlja2luZy5cbiAgICB0aGlzLnNldFN0YXRlKHthZ2dyZWdhdGlvbkRhdGE6IG51bGx9KTtcblxuICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZSgnaW5zdGFuY2VDb3VudHMnKTtcbiAgfVxuXG4gIF91cGRhdGVVbmlmb3Jtcyh7b2xkUHJvcHMsIHByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBjb25zdCBuZXdTdGF0ZSA9IHt9O1xuICAgIGlmIChDT0xPUl9QUk9QUy5zb21lKGtleSA9PiBvbGRQcm9wc1trZXldICE9PSBwcm9wc1trZXldKSkge1xuICAgICAgbmV3U3RhdGUuc2hvdWxkVXNlTWluTWF4ID0gdGhpcy5fc2hvdWxkVXNlTWluTWF4KCk7XG4gICAgfVxuXG4gICAgaWYgKG9sZFByb3BzLmNvbG9yUmFuZ2UgIT09IHByb3BzLmNvbG9yUmFuZ2UpIHtcbiAgICAgIGNvbnN0IGNvbG9yUmFuZ2VVbmlmb3JtID0gW107XG4gICAgICBhc3NlcnQocHJvcHMuY29sb3JSYW5nZSAmJiBwcm9wcy5jb2xvclJhbmdlLmxlbmd0aCA9PT0gQ09MT1JfUkFOR0VfTEVOR1RIKTtcbiAgICAgIHByb3BzLmNvbG9yUmFuZ2UuZm9yRWFjaChjb2xvciA9PiB7XG4gICAgICAgIGNvbG9yUmFuZ2VVbmlmb3JtLnB1c2goY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXSwgY29sb3JbM10gfHwgMjU1KTtcbiAgICAgIH0pO1xuICAgICAgbmV3U3RhdGUuY29sb3JSYW5nZSA9IGNvbG9yUmFuZ2VVbmlmb3JtO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIG9sZFByb3BzLmNlbGxNYXJnaW5QaXhlbHMgIT09IHByb3BzLmNlbGxNYXJnaW5QaXhlbHMgfHxcbiAgICAgIG9sZFByb3BzLmNlbGxTaXplUGl4ZWxzICE9PSBwcm9wcy5jZWxsU2l6ZVBpeGVscyB8fFxuICAgICAgY2hhbmdlRmxhZ3Mudmlld3BvcnRDaGFuZ2VkXG4gICAgKSB7XG4gICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzLmNvbnRleHQudmlld3BvcnQ7XG4gICAgICBjb25zdCB7Y2VsbFNpemVQaXhlbHMsIGNlbGxNYXJnaW5QaXhlbHN9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IG1hcmdpbiA9IGNlbGxTaXplUGl4ZWxzID4gY2VsbE1hcmdpblBpeGVscyA/IGNlbGxNYXJnaW5QaXhlbHMgOiAwO1xuXG4gICAgICBuZXdTdGF0ZS5jZWxsU2NhbGUgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAgICAgKChjZWxsU2l6ZVBpeGVscyAtIG1hcmdpbikgLyB3aWR0aCkgKiAyLFxuICAgICAgICAoLShjZWxsU2l6ZVBpeGVscyAtIG1hcmdpbikgLyBoZWlnaHQpICogMixcbiAgICAgICAgMVxuICAgICAgXSk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuICB9XG5cbiAgX3VwZGF0ZUdyaWRQYXJhbXMoKSB7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gdGhpcy5jb250ZXh0LnZpZXdwb3J0O1xuICAgIGNvbnN0IHtjZWxsU2l6ZVBpeGVsc30gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG5cbiAgICBjb25zdCBudW1Db2wgPSBNYXRoLmNlaWwod2lkdGggLyBjZWxsU2l6ZVBpeGVscyk7XG4gICAgY29uc3QgbnVtUm93ID0gTWF0aC5jZWlsKGhlaWdodCAvIGNlbGxTaXplUGl4ZWxzKTtcbiAgICBjb25zdCBudW1JbnN0YW5jZXMgPSBudW1Db2wgKiBudW1Sb3c7XG4gICAgY29uc3QgZGF0YUJ5dGVzID0gbnVtSW5zdGFuY2VzICogNCAqIDQ7XG4gICAgbGV0IGNvdW50c0J1ZmZlciA9IHRoaXMuc3RhdGUuY291bnRzQnVmZmVyO1xuICAgIGlmIChjb3VudHNCdWZmZXIpIHtcbiAgICAgIGNvdW50c0J1ZmZlci5kZWxldGUoKTtcbiAgICB9XG5cbiAgICBjb3VudHNCdWZmZXIgPSBuZXcgQnVmZmVyKGdsLCB7XG4gICAgICBzaXplOiA0LFxuICAgICAgYnl0ZXM6IGRhdGFCeXRlcyxcbiAgICAgIHR5cGU6IEdMLkZMT0FULFxuICAgICAgaW5zdGFuY2VkOiAxXG4gICAgfSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG51bUNvbCxcbiAgICAgIG51bVJvdyxcbiAgICAgIG51bUluc3RhbmNlcyxcbiAgICAgIGNvdW50c0J1ZmZlclxuICAgIH0pO1xuICB9XG59XG5cbkdQVVNjcmVlbkdyaWRMYXllci5sYXllck5hbWUgPSAnR1BVU2NyZWVuR3JpZExheWVyJztcbkdQVVNjcmVlbkdyaWRMYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=