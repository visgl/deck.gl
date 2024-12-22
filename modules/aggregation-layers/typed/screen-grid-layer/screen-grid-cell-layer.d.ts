import {Device} from '@luma.gl/api';
import {Model, Texture2D} from '@luma.gl/webgl-legacy';
import {Layer, LayerProps, UpdateParameters, DefaultProps} from '@deck.gl/core';
import type {_ScreenGridLayerProps} from './screen-grid-layer';
/** All properties supported by ScreenGridCellLayer. */
export declare type ScreenGridCellLayerProps<DataT = any> = _ScreenGridCellLayerProps<DataT> &
  LayerProps<DataT>;
/** Proprties added by ScreenGridCellLayer. */
export declare type _ScreenGridCellLayerProps<DataT> = _ScreenGridLayerProps<DataT> & {
  maxTexture: Texture2D;
};
export default class ScreenGridCellLayer<DataT = any, ExtraPropsT = {}> extends Layer<
  ExtraPropsT & Required<_ScreenGridCellLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<ScreenGridCellLayerProps<any>>;
  static isSupported(device: Device): boolean;
  state: Layer['state'] & {
    model: Model;
  };
  getShaders(): {
    vs: string;
    fs: string;
    modules: import('@deck.gl/core')._ShaderModule<{
      pickingSelectedColor?: [number, number, number];
      pickingHighlightColor?: [number, number, number, number];
      pickingActive?: boolean;
      pickingAttribute?: boolean;
    }>[];
  };
  initializeState(): void;
  shouldUpdateState({changeFlags}: {changeFlags: any}): any;
  updateState(params: UpdateParameters<this>): void;
  draw({uniforms}: {uniforms: any}): void;
  calculateInstancePositions(
    attribute: any,
    {
      numInstances
    }: {
      numInstances: any;
    }
  ): void;
  _getModel(): Model;
  _shouldUseMinMax(): boolean;
  _updateUniforms(oldProps: any, props: any, changeFlags: any): void;
}
// # sourceMappingURL=screen-grid-cell-layer.d.ts.map
