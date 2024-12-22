import {Layer, LayerProps, DefaultProps} from '@deck.gl/core';
import {Model, Buffer} from '@luma.gl/webgl-legacy';
import type {_GPUGridLayerProps} from './gpu-grid-layer';
declare type _GPUGridCellLayerProps = _GPUGridLayerProps<any> & {
  offset: number[];
  gridSize: number[];
  gridOrigin: number[];
  gridOffset: number[];
  colorMaxMinBuffer: Buffer;
  elevationMaxMinBuffer: Buffer;
};
export default class GPUGridCellLayer extends Layer<_GPUGridCellLayerProps> {
  static layerName: string;
  static defaultProps: DefaultProps<
    _GPUGridLayerProps<any> & {
      offset: number[];
      gridSize: number[];
      gridOrigin: number[];
      gridOffset: number[];
      colorMaxMinBuffer: Buffer;
      elevationMaxMinBuffer: Buffer;
    } & LayerProps<any>
  >;
  getShaders(): any;
  initializeState(): void;
  _getModel(): Model;
  draw({uniforms}: {uniforms: any}): void;
  bindUniformBuffers(colorMaxMinBuffer: any, elevationMaxMinBuffer: any): void;
  unbindUniformBuffers(colorMaxMinBuffer: any, elevationMaxMinBuffer: any): void;
  getDomainUniforms(): Record<string, any>;
  private _setupUniformBuffer;
}
export {};
// # sourceMappingURL=gpu-grid-cell-layer.d.ts.map
