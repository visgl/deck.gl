import {ArcLayer, ArcLayerProps} from '@deck.gl/layers';
/** All properties supported by GreatCircleLayer. */
export declare type GreatCircleLayerProps<DataT = any> = ArcLayerProps<DataT>;
/** @deprecated Use ArcLayer with `greatCircle: true` instead */
export default class GreatCircleLayer<DataT = any, ExtraProps = {}> extends ArcLayer<
  DataT,
  ExtraProps
> {
  static layerName: string;
  static defaultProps: any;
}
// # sourceMappingURL=great-circle-layer.d.ts.map
