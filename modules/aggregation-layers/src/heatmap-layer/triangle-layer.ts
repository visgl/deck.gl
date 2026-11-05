// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Buffer, Device, Texture} from '@luma.gl/core';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {
  Layer,
  LayerContext,
  color,
  project32,
  _GPUVectorModel as GPUVectorModel
} from '@deck.gl/core';
import source from './triangle-layer.wgsl';
import vs from './triangle-layer-vertex.glsl';
import fs from './triangle-layer-fragment.glsl';
import {TriangleProps, triangleUniforms} from './triangle-layer-uniforms';

type _TriangleLayerProps = {
  data: {attributes: {positions: Buffer; texCoords: Buffer}};
  colorDomain: Readonly<[number, number]>;
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
    model: GPUVectorModel;
    positions: Buffer;
    texCoords: Buffer;
  };

  getShaders() {
    return super.getShaders({source, vs, fs, modules: [project32, color, triangleUniforms]});
  }

  initializeState({device}: LayerContext): void {
    this.setState({model: this._getModel(device)});
  }

  _getModel(device: Device): GPUVectorModel {
    const {vertexCount, data} = this.props;
    const bufferLayout = [
      {name: 'positions', format: 'float32x3' as const},
      {name: 'texCoords', format: 'float32x2' as const}
    ];
    const model = new GPUVectorModel(device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout,
      topology: 'triangle-strip',
      vertexCount
    });
    model.setGPUAttributes(
      {
        positions: new GPUVector({
          type: 'buffer',
          name: 'positions',
          buffer: data.attributes.positions,
          format: 'float32x3',
          length: vertexCount,
          ownsBuffer: false
        }),
        texCoords: new GPUVector({
          type: 'buffer',
          name: 'texCoords',
          buffer: data.attributes.texCoords,
          format: 'float32x2',
          length: vertexCount,
          ownsBuffer: false
        })
      },
      bufferLayout
    );
    return model;
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
