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
import {Layer, LayerProps, log, picking, UpdateParameters, DefaultProps} from '@deck.gl/core';
import {defaultColorRange, colorRangeToFlatArray} from '../utils/color-utils';
import vs from './screen-grid-layer-vertex.glsl';
import fs from './screen-grid-layer-fragment.glsl';
import type {_ScreenGridLayerProps} from './screen-grid-layer';
import {ShaderModule} from '@luma.gl/shadertools';

const DEFAULT_MINCOLOR = [0, 0, 0, 0];
const DEFAULT_MAXCOLOR = [0, 255, 0, 255];
const COLOR_PROPS = ['minColor', 'maxColor', 'colorRange', 'colorDomain'];

const defaultProps: DefaultProps<ScreenGridCellLayerProps> = {
  cellSizePixels: {type: 'number', value: 100, min: 1},
  cellMarginPixels: {type: 'number', value: 2, min: 0, max: 5},

  colorDomain: null,
  colorRange: defaultColorRange
};

/** All properties supported by ScreenGridCellLayer. */
export type ScreenGridCellLayerProps<DataT = unknown> = _ScreenGridCellLayerProps<DataT> &
  LayerProps;

/** Proprties added by ScreenGridCellLayer. */
export type _ScreenGridCellLayerProps<DataT> = _ScreenGridLayerProps<DataT> & {
  maxTexture: Texture;
};

export default class ScreenGridCellLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_ScreenGridCellLayerProps<DataT>>
> {
  static layerName = 'ScreenGridCellLayer';
  static defaultProps = defaultProps;

  state!: {
    model?: Model;
  };

  getShaders(): {vs: string; fs: string; modules: ShaderModule[]} {
    return {vs, fs, modules: [picking as ShaderModule]};
  }

  initializeState() {
    const attributeManager = this.getAttributeManager()!;
    attributeManager.addInstanced({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceCounts: {size: 4, noAlloc: true}
    });
    this.setState({
      model: this._getModel()
    });
  }

  shouldUpdateState({changeFlags}) {
    // 'instanceCounts' buffer contetns change on viewport change.
    return changeFlags.somethingChanged;
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);

    const {oldProps, props, changeFlags} = params;

    const attributeManager = this.getAttributeManager()!;
    if (props.numInstances !== oldProps.numInstances) {
      attributeManager.invalidateAll();
    } else if (oldProps.cellSizePixels !== props.cellSizePixels) {
      attributeManager.invalidate('instancePositions');
    }

    this._updateUniforms(oldProps, props, changeFlags);
  }

  draw({uniforms}) {
    const {parameters, maxTexture} = this.props;
    const minColor = this.props.minColor || DEFAULT_MINCOLOR;
    const maxColor = this.props.maxColor || DEFAULT_MAXCOLOR;

    // If colorDomain not specified we use default domain [1, maxCount]
    // maxCount value will be sampled form maxTexture in vertex shader.
    const colorDomain = this.props.colorDomain || [1, 0];
    const model = this.state.model!;
    model.setUniforms(uniforms);
    model.setBindings({
      maxTexture
    });
    model.setUniforms({
      minColor,
      maxColor,
      colorDomain
    });
    model.setParameters({
      depthWriteEnabled: false,
      // How to specify depth mask in WebGPU?
      // depthMask: false,
      ...parameters
    });
    model.draw(this.context.renderPass);
  }

  calculateInstancePositions(attribute, {numInstances}) {
    const {width, height} = this.context.viewport;
    const {cellSizePixels} = this.props;
    const numCol = Math.ceil(width / cellSizePixels);

    const {value, size} = attribute;

    for (let i = 0; i < numInstances; i++) {
      const x = i % numCol;
      const y = Math.floor(i / numCol);
      value[i * size + 0] = ((x * cellSizePixels) / width) * 2 - 1;
      value[i * size + 1] = 1 - ((y * cellSizePixels) / height) * 2;
      value[i * size + 2] = 0;
    }
  }

  // Private Methods

  _getModel(): Model {
    return new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      geometry: new Geometry({
        topology: 'triangle-list',
        attributes: {
          // prettier-ignore
          positions: new Float32Array([
            0, 0, 0,
            1, 0, 0,
            1, 1, 0,
            0, 0, 0,
            1, 1, 0,
            0, 1, 0,
          ])
        }
      })
    });
  }

  _shouldUseMinMax(): boolean {
    const {minColor, maxColor, colorDomain, colorRange} = this.props;
    if (minColor || maxColor) {
      log.deprecated('ScreenGridLayer props: minColor and maxColor', 'colorRange, colorDomain')();
      return true;
    }
    // minColor and maxColor not supplied, check if colorRange or colorDomain supplied.
    // NOTE: colorDomain and colorRange are experimental features, use them only when supplied.
    if (colorDomain || colorRange) {
      return false;
    }
    // None specified, use default minColor and maxColor
    return true;
  }

  _updateUniforms(oldProps, props, changeFlags): void {
    const model = this.state.model!;
    if (COLOR_PROPS.some(key => oldProps[key] !== props[key])) {
      model.setUniforms({shouldUseMinMax: this._shouldUseMinMax()});
    }

    if (oldProps.colorRange !== props.colorRange) {
      model.setUniforms({colorRange: colorRangeToFlatArray(props.colorRange)});
    }

    if (
      oldProps.cellMarginPixels !== props.cellMarginPixels ||
      oldProps.cellSizePixels !== props.cellSizePixels ||
      changeFlags.viewportChanged
    ) {
      const {width, height} = this.context.viewport;
      const {cellSizePixels, cellMarginPixels} = this.props;
      const margin = cellSizePixels > cellMarginPixels ? cellMarginPixels : 0;

      const cellScale = new Float32Array([
        ((cellSizePixels - margin) / width) * 2,
        (-(cellSizePixels - margin) / height) * 2,
        1
      ]);
      model.setUniforms({cellScale});
    }
  }
}
