import IconLayer from '../../icon-layer/icon-layer';
import type {IconLayerProps} from '../../icon-layer/icon-layer';
import type {Accessor, Color, UpdateParameters, DefaultProps} from '@deck.gl/core';
declare type _MultiIconLayerProps<DataT> = {
  getIconOffsets?: Accessor<DataT, number[]>;
  sdf?: boolean;
  smoothing?: number;
  outlineWidth?: number;
  outlineColor?: Color;
};
export declare type MultiIconLayerProps<DataT = any> = _MultiIconLayerProps<DataT> &
  IconLayerProps<DataT>;
export default class MultiIconLayer<DataT, ExtraPropsT = {}> extends IconLayer<
  DataT,
  ExtraPropsT & Required<_MultiIconLayerProps<DataT>>
> {
  static defaultProps: DefaultProps<MultiIconLayerProps<any>>;
  static layerName: string;
  state: IconLayer['state'] & {
    outlineColor: Color;
  };
  getShaders(): any;
  initializeState(): void;
  updateState(params: UpdateParameters<this>): void;
  draw(params: any): void;
  protected getInstanceOffset(icons: string): number[];
  getInstanceColorMode(icons: string): number;
  getInstanceIconFrame(icons: string): number[];
}
export {};
// # sourceMappingURL=multi-icon-layer.d.ts.map
