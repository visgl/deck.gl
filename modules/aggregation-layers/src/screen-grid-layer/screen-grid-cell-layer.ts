// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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

import {Texture} from '@luma.gl/core';
import {Model, Geometry} from '@luma.gl/engine';
import {Layer, picking, UpdateParameters, DefaultProps, Color} from '@deck.gl/core';
import {createColorRangeTexture, updateColorRangeTexture} from '../common/utils/color-utils';
import vs from './screen-grid-layer-vertex.glsl';
import fs from './screen-grid-layer-fragment.glsl';
import {ScreenGridProps, screenGridUniforms} from './screen-grid-layer-uniforms';
import {ShaderModule} from '@luma.gl/shadertools';
import type {ScaleType} from '../common/types';

/** Proprties added by ScreenGridCellLayer. */
export type _ScreenGridCellLayerProps = {
  cellSizePixels: number;
  cellMarginPixels: number;
  colorScaleType: ScaleType;
  colorDomain: () => [number, number];
  colorRange?: Color[];
};

export default class ScreenGridCellLayer<ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_ScreenGridCellLayerProps>
> {
  static layerName = 'ScreenGridCellLayer';

  state!: {
    model?: Model;
    colorTexture: Texture;
  };

  getShaders(): {vs: string; fs: string; modules: ShaderModule[]} {
    return super.getShaders({vs, fs, modules: [picking, screenGridUniforms]});
  }

  initializeState() {
    this.getAttributeManager()!.addInstanced({
      instancePositions: {
        size: 2,
        type: 'float32',
        accessor: 'getBin'
      },
      instanceWeights: {
        size: 1,
        type: 'float32',
        accessor: 'getWeight'
      }
    });

    this.state.model = this._getModel();
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);

    const {props, oldProps, changeFlags} = params;
    const model = this.state.model!;

    if (oldProps.colorRange !== props.colorRange) {
      this.state.colorTexture?.destroy();
      this.state.colorTexture = createColorRangeTexture(
        this.context.device,
        props.colorRange,
        props.colorScaleType
      );
      const screenGridProps: Partial<ScreenGridProps> = {colorRange: this.state.colorTexture};
      model.shaderInputs.setProps({screenGrid: screenGridProps});
    } else if (oldProps.colorScaleType !== props.colorScaleType) {
      updateColorRangeTexture(this.state.colorTexture, props.colorScaleType);
    }

    if (
      oldProps.cellMarginPixels !== props.cellMarginPixels ||
      oldProps.cellSizePixels !== props.cellSizePixels ||
      changeFlags.viewportChanged
    ) {
      const {width, height} = this.context.viewport;
      const {cellSizePixels: gridSize, cellMarginPixels} = this.props;
      const cellSize = Math.max(gridSize - cellMarginPixels, 0);

      const screenGridProps: Partial<ScreenGridProps> = {
        gridSizeClipspace: [(gridSize / width) * 2, (gridSize / height) * 2],
        cellSizeClipspace: [(cellSize / width) * 2, (cellSize / height) * 2]
      };
      model.shaderInputs.setProps({screenGrid: screenGridProps});
    }
  }

  finalizeState(context) {
    super.finalizeState(context);

    this.state.colorTexture?.destroy();
  }

  draw({uniforms}) {
    const colorDomain = this.props.colorDomain();
    const model = this.state.model!;

    const screenGridProps: Partial<ScreenGridProps> = {colorDomain};
    model.shaderInputs.setProps({screenGrid: screenGridProps});
    model.draw(this.context.renderPass);
  }

  // Private Methods

  _getModel(): Model {
    return new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      geometry: new Geometry({
        topology: 'triangle-strip',
        attributes: {
          positions: {
            value: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
            size: 2
          }
        }
      }),
      isInstanced: true
    });
  }
}
