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
  Layer,
  fp64LowPart,
  project32,
  gouraudLighting,
  picking,
  LayerContext,
  LayerProps,
  DefaultProps
} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, CubeGeometry, Buffer} from '@luma.gl/core';
import {fp64arithmetic} from '@luma.gl/shadertools';
import {defaultColorRange, colorRangeToFlatArray} from '../utils/color-utils';
import type {_GPUGridLayerProps} from './gpu-grid-layer';
import vs from './gpu-grid-cell-layer-vertex.glsl';
import fs from './gpu-grid-cell-layer-fragment.glsl';

const COLOR_DATA_UBO_INDEX = 0;
const ELEVATION_DATA_UBO_INDEX = 1;

const defaultProps: DefaultProps<_GPUGridCellLayerProps & LayerProps> = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  elevationScale: {type: 'number', min: 0, value: 1},

  // grid
  gridSize: {type: 'array', value: [1, 1]},
  gridOrigin: {type: 'array', value: [0, 0]},
  gridOffset: {type: 'array', value: [0, 0]},

  cellSize: {type: 'number', min: 0, max: 1000, value: 1000},
  offset: {type: 'array', value: [1, 1]},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  extruded: true,

  material: true // Use lighting module defaults
};

type _GPUGridCellLayerProps = _GPUGridLayerProps<any> & {
  offset: number[];
  gridSize: number[];
  gridOrigin: number[];
  gridOffset: number[];
  colorMaxMinBuffer: Buffer;
  elevationMaxMinBuffer: Buffer;
};

export default class GPUGridCellLayer extends Layer<_GPUGridCellLayerProps> {
  static layerName = 'GPUGridCellLayer';
  static defaultProps = defaultProps;

  getShaders() {
    return super.getShaders({
      vs,
      fs,
      modules: [project32, gouraudLighting, picking, fp64arithmetic]
    });
  }

  initializeState({gl}: LayerContext) {
    const attributeManager = this.getAttributeManager()!;
    attributeManager.addInstanced({
      colors: {
        size: 4,
        noAlloc: true
      },
      elevations: {
        size: 4,
        noAlloc: true
      }
    });
    const model = this._getModel(gl);
    this._setupUniformBuffer(model);
    this.setState({model});
  }

  _getModel(gl: WebGLRenderingContext): Model {
    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new CubeGeometry(),
      isInstanced: true
    });
  }

  draw({uniforms}) {
    const {
      cellSize,
      offset,
      extruded,
      elevationScale,
      coverage,
      gridSize,
      gridOrigin,
      gridOffset,
      elevationRange,
      colorMaxMinBuffer,
      elevationMaxMinBuffer
    } = this.props;

    const gridOriginLow = [fp64LowPart(gridOrigin[0]), fp64LowPart(gridOrigin[1])];
    const gridOffsetLow = [fp64LowPart(gridOffset[0]), fp64LowPart(gridOffset[1])];
    const domainUniforms = this.getDomainUniforms();
    const colorRange = colorRangeToFlatArray(this.props.colorRange);
    this.bindUniformBuffers(colorMaxMinBuffer, elevationMaxMinBuffer);
    this.state.model
      .setUniforms(uniforms)
      .setUniforms(domainUniforms)
      .setUniforms({
        cellSize,
        offset,
        extruded,
        elevationScale,
        coverage,
        gridSize,
        gridOrigin,
        gridOriginLow,
        gridOffset,
        gridOffsetLow,
        colorRange,
        elevationRange
      })
      .draw();
    this.unbindUniformBuffers(colorMaxMinBuffer, elevationMaxMinBuffer);
  }

  bindUniformBuffers(colorMaxMinBuffer, elevationMaxMinBuffer) {
    colorMaxMinBuffer.bind({target: GL.UNIFORM_BUFFER, index: COLOR_DATA_UBO_INDEX});
    elevationMaxMinBuffer.bind({target: GL.UNIFORM_BUFFER, index: ELEVATION_DATA_UBO_INDEX});
  }

  unbindUniformBuffers(colorMaxMinBuffer, elevationMaxMinBuffer) {
    colorMaxMinBuffer.unbind({target: GL.UNIFORM_BUFFER, index: COLOR_DATA_UBO_INDEX});
    elevationMaxMinBuffer.unbind({target: GL.UNIFORM_BUFFER, index: ELEVATION_DATA_UBO_INDEX});
  }

  getDomainUniforms() {
    const {colorDomain, elevationDomain} = this.props;
    const domainUniforms: Record<string, any> = {};
    if (colorDomain !== null) {
      domainUniforms.colorDomainValid = true;
      domainUniforms.colorDomain = colorDomain;
    } else {
      domainUniforms.colorDomainValid = false;
    }
    if (elevationDomain !== null) {
      domainUniforms.elevationDomainValid = true;
      domainUniforms.elevationDomain = elevationDomain;
    } else {
      domainUniforms.elevationDomainValid = false;
    }
    return domainUniforms;
  }

  private _setupUniformBuffer(model: Model): void {
    const gl = this.context.gl as WebGL2RenderingContext;
    const programHandle = model.program.handle;

    const colorIndex = gl.getUniformBlockIndex(programHandle, 'ColorData');
    const elevationIndex = gl.getUniformBlockIndex(programHandle, 'ElevationData');
    gl.uniformBlockBinding(programHandle, colorIndex, COLOR_DATA_UBO_INDEX);
    gl.uniformBlockBinding(programHandle, elevationIndex, ELEVATION_DATA_UBO_INDEX);
  }
}
