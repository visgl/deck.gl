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

import type {Buffer, Device, Texture} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {Layer, LayerContext, picking, project32} from '@deck.gl/core';
import vs from './triangle-layer-vertex.glsl';
import fs from './triangle-layer-fragment.glsl';
import {getBufferData} from './heatmap-layer-utils';

type _TriangleLayerProps = {
  colorDomain: number[];
  aggregationMode: string;
  threshold: number;
  intensity: number;
  vertexCount: number;
  colorTexture: Texture;
  maxTexture: Texture;
  weightsTexture: Texture;
};

export default class TriangleLayer extends Layer<_TriangleLayerProps> {
  static layerName = 'TriangleLayer';

  state!: {
    model: Model;
    positions: Buffer;
    texCoords: Buffer;
  };

  getShaders() {
    // TODO(donmccurdy): Including 'picking' fixes errors, but I'm not sure
    // heatmap-layer really supports picking?
    return {vs, fs, modules: [project32, picking]};
  }

  initializeState({device}: LayerContext): void {
    console.log('TriangleLayer#initializeState()'); // TODO(donmccurdy): DO NOT SUBMIT.
    this.setState({model: this._getModel(device)});
  }

  _getModel(device: Device): Model {
    console.log('TriangleLayer#_getModel()'); // TODO(donmccurdy): DO NOT SUBMIT.

    const attributeManager = this.getAttributeManager()!;
    const {vertexCount, data, weightsTexture, maxTexture, colorTexture} = this.props;

    // TODO(donmccurdy): This is probably doing nothing unless passed to the Model?
    attributeManager.add({
      positions: {size: 3, noAlloc: true},
      texCoords: {size: 2, noAlloc: true}
    });

    // TODO(donmccurdy): cleanup.
    console.log({
      // weightsTexture: weightsTexture.
      triangleAttributes: (Object.entries((data as any).attributes) as any).map(
        ([name, buffer]: [string, Buffer]) => [name, getBufferData(buffer, Float32Array)]
      )
    });

    return new Model(device, {
      ...(this.getShaders() as any),
      id: this.props.id,
      bindings: {weightsTexture, maxTexture, colorTexture}, // TODO(donmccurdy): required?
      attributes: (data as any).attributes, // TODO(donmccurdy): types.
      bufferLayout: [
        {name: 'positions', format: 'float32x3'},
        {name: 'texCoords', format: 'float32x2'}
      ],
      topology: 'triangle-fan-webgl',
      vertexCount

      // TODO(donmccurdy): Equivalent?
      // geometry: new Geometry({
      //   topology: 'triangle-fan-webgl',
      //   vertexCount
      // })
    });
  }

  draw({uniforms}): void {
    const {model} = this.state;

    const {
      weightsTexture,
      maxTexture,
      colorTexture,
      intensity,
      threshold,
      aggregationMode,
      colorDomain
    } = this.props;

    console.log('triangle:draw'); // TODO(donmccurdy)

    model.setUniforms({
      ...uniforms,
      intensity,
      threshold,
      aggregationMode,
      colorDomain
    });
    model.setBindings({weightsTexture, maxTexture, colorTexture});
    model.draw(this.context.renderPass);
  }
}
