// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Buffer, Device, Texture} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {Layer, LayerContext, project32} from '@deck.gl/core';
import vs from './triangle-layer-vertex.glsl';
import fs from './triangle-layer-fragment.glsl';
import {TriangleProps, triangleUniforms} from './triangle-layer-uniforms';

type _TriangleLayerProps = {
  data: {attributes: {positions: Buffer; texCoords: Buffer}};
  colorDomain: [number, number];
  aggregationMode: number;
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
    return super.getShaders({vs, fs, modules: [project32, triangleUniforms]});
  }

  initializeState({device}: LayerContext): void {
    this.setState({model: this._getModel(device)});
  }

  _getModel(device: Device): Model {
    const {vertexCount, data} = this.props;

    return new Model(device, {
      ...this.getShaders(),
      id: this.props.id,
      attributes: data.attributes,
      bufferLayout: [
        {name: 'positions', format: 'float32x3'},
        {name: 'texCoords', format: 'float32x2'}
      ],
      topology: 'triangle-strip',
      vertexCount
    });
  }

  draw(): void {
    const {model} = this.state;
    const {
      aggregationMode,
      colorDomain,
      intensity,
      threshold,
      colorTexture,
      maxTexture,
      weightsTexture
    } = this.props;
    const triangleProps: TriangleProps = {
      aggregationMode,
      colorDomain,
      intensity,
      threshold,
      colorTexture,
      maxTexture,
      weightsTexture
    };
    model.shaderInputs.setProps({triangle: triangleProps});
    model.draw(this.context.renderPass);
  }
}
