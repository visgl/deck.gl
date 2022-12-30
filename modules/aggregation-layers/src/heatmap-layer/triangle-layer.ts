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

import type {Device} from '@luma.gl/api';
import {GL, Model, Texture2D} from '@luma.gl/webgl-legacy';
import {Geometry} from '@luma.gl/engine';
import {Layer, LayerContext, project32} from '@deck.gl/core';
import vs from './triangle-layer-vertex.glsl';
import fs from './triangle-layer-fragment.glsl';

type _TriangleLayerProps = {
  colorDomain: number[];
  aggregationMode: string;
  threshold: number;
  intensity: number;
  vertexCount: number;
  colorTexture: Texture2D;
  maxTexture: Texture2D;
  texture: Texture2D;
};

export default class TriangleLayer extends Layer<_TriangleLayerProps> {
  static layerName = 'TriangleLayer';

  getShaders() {
    return {vs, fs, modules: [project32]};
  }

  initializeState({device}: LayerContext): void {
    const attributeManager = this.getAttributeManager()!;
    attributeManager.add({
      positions: {size: 3, noAlloc: true},
      texCoords: {size: 2, noAlloc: true}
    });
    this.setState({
      model: this._getModel(device)
    });
  }

  _getModel(device: Device): Model {
    const {vertexCount} = this.props;

    return new Model(device, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertexCount
      })
    });
  }

  draw({uniforms}): void {
    const {model} = this.state;

    const {texture, maxTexture, colorTexture, intensity, threshold, aggregationMode, colorDomain} =
      this.props;

    model
      .setUniforms({
        ...uniforms,
        texture,
        maxTexture,
        colorTexture,
        intensity,
        threshold,
        aggregationMode,
        colorDomain
      })
      .draw();
  }
}
