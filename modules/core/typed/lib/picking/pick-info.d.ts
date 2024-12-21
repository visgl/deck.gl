import type Layer from '../layer';
import type Viewport from '../../viewports/viewport';
import type {PickedPixel} from './query-object';
export interface PickingInfo {
  color: Uint8Array | null;
  layer: Layer | null;
  sourceLayer?: Layer | null;
  viewport?: Viewport;
  index: number;
  picked: boolean;
  object?: any;
  x: number;
  y: number;
  pixel?: [number, number];
  coordinate?: number[];
  devicePixel?: [number, number];
  pixelRatio: number;
}
export interface GetPickingInfoParams {
  info: PickingInfo;
  mode: string;
  sourceLayer: Layer | null;
}
/** Generates some basic information of the picking action: x, y, coordinates etc.
 * Regardless if anything is picked
 */
export declare function getEmptyPickingInfo({
  pickInfo,
  viewports,
  pixelRatio,
  x,
  y,
  z
}: {
  pickInfo?: PickedPixel;
  viewports: Viewport[];
  pixelRatio: number;
  x: number;
  y: number;
  z?: number;
}): PickingInfo;
/** Generates the picking info of a picking operation */
export declare function processPickInfo(opts: {
  pickInfo: PickedPixel;
  lastPickedInfo: {
    index: number;
    layerId: string | null;
    info: PickingInfo | null;
  };
  mode: string;
  layers: Layer[];
  viewports: Viewport[];
  pixelRatio: number;
  x: number;
  y: number;
  z?: number;
}): Map<string | null, PickingInfo>;
/** Walk up the layer composite chain to populate the info object */
export declare function getLayerPickingInfo({
  layer,
  info,
  mode
}: {
  layer: Layer;
  info: PickingInfo;
  mode: string;
}): PickingInfo;
// # sourceMappingURL=pick-info.d.ts.map
