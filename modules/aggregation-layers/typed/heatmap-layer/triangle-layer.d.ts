import type {Device} from '@luma.gl/api';
import {Model, Texture2D} from '@luma.gl/webgl-legacy';
import {Layer, LayerContext} from '@deck.gl/core';
declare type _TriangleLayerProps = {
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
  static layerName: string;
  getShaders(): {
    vs: string;
    fs: string;
    modules: import('@deck.gl/core')._ShaderModule<any>[];
  };
  initializeState({device}: LayerContext): void;
  _getModel(device: Device): Model;
  draw({uniforms}: {uniforms: any}): void;
}
export {};
// # sourceMappingURL=triangle-layer.d.ts.map
