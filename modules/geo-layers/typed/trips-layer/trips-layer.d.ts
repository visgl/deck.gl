import type {NumericArray} from '@math.gl/core';
import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import {PathLayer, PathLayerProps} from '@deck.gl/layers';
/** All properties supported by TripsLayer. */
export declare type TripsLayerProps<DataT = any> = _TripsLayerProps<DataT> & PathLayerProps<DataT>;
/** Properties added by TripsLayer. */
declare type _TripsLayerProps<DataT = any> = {
  /**
   * Whether or not the path fades out.
   * @default true
   */
  fadeTrail?: boolean;
  /**
   * Trail length.
   * @default 120
   */
  trailLength?: number;
  /**
   * The current time of the frame.
   * @default 0
   */
  currentTime?: number;
  /**
   * Timestamp accessor.
   */
  getTimestamps?: AccessorFunction<DataT, NumericArray>;
};
/** Render animated paths that represent vehicle trips. */
export default class TripsLayer<DataT = any, ExtraProps = {}> extends PathLayer<
  DataT,
  Required<_TripsLayerProps> & ExtraProps
> {
  static layerName: string;
  static defaultProps: DefaultProps<TripsLayerProps<any>>;
  getShaders(): any;
  initializeState(): void;
  draw(params: any): void;
}
export {};
// # sourceMappingURL=trips-layer.d.ts.map
